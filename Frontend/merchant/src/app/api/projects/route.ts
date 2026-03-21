import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);

    // Call backend API to fetch projects
    const result = await apiJson<{
      projects: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        status: string;
        productImages: Array<{ id: string; url: string; position: number }>;
        createdAt: Date;
      }>;
    }>(
      `${process.env.BACKEND_API_URL}/api/projects?limit=${limit}`,
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
    handleApiError(error, {
      endpoint: '/api/projects',
      operation: 'GET_PROJECTS',
      storeId,
    });
    throw error;
  }
}
