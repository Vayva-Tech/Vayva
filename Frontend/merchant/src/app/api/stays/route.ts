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
    const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");
        
        // Call backend API to fetch stays
        const result = await apiJson<{
            stays: Array<{
                id: string;
                title: string;
                description: string;
                price: number;
                status: string;
                image: string | null;
                type?: string;
                maxGuests?: number;
                bedCount?: number;
                bathrooms?: number;
                totalUnits?: number;
                amenities?: string[];
                createdAt: Date;
            }>;
            total: number;
        }>(
            `${process.env.BACKEND_API_URL}/api/stays?status=${status || ''}&type=${type || ''}`,
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
    handleApiError(error, { endpoint: "/stays", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
