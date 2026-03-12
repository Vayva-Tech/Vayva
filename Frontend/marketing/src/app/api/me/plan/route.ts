import { NextResponse } from "next/server";

/**
 * GET /api/me/plan
 * Returns the user's billing plan information
 * For the marketing app, users are not authenticated, so we return free tier
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Marketing app doesn't have authenticated users
    // Always return free tier for marketing site visitors
    return NextResponse.json({
      plan: "free",
      source: "marketing_default",
      isAuthenticated: false,
    });
  } catch (error: unknown) {
    console.error("Error in /api/me/plan:", error);
    return NextResponse.json(
      {
        plan: "free",
        source: "error_fallback",
        isAuthenticated: false,
      },
      { status: 200 }, // Return 200 even on error to prevent breaking the UI
    );
  }
}
