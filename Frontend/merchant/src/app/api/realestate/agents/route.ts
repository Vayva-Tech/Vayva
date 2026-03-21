// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/realestate/agents - Get real estate agents
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") || "50";
    const page = searchParams.get("page") || "1";

    const queryParams = new URLSearchParams();
    if (status) queryParams.set("status", status);
    queryParams.set("limit", limit);
    queryParams.set("page", page);

    const result = await apiJson<{
      success: boolean;
      data?: {
        agents: any[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/realestate/agents?${queryParams.toString()}`, {
      headers: { "x-store-id": storeId },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/realestate/agents",
      operation: "GET_AGENTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
