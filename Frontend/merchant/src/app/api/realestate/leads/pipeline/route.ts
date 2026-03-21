// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/realestate/leads/pipeline - Get lead pipeline statistics
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const type = searchParams.get("type");

    const queryParams = new URLSearchParams();
    if (agentId) queryParams.set("agentId", agentId);
    if (type) queryParams.set("type", type);

    const result = await apiJson<{
      success: boolean;
      data?: {
        summary: { totalLeads: number; convertedLeads: number; conversionRate: number; newLeadsLast7Days: number; contactedLast7Days: number };
        byStatus: Record<string, { count: number; percentage: number }>;
        detailedPipeline: Array<{ stage: string; count: number; leads: any[]; totalBudget: number; avgBudget: number }>;
        stages: string[];
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/realestate/leads/pipeline?${queryParams.toString()}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/realestate/leads/pipeline",
      operation: "GET_LEAD_PIPELINE",
    });
    return NextResponse.json(
      { error: "Failed to fetch lead pipeline" },
      { status: 500 }
    );
  }
}
