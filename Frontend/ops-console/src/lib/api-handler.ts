import { NextRequest, NextResponse } from "next/server";
import { getRequestId } from "./request-id";
import { standardHeaders, BaseError, logger } from "@vayva/shared";
import { rateLimit } from "@vayva/shared/rateLimit";
import { prisma, OpsUser } from "@vayva/db";
import { OpsAuthService } from "./ops-auth";

export interface OpsAPIContext {
  user: OpsUser;
  permissions: string[];
  requestId: string;
  ip: string | null;
  userAgent: string | null;
  params: Record<string, string | string[]>;
}

export type OpsAPIHandler = (
  req: NextRequest,
  context: OpsAPIContext,
) => Promise<NextResponse> | NextResponse;

export interface WithOpsAPIOptions {
  requiredPermission?: string;
}

/**
 * Higher-Order Function for Ops Console API Hardening.
 * Implements: Auth, Platform RBAC, Audit logging context, andrequestId tracking.
 */
export function withOpsAPI(
  handler: OpsAPIHandler,
  options: WithOpsAPIOptions = {},
) {
  return async (req: NextRequest, ...args: Array<{ params?: Record<string, string | string[]> }>) => {
    const requestId = await getRequestId();
    const startTime = Date.now();
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Extract params from args (Next.js App Router passing { params })
    const contextObj = args[0] || {};
    const params = contextObj.params || {};

    try {
      // 1. Authenticate Ops User
      const authContext = await OpsAuthService.requireSession();
      const { user } = authContext;

      // 2. Check Platform Permissions
      (OpsAuthService as any).requireRole(user, options.requiredPermission!);

      // 3. Rate Limiting (Redis-based)
      // For ops, we can limit by user ID or IP
      const limitKey = user ? `ops:user:${user.id}` : `ops:ip:${ip}`;
      const rl = await rateLimit(limitKey, 100, 60); // Standard ops limit: 100/min

      if (!rl.ok) {
        // 44.6: Abuse Telemetry
        await prisma.auditLog
          .create({
            data: {
              app: "ops",
              action: "RATE_LIMIT_BLOCKED",
              targetType: "user",
              targetId: user?.id || "anonymous",
              severity: "WARN",
              ip: ip || undefined,
              requestId,
              metadata: {
                endpoint: req.nextUrl.pathname,
                method: req.method,
                limit: 100,
              },
            },
          })
          .catch(() => {});

        return NextResponse.json(
          {
            error: { code: "RATE_LIMITED", message: "Too Many Requests" },
            requestId,
            retryAfter: rl.retryAfterSec,
          },
          {
            status: 429,
            headers: {
              ...standardHeaders(requestId),
              "Retry-After": String(rl.retryAfterSec),
            },
          },
        );
      }

      // 4. Prepare Context
      const apiContext: OpsAPIContext = {
        user,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // OpsUser might not have permissions field if it's dynamic
        permissions: [],
        requestId,
        ip,
        userAgent,
        params,
      };

      // 5. Call Handler
      const response = await handler(req, apiContext);

      // 5. Performance Instrumentation
      const durationMs = Date.now() - startTime;
      if (durationMs > 1000) {
        logger.warn("Slow Ops API request", {
          requestId,
          userId: user.id,
          route: req.nextUrl.pathname,
          method: req.method,
          durationMs,
          app: "ops",
        });
      }

      // 6. Force Security Headers
      const finalHeaders = standardHeaders(requestId);
      Object.entries(finalHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;

      if (
        errMsg === "Unauthorized" ||
        errMsg.includes("Insufficient permissions")
      ) {
        logger.warn("Ops Permission Denied", {
          requestId,
          endpoint: req.nextUrl.pathname,
          method: req.method,
          app: "ops",
          error: errMsg,
        });
        return NextResponse.json(
          { error: { code: "UNAUTHORIZED", message: errMsg }, requestId },
          { status: 401, headers: standardHeaders(requestId) },
        );
      }

      if (error instanceof BaseError) {
        logger.warn("Ops API business error", {
          requestId,
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          app: "ops",
          durationMs,
        });
        return NextResponse.json(
          { error: { code: error.code, message: error.message }, requestId },
          { status: error.statusCode, headers: standardHeaders(requestId) },
        );
      }

      logger.error("Unhandled Ops API Error", {
        error: errMsg,
        stack: errStack,
        requestId,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        app: "ops",
        durationMs,
      });

      return NextResponse.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          },
          requestId,
        },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  };
}
