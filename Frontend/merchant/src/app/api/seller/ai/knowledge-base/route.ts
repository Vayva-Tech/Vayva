import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
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
                headers: {
                    "x-store-id": storeId,
                },
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
