import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    // Call backend API to fetch shipping settings
    const zones = await apiJson<Array<{
        id: string;
        name: string;
        regions: string[];
        rates: Array<{
            id: string;
            name: string;
            amount: number;
            minDays: number;
            maxDays: number;
        }>;
    }>>(
        `${process.env.BACKEND_API_URL}/api/settings/shipping`,
        {
            headers: auth.headers,
        }
    );

    return NextResponse.json(zones, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
  } catch (error) {
    handleApiError(
        error,
        {
            endpoint: "/settings/shipping",
            operation: "GET_SHIPPING",
        }
    );
    return NextResponse.json({ error: "Failed to fetch shipping settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const zones = await request.json();

    // Call backend API to update shipping settings
    const result = await apiJson<{ success: boolean }>(
        `${process.env.BACKEND_API_URL}/api/settings/shipping`,
        {
            method: "POST",
            headers: auth.headers,
            body: JSON.stringify({ zones }),
        }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
        error,
        {
            endpoint: "/settings/shipping",
            operation: "UPDATE_SHIPPING",
        }
    );
    return NextResponse.json({ error: "Failed to update shipping settings" }, { status: 500 });
  }
}
