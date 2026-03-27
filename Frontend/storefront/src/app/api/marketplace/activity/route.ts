import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

interface ActivityItem {
  id: string;
  iconKey: string;
  text: string;
  timestamp: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 20);

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Call backend marketplace activity endpoint
    const response = await apiClient.publicGet<any>('/api/v1/marketplace/activity', {
      storeId,
      limit: limit.toString(),
    });

    return NextResponse.json({ activities: response.data.activities || [] });
  } catch (error) {
    console.error("[MARKETPLACE_ACTIVITY] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
