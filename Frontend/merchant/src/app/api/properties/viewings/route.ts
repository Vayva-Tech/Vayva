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
    // Call backend API to fetch viewings
        const result = await apiJson<{
            data: Array<{
                id: string;
                customer: { firstName: string; lastName: string; email: string; phone: string };
                service: { id: string; name: string };
                startsAt: Date;
                status: string;
            }>;
        }>(
            `${process.env.BACKEND_API_URL}/api/properties/viewings`,
      {
                headers: auth.headers,
            }
        );
        
        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    handleApiError(error, { endpoint: "/api/properties/viewings", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
