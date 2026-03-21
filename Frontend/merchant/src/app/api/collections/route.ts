// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = Math.min(
            parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10),
            MAX_PAGE_SIZE
        );

        // Call backend API to fetch collections
        const result = await apiJson<{
            success: boolean;
            data: Array<{
                id: string;
                name: string;
                handle: string;
                count: number;
                visibility: string;
                updated: string;
            }>;
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        }>(
            `${process.env.BACKEND_API_URL}/api/collections?page=${page}&limit=${limit}`,
      {
                headers: {
                    "x-store-id": storeId,
                },
            }
        );
        
        return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/collections", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
