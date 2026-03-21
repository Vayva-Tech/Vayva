// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/billing/upgrade - Get upgrade options and current billing status
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      success: boolean;
      data?: { plans: Array<{ id: string; name: string; price: number }>; currentPlan?: string };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/billing/upgrade`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/billing/upgrade",
      operation: "GET_UPGRADE_OPTIONS",
    });
    return NextResponse.json(
      { error: "Failed to fetch upgrade options" },
      { status: 500 }
    );
  }
}
