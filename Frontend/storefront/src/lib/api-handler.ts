import { NextRequest, NextResponse } from "next/server";
import { getRequestId } from "./request-id";
import { standardHeaders, BaseError, logger } from "@vayva/shared";

import { prisma, getIsolatedPrisma } from "@vayva/db";
import { getTenantFromHost } from "./tenant";

export interface StorefrontAPIContext {
  requestId: string;
  ip: string | null;
  userAgent: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;
  storeId: string;
  storeSlug: string;
  /**
   * Isolated Prisma Client
   * Automatically scoped to the current storefront's storeId.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any;
}

export type StorefrontAPIHandler = (
  req: NextRequest,
  context: StorefrontAPIContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-Order Function for Storefront API Hardening.
 * Implements: RequestId tracking, structured logging, and error taxonomy.
 */
export function withStorefrontAPI(handler: StorefrontAPIHandler) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: NextRequest, ...args: any[]) => {
    const requestId = await getRequestId();
    const startTime = Date.now();
    const ip =
      req.headers?.get("x-real-ip") ||
      req.headers?.get("x-forwarded-for")?.split(",")[0] ||
      null;
    const userAgent = req.headers?.get("user-agent") || null;

    // Extract params from args (Next.js App Router passing { params })
    const contextObj = args[0] || {};
    const params = contextObj.params || {};

    try {
      // 1. Resolve Tenant
      const t = await getTenantFromHost(req.headers?.get("host") || undefined);
      if (!t.ok) {
        return NextResponse.json(
          { error: "Store not found", requestId },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const store = await prisma.store?.findUnique({
        where: { slug: t.slug },
        select: { id: true, isLive: true },
      });

      if (!store) {
        return NextResponse.json(
          { error: "Store not found", requestId },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      if (!store.isLive) {
        logger.warn("Store is not live", { slug: t.slug, requestId });
        // Optional: Return 503 or 404 depending on business logic.
        // For now, we allow it but maybe the frontend handles maintenance mode.
        // Or we block it:
        // return NextResponse.json({ error: "Store is currently unavailable" }, { status: 503 });
      }

      // 2. Prepare Context with Isolated DB
      const isolatedDb = getIsolatedPrisma();

      const apiContext: StorefrontAPIContext = {
        requestId,
        ip,
        userAgent,
        params,
        storeId: store.id,
        storeSlug: t.slug,
        db: isolatedDb,
      };

      // 2. Call Handler
      const response = await handler(req, apiContext);

      // 3. Performance Instrumentation
      const durationMs = Date.now() - startTime;
      if (durationMs > 1000) {
        logger.warn("Slow Storefront API request", {
          requestId,
          route: req.nextUrl?.pathname,
          method: req.method,
          durationMs,
          app: "storefront",
        });
      }

      // 4. Force Security Headers
      const finalHeaders = standardHeaders(requestId);
      Object.entries(finalHeaders).forEach(([key, value]) => {response?.headers?.set(key, value);
      });

      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;

      if (error instanceof BaseError) {
        logger.warn("Storefront API business error", {
          requestId,
          code: error.code,
          message: error.message,
          statusCode: (error as any).statusCode,
          app: "storefront",
          durationMs,
        });
        return NextResponse.json(
          { error: { code: error.code, message: error.message }, requestId },
          { status: (error as any).statusCode, headers: standardHeaders(requestId) },
        );
      }

      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      logger.error("Unhandled Storefront API Error", {
        error: errMsg,
        stack: errStack,
        requestId,
        endpoint: req.nextUrl?.pathname,
        method: req.method,
        app: "storefront",
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
