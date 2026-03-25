import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/dashboard/metrics/overview
 * Fetch real dashboard overview metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch dashboard metrics via API
    const result = await apiJson<{
      success: boolean;
      data?: {
        revenue: number;
        orders: number;
        customers: number;
        pendingOrders: number;
        revenueChange: number;
        ordersChange: number;
        customersChange: number;
        pendingOrdersChange: number;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/dashboard/metrics/overview`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch dashboard metrics');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/dashboard/metrics/overview',
        operation: 'GET_DASHBOARD_METRICS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
