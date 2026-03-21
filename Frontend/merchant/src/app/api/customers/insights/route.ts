// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson<{
      stats: {
        totalCustomers: number;
        activeCustomers: number;
        vipCustomers: number;
        loyalCustomers: number;
        atRiskCustomers: number;
        newCustomers: number;
      };
      segments: {
        vip: { count: number; revenue: number };
        loyal: { count: number; revenue: number };
        atRisk: { count: number; revenue: number };
        new: { count: number; revenue: number };
      };
      totalRevenue: number;
      totalOrders: number;
    }>(
      `${process.env.BACKEND_API_URL}/api/customers/insights`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/customers/insights",
      operation: "GET_CUSTOMER_INSIGHTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch customer insights" },
      { status: 500 }
    );
  }
}
