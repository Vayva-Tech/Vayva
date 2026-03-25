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
    // Call backend API to fetch knowledge base entries
        const result = await apiJson<{
            data: Array<{
                id: string;
                storeId: string;
                question: string;
                answer: string;
                category?: string;
                tags?: string[];
                createdAt: Date;
                updatedAt: Date;
            }>;
        }>(
            `${process.env.BACKEND_API_URL}/api/seller/ai/knowledge-base`,
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
    handleApiError(error, { endpoint: "/api/seller/ai/knowledge-base", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
