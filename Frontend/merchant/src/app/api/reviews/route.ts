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
    // Call backend API to fetch reviews
        const result = await apiJson<{
            success: boolean;
            data: Array<{
                id: string;
                rating: number;
                title: string;
                status: string;
                customerName: string;
                product: string;
                createdAt: Date;
            }>;
        }>(
            `${process.env.BACKEND_API_URL}/api/reviews`,
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
    handleApiError(error, { endpoint: "/api/reviews", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
