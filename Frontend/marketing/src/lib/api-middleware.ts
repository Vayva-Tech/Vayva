// API Middleware
import { NextRequest, NextResponse } from "next/server";
import { urls } from "@vayva/shared";
import { rateLimit as memoryRateLimit } from "@/lib/ratelimit";

export type MiddlewareHandler = (req: NextRequest) => Promise<NextResponse | null>;

export function composeMiddleware(...handlers: MiddlewareHandler[]) {
  return async (req: NextRequest) => {
    for (const handler of handlers) {
      const result = await handler(req);
      if (result) return result;
    }
    return null;
  };
}

export function withCORS(handler: (req: NextRequest) => Promise<NextResponse | Response>) {
  return async (req: NextRequest) => {
    const response = await handler(req);
    if (response instanceof NextResponse) {
      // Only allow specific origins
      const allowedOrigins = [
        ...new Set(
          [
            process.env.NEXT_PUBLIC_APP_URL,
            process.env.NEXT_PUBLIC_MERCHANT_URL,
            urls.marketingBase(),
            "https://vayva.ng",
            "https://www.vayva.ng",
          ].filter(Boolean) as string[],
        ),
      ];
      
      const origin = req.headers.get('origin');
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Vary', 'Origin');
    }
    return response;
  };
}

export function withLogging(handler: (req: NextRequest) => Promise<NextResponse | Response>) {
  return async (req: NextRequest) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console -- request tracing in dev only
      console.log(`${req.method} ${req.url}`);
    }
    return handler(req);
  };
}

export function createAPIResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleAPIError(error: unknown) {
  // eslint-disable-next-line no-console -- surfaced to API caller; log for ops
  console.error("API Error:", error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Internal Server Error' },
    { status: 500 }
  );
}

export const rateLimit = memoryRateLimit;

export const errorHandler = {
  handle: (error: unknown) => handleAPIError(error)
};
