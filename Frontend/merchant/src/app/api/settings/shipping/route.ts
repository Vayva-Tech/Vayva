import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
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
            headers: {
                "x-store-id": storeId,
            },
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
            endpoint: "/api/settings/shipping",
            operation: "GET_SHIPPING",
            storeId,
        }
    );
    return NextResponse.json({ error: "Failed to fetch shipping settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    const zones = await request.json();

    // Call backend API to update shipping settings
    const result = await apiJson<{ success: boolean }>(
        `${process.env.BACKEND_API_URL}/api/settings/shipping`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-store-id": storeId,
            },
            body: JSON.stringify({ zones }),
        }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
        error,
        {
            endpoint: "/api/settings/shipping",
            operation: "UPDATE_SHIPPING",
            storeId,
        }
    );
    return NextResponse.json({ error: "Failed to update shipping settings" }, { status: 500 });
  }
}
