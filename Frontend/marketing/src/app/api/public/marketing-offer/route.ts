import { NextResponse } from "next/server";
import { readStarterFirstMonthFreeEnabled } from "@/lib/read-starter-first-month-free";

export const dynamic = "force-dynamic";

/**
 * Public read of billing promo mode for marketing UI (no auth).
 * Cached briefly at the edge/CDN is OK; flag changes should propagate within ~1m of deploy/ops toggle.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const starterFirstMonthFree = await readStarterFirstMonthFreeEnabled();
    const starterTrialDays = starterFirstMonthFree ? 30 : 7;
    return NextResponse.json(
      { starterFirstMonthFree, starterTrialDays },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { starterFirstMonthFree: true, starterTrialDays: 30 },
      {
        headers: { "Cache-Control": "public, max-age=30" },
      },
    );
  }
}
