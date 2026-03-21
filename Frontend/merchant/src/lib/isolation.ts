/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { logger } from "@vayva/shared";
import { requireAuth } from "@/lib/session.server";
/**
 * Higher-Order Function for Merchant Admin API Routes.
 * Automatically verifies that the user is authenticated and is operating
 * within their assigned store boundaries.
 *
 * @param handler API handler receiving the authenticated session
 */
export function withTenantIsolation(
  handler: (...args: any[]) => Promise<Response>,
) {
    return async (request: Request, ...args: any[]) => {
    try {
      const session = await requireAuth();
      // If the URL contains a storeId (e.g. /api/store/[storeId]/...), verify it
      const { searchParams } = new URL(request.url);
      const urlStoreId = searchParams.get("storeId");
      if (urlStoreId && urlStoreId !== session.storeId) {
        logger.warn(
          `[Security Alert]: Tenant isolation breach attempt by user ${session.id} for store ${urlStoreId}`,
          {
            userId: session.id,
            requestedStoreId: urlStoreId,
            app: "merchant",
          },
        );
        return NextResponse.json(
          { error: "Forbidden: Tenant isolation breach" },
          { status: 403 },
        );
      }
      // Note: For POST/PUT/PATCH, body validation should be done within the handler
      // using session.storeId to override any user-provided storeId.
      // Rate Limiting
      const method = request.method;
      const limitType =
        method === "GET" || method === "HEAD" ? "api_read" : "api_write";
      // Only rate limit if not running in development/test to facilitate local dev flow
      // OR if strictly enforcing
      if (process.env.NODE_ENV !== "test") {
        const { checkRateLimit } = await import("@/lib/security/rate-limit"); // Dynamic import to avoid edge bundling issues if reused
        const result = await checkRateLimit(session.storeId, limitType);
        if (!result.success) {
          return NextResponse.json(
            {
              error: "Too Many Requests",
              retryAfter: result.reset,
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": result.limit.toString(),
                "X-RateLimit-Remaining": result.remaining.toString(),
                "X-RateLimit-Reset": result.reset.toString(),
              },
            },
          );
        }
      }
      return await handler(session, request, ...args);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      logger.error("[TenantIsolation Error]:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
