import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        
        // Call backend API to fetch vehicles
        const result = await apiJson<{
            vehicles: Array<{
                id: string;
                make: string;
                model: string;
                year: string;
                price: number;
                status: string;
                image: string | null;
                createdAt: Date;
            }>;
            total: number;
        }>(
            `${process.env.BACKEND_API_URL}/api/vehicles?status=${status || ''}`,
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
    handleApiError(error, { endpoint: "/api/vehicles", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
