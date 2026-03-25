/**
 * Rate Limiting Helper for API Routes
 * Provides easy-to-use rate limiting decorators for Next.js API routes
 */

import { NextResponse } from "next/server";
import { checkRateLimit, RateLimitError } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/api-error-handler";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

const PRESETS = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  payment: { windowMs: 60 * 1000, max: 10 }, // 10 requests per minute
  api: { windowMs: 60 * 1000, max: 30 }, // 30 requests per minute
  strict: { windowMs: 60 * 1000, max: 3 }, // 3 requests per minute
};

/**
 * Extract identifier from request (IP address or user ID)
 */
function getIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

/**
 * Apply rate limiting to an API route handler
 * 
 * @param request - The incoming request
 * @param type - Rate limit type (auth, payment, api, strict)
 * @param handler - The actual route handler function
 * @returns Response from handler or rate limit error
 */
export async function withRateLimit<T extends Request>(
  request: T,
  type: keyof typeof PRESETS,
  handler: () => Promise<Response>
): Promise<Response> {
  const config = PRESETS[type];
  const identifier = getIdentifier(request);
  const routeKey = `${type}:${new URL(request.url).pathname}`;

  try {
    const result = await checkRateLimit(identifier, routeKey);
    
    if (!result.success || result.remaining < 0) {
      return NextResponse.json(
        { 
          error: config.message || "Too many requests. Please try again later.",
          retryAfter: Math.ceil(config.windowMs / 1000),
        },
        { 
          status: 429,
          headers: { 
            "Retry-After": String(Math.ceil(config.windowMs / 1000)),
            "X-RateLimit-Limit": String(config.max),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    return await handler();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { 
          error: config.message || "Too many requests. Please try again later.",
          retryAfter: Math.ceil(config.windowMs / 1000),
        },
        { 
          status: 429,
          headers: { 
            "Retry-After": String(Math.ceil(config.windowMs / 1000)),
          },
        }
      );
    }

    handleApiError(error, {
      endpoint: new URL(request.url).pathname,
      operation: `RATE_LIMIT_${type.toUpperCase()}`,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Create a custom rate limit configuration
 */
export function createRateLimit(max: number, windowSeconds: number): RateLimitConfig {
  return {
    max,
    windowMs: windowSeconds * 1000,
  };
}

export { PRESETS as RATE_LIMIT_PRESETS };
