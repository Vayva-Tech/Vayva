import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        
        // Call backend API to fetch job runs
        const result = await apiJson<{
            jobs: Array<{
                id: string;
                jobName: string;
                errorType: string;
                status: string;
                startedAt: Date;
                completedAt: Date;
            }>;
        }>(
            `${process.env.BACKEND_API_URL}/api/jobs?q=${query}`,
      {
                headers: auth.headers,
            }
        );
        
        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/jobs", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
