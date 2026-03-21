import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/designer/stats`, {
      headers: { "x-store-id": storeId },
    });

    if (!result.success) {
      return NextResponse.json({
        totalEarnings: 0,
        totalDownloads: 0,
        reviewQueue: 0,
        templateCount: 0,
      }, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json(result.data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/designer/stats", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
