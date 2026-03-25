import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/dashboard/pro
 * Fetch the full Pro dashboard data including metrics, tasks, inventory alerts,
 * top customers, AI stats, and order status breakdown.
 * Used by ProDashboardV2.tsx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const result = await apiJson<{
      metrics: {
        revenue: { value: number; change: number; trend: "up" | "down"; history?: { date: string; value: number }[] };
        orders: { value: number; change: number; trend: "up" | "down" };
        customers: { value: number; change: number; trend: "up" | "down" };
        conversion: { value: number; change: number; trend: "up" | "down" };
      };
      tasks: {
        id: string;
        title: string;
        subtitle: string;
        completed?: boolean;
      }[];
      inventoryAlerts: {
        name: string;
        stock: number;
        status: "low" | "out";
      }[];
      topCustomers: {
        name: string;
        orders: number;
        spent: string;
      }[];
      aiStats: {
        captured: number;
        autoOrders: number;
        avgResponse: string;
        satisfaction: number;
        usageHistory?: number[];
      };
      orderStatus: {
        delivered: number;
        processing: number;
        pending: number;
        cancelled: number;
      };
    }>(`${process.env.BACKEND_API_URL}/api/dashboard/pro?period=${period}`);

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/dashboard/pro",
      operation: "GET_PRO_DASHBOARD",
    });
    return NextResponse.json(
      { error: "Failed to fetch pro dashboard data" },
      { status: 500 }
    );
  }
}
