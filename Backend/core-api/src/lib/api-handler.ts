import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "./session.server";
import { can as checkPermission } from "./team/permissions";
import { checkRateLimit } from "./ratelimit";
import { verifyIdempotency, saveIdempotencyResponse } from "./idempotency";
import { getRequestId } from "./request-id";
import {
  validateSessionVersion,
  checkStoreStatus,
  checkStoreRestrictions,
} from "./api-checks";
import { prisma } from "@vayva/db";
import { standardHeaders, BaseError, logger } from "@vayva/shared";

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
  /**
   * Isolated Prisma Client
   * Automatically scoped to the current merchant's storeId.
   */
  db: ReturnType<typeof import("@vayva/db").getIsolatedPrisma>; // Isolated Prisma client scoped to the current merchant's storeId
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Robust Higher-Order Function for Vayva API Hardening.
 * Implements: Auth, RBAC, Tenant Isolation, Rate Limiting, Idempotency, Step-up, and Structured Logging.
 */
export function withVayvaAPI(
  permission: string | string[] | null,
  handler: (req: NextRequest, context: APIContext) => Promise<NextResponse>,
  _options: Record<string, unknown> = {},
) {
  return async (req: NextRequest, ...args: unknown[]) => {
    const requestId = await getRequestId();
    const startTime = Date.now();
    const method = req.method;
    const endpoint = req.nextUrl.pathname;
    let user: APIContext["user"] | null = null;
    try {
      // 1. Authentication & Tenant Isolation
      user = await requireAuthFromRequest(req);
      if (!user) {
        return NextResponse.json(
          {
            error: { code: "UNAUTHORIZED", message: "Unauthorized" },
            requestId,
          },
          { status: 401, headers: standardHeaders(requestId) },
        );
      }
      const authedUser: APIContext["user"] = user;
      const storeId = authedUser.storeId;

      // 1.1 Session Revocation Check
      const sessionCheck = await validateSessionVersion(
        authedUser.id,
        authedUser.sessionVersion,
        requestId,
      );
      if (!sessionCheck.valid) return sessionCheck.response!;

      // 1.2 Store Status & Settings
      const storeCheck = await checkStoreStatus(
        storeId,
        requestId,
        endpoint,
        authedUser.id,
      );
      if (!storeCheck.valid) return storeCheck.response!;

      // 1.3 Specific Restrictions
      const restrictionCheck = checkStoreRestrictions(
        method,
        endpoint,
        storeCheck.settings,
        requestId,
        authedUser.id,
        storeId,
      );
      if (restrictionCheck.restricted) return restrictionCheck.response!;

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
      const rl = await checkRateLimit(storeId, limitType);
      if (!rl.success) {
        // 44.6: Abuse Telemetry - Log repeated blocks
        if (rl.remaining === 0) {
          await prisma.auditLog
            .create({
              data: {
                app: "merchant",
                action: "RATE_LIMIT_BLOCKED",
                targetType: "store",
                targetId: storeId,
                targetStoreId: storeId,
                severity: "WARN",
                requestId,
                metadata: {
                  limitType,
                  endpoint,
                  method,
                  limit: rl.limit,
                },
              },
            })
            .catch(() => {}); // Don't fail the request if logging fails
        }

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
              "X-RateLimit-Limit": rl.limit.toString(),
              "X-RateLimit-Remaining": rl.remaining.toString(),
              "X-RateLimit-Reset": rl.reset.toString(),
              "Retry-After": rl.reset.toString(),
            },
          },
        );
      }

      // 4. Idempotency (For State-Changing Methods)
      let idempotencyKey = null;
      if (["POST", "PUT", "PATCH"].includes(method)) {
        const { cached, key } = await verifyIdempotency(req);
        if (cached) {
          logger.info("Idempotency cache hit", {
            key,
            requestId,
            app: "merchant",
          });
          // Add standard headers to the cached response
          const response = cached;
          const finalHeaders = standardHeaders(requestId);
          Object.entries(finalHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
          response.headers.set("x-idempotency-hit", "true");
          return response;
        }
        idempotencyKey = key;
      }

      // 5. Prepare Context
      const firstArg = args[0];
      const { getIsolatedPrisma } = await import("@vayva/db");
      const isolatedPrisma = getIsolatedPrisma();

      const apiContext: APIContext = {
        user: authedUser,
        storeId,
        params: (isRecord(firstArg) && firstArg.params
          ? firstArg.params
          : {}) as APIContext["params"],
        correlationId: requestId,
        db: isolatedPrisma,
      };

      // 6. Call Handler
      const response = await handler(req, apiContext);

      // 7. Save Idempotency (If successful and state-changing)
      if (idempotencyKey && response.ok) {
        const body = await response.clone().json();
        await saveIdempotencyResponse(idempotencyKey, body, response.status);
      }

      // 8. Performance Instrumentation
      const durationMs = Date.now() - startTime;
      if (durationMs > 1000) {
        logger.warn("Slow API request", {
          requestId,
          storeId,
          userId: user.id,
          route: endpoint,
          method,
          durationMs,
          app: "merchant",
        });
      }

      // 9. Inject standard headers
      const finalHeaders = standardHeaders(requestId);
      Object.entries(finalHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error: unknown) {
      const _err = error instanceof Error ? error : new Error(String(error));
      const durationMs = Date.now() - startTime;
      if (error instanceof BaseError) {
        logger.warn("API business error", {
          requestId,
          code: (error as { code?: string }).code,
          message: _err.message,
          statusCode: (error as { statusCode?: number }).statusCode,
          app: "merchant",
          durationMs,
        });
        return NextResponse.json(
          {
            error: {
              code: (error as { code?: string }).code,
              message: _err.message,
            },
            requestId,
          },
          {
            status: (error as { statusCode?: number }).statusCode,
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
