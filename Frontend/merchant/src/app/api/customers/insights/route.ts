import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
        headers: auth.headers,
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
