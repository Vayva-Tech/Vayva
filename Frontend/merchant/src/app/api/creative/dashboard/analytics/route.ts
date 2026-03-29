import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

// GET /api/creative/dashboard/analytics
// Returns comprehensive dashboard analytics for Creative Agency
export async function GET(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: {
        activeProjectsCount: number;
        utilizationRate: number;
        revenueMTD: number;
        projectsByStage: Record<string, number>;
        teamWorkload: Array<{
          id: string;
          name: string;
          role: string;
          allocationCount: number;
          utilization: string;
        }>;
        weeklyHoursBilled: number;
        projectMargins: Array<{
          projectId: string;
          projectName: string;
          budget: number;
          stage: string;
          timeEntriesCount: number;
        }>;
      };
      error?: string;
    }>(`${backendBase()}/api/creative/dashboard/analytics`, {
      headers: auth.headers,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to fetch analytics");
    }

    return NextResponse.json({
      analytics: result.data,
    });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/creative/dashboard/analytics",
      operation: "FETCH_ANALYTICS",
    });

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch creative dashboard analytics", message: errorMessage },
      { status: 500 }
    );
  }
}
