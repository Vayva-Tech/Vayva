import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        
        // Call backend API to fetch products
        const result = await apiJson<{
            data: Array<{
                id: string;
                merchantId: string;
                type: string;
                name: string;
                description: string;
                price: number;
                currency: string;
                status: string;
                inventory: {
                    enabled: boolean;
                    quantity: number;
                };
                itemsSold: number;
                createdAt: string;
            }>;
            meta: {
                total: number;
                limit: number;
                offset: number;
            };
        }>(
            `${process.env.BACKEND_API_URL}/api/products/items?status=${status || ''}&limit=${limit}&offset=${offset}`,
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
    handleApiError(error, { endpoint: "/api/products/items", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
