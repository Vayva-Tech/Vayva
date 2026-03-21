/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "./session.server";
import { can as checkPermission } from "@/lib/team/permissions";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestId } from "./request-id";
import { standardHeaders, BaseError, logger } from "@vayva/shared";
import { EventBus } from "@/lib/events/eventBus"; // Skipped for now

export interface APIContext {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    storeId: string;
    storeName: string;
    role: string;
    sessionVersion: number;
  };
  storeId: string;
  params: Record<string, string> | Promise<Record<string, string>>;
  correlationId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Robust Higher-Order Function for Vayva API Hardening.
 * Adapted for Merchant Admin Next.js App Router.
 */
export function withVayvaAPI(
  permission: string | string[] | null,
  handler: (req: NextRequest, context: APIContext) => Promise<NextResponse>,
  options: Record<string, unknown> = {},
) {
  return async (req: NextRequest, ...args: any[]) => {
    const requestId = await getRequestId(); // Ensure request-id exists or implement simple version
    const startTime = Date.now();
    const method = req.method;
    const endpoint = req.nextUrl.pathname;
    let user: APIContext["user"] | null = null;
    try {
      // 1. Authentication
      user = await (requireAuthFromRequest as (req: NextRequest) => Promise<APIContext["user"] | null>)(req);
      if (!user) {
        return NextResponse.json(
          {
            error: { code: "UNAUTHORIZED", message: "Unauthorized" },
            requestId,
          },
          { status: 401, headers: standardHeaders(requestId) },
        );
      }
      const authedUser = user as APIContext["user"];
      const storeId = authedUser.storeId;

      // 2. Permission Check (RBAC)
      const permissionDenied =
        permission &&
        (Array.isArray(permission)
          ? !permission.some((p) => checkPermission(authedUser.role, p))
          : !checkPermission(authedUser.role, permission));
      if (permissionDenied) {
        logger.warn("Permission denied", {
          userId: authedUser.id,
          storeId,
          role: authedUser.role,
          permission,
          endpoint,
          requestId,
          app: "merchant",
        });
        return NextResponse.json(
          {
            error: {
              code: "PERMISSION_DENIED",
              message: "Forbidden: Insufficient permissions",
            },
            requestId,
          },
          { status: 403, headers: standardHeaders(requestId) },
        );
      }

      // 3. Rate Limiting (Redis-based)
      const limitType =
        method === "GET" || method === "HEAD" ? "api_read" : "api_write";
      const rl = await (checkRateLimit as (identifier: string, type: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number } | null>)(storeId, limitType);
      if (rl && !rl.success) {
        return NextResponse.json(
          {
            error: { code: "RATE_LIMITED", message: "Too Many Requests" },
            requestId,
            retryAfter: rl.reset,
          },
          {
            status: 429,
            headers: {
              ...standardHeaders(requestId),
              "Retry-After": rl.reset.toString(),
            },
          },
        );
      }

      // 4. Prepare Context (Frontend calls Backend APIs, no direct DB access)
      const firstArg = args[0];

      const apiContext: APIContext = {
        user: authedUser,
        storeId,
        params: (isRecord(firstArg) && firstArg.params
          ? firstArg.params
          : {}) as APIContext["params"],
        correlationId: requestId,
      };

      // 5. Call Handler
      const response = await handler(req, apiContext);

      // 6. Inject standard headers
      const finalHeaders = standardHeaders(requestId);
      Object.entries(finalHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error: unknown) {
      const _err = error instanceof Error ? error : new Error(String(error));
      const durationMs = Date.now() - startTime;

      if (error instanceof BaseError) {
        return NextResponse.json(
          {
            error: {
              code: (error as { code?: string }).code,
              message: _err.message,
            },
            requestId,
          },
          {
            status: (error as { statusCode?: number }).statusCode || 500,
            headers: standardHeaders(requestId),
          },
        );
      }

      logger.error("Unhandled API Error", {
        error: _err.message,
        stack: _err.stack,
        requestId,
        endpoint,
        method,
        app: "merchant",
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
