import { NextResponse } from "next/server";

/**
 * Maps `OpsAuthService.requireSession` / `requireRole` failures to JSON responses.
 * Returns null if `error` is not an auth failure (caller: 500 or rethrow).
 */
export function opsApiAuthErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    error instanceof Error &&
    error.message.includes("Insufficient permissions")
  ) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return null;
}
