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
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const department = searchParams.get("department");
      const employmentType = searchParams.get("employmentType");

      // Call backend API to fetch job listings
      const result = await apiJson<{
        listings: Array<{
          id: string;
          title: string;
          department: string;
          employmentType: string;
          status: string;
          postedAt: Date;
          hiringManager: { id: string; name: string; avatar: string };
          _count: { applications: number };
        }>;
        total: number;
        stats: {
          total: number;
          active: number;
          closed: number;
          byDepartment: Record<string, number>;
        };
      }>(
        `${process.env.BACKEND_API_URL}/api/jobs/listings?limit=${limit}&offset=${offset}&status=${status || ''}&department=${department || ''}&employmentType=${employmentType || ''}`,
      {
          headers: auth.headers,
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/jobs/listings", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
