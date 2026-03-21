import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
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
    const body = await request.json();
    
    // Forward error report to backend for centralized tracking
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/error-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to log error report');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/error-report",
        operation: "LOG_CLIENT_ERROR",
      }
    );
    // Silent fail - don't let error reporting cause more errors
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
