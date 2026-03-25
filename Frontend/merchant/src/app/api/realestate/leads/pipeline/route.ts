import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/realestate/leads/pipeline - Get lead pipeline statistics
export async function GET(request: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const type = searchParams.get("type");

    const queryParams = new URLSearchParams();
    if (agentId) queryParams.set("agentId", agentId);
    if (type) queryParams.set("type", type);

    const result = await apiJson<{
      success: boolean;
      data?: {
        summary: {
          totalLeads: number;
          convertedLeads: number;
          conversionRate: number;
          newLeadsLast7Days: number;
          contactedLast7Days: number;
        };
        byStatus: Record<string, { count: number; percentage: number }>;
        detailedPipeline: Array<{
          stage: string;
          count: number;
          leads: unknown[];
          totalBudget: number;
          avgBudget: number;
        }>;
        stages: string[];
      };
      error?: string;
    }>(`${buildBackendUrl("/api/realestate/leads/pipeline")}?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/realestate/leads/pipeline",
      operation: "GET_LEAD_PIPELINE",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to fetch lead pipeline" },
      { status: 500 }
    );
  }
}
