import { NextRequest, NextResponse } from "next/server";

// GET /api/dashboard/sidebar-counts - Get pending/unread counts for sidebar nav items
export async function GET(_request: NextRequest) {
  try {
    // TODO: Wire to real aggregation queries when backend supports it.
    // Each key is a normalized sidebar path (e.g. "/dashboard/orders"),
    // each value is the pending / unread count to display as a badge.
    const counts: Record<string, number> = {};

    return NextResponse.json({ data: counts });
  } catch {
    return NextResponse.json({ data: {} });
  }
}
