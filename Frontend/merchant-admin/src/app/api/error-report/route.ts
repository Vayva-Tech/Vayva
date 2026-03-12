import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

interface ErrorReport {
  error: string;
  stack?: string;
  componentStack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
}

/**
 * POST /api/error-report
 * Client-side error reporting endpoint
 * In production, this would send to Sentry, Datadog, or similar
 */
export async function POST(request: NextRequest) {
  try {
    const body: ErrorReport = await request.json();
    
    // Log to server logs (in production, send to error tracking service)
    logger.error("[CLIENT_ERROR_REPORT]", { 
      error: body.error,
      url: body.url,
      timestamp: body.timestamp,
      userAgent: body.userAgent?.slice(0, 100),
    });

    // In production, you would send this to:
    // - Sentry
    // - Datadog
    // - LogRocket
    // - Custom error tracking system
    
    // Example Sentry integration:
    // Sentry.captureException(new Error(body.error), {
    //   extra: {
    //     componentStack: body.componentStack,
    //     url: body.url,
    //   },
    // });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Silent fail - don't let error reporting cause more errors
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
