// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        
        // Call backend API to fetch vehicle
        const result = await apiJson<{
            vehicle?: {
                id: string;
                name: string;
                description: string;
                price: number;
                productImages: Array<{ id: string; url: string }>;
                productVariants: Array<{ id: string; name: string }>;
            };
            error?: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/vehicles/${id}`,
      {
                headers: {
                    "x-store-id": storeId,
                },
            }
        );
        
        if (result.error) {
            return NextResponse.json(result, { status: 404 });
        }
        
        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    handleApiError(error, { endpoint: "/api/vehicles/:id", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
