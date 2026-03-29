import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    // Call backend API to fetch showcase configuration
        const result = await apiJson<{
            sectionConfig: Record<string, unknown>;
            featured?: {
                mode: string;
                autoStrategy: string;
                limit: number;
                productIds: string[];
            };
            products?: Array<{
                id: string;
                title: string;
                price: number;
                image?: string;
            }>;
        }>(
            `${process.env.BACKEND_API_URL}/api/storefront/showcase`,
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
    handleApiError(error, { endpoint: "/storefront/showcase", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
