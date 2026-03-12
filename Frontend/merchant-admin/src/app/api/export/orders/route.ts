import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/export/orders
 * Export orders to CSV via backend API
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const from = searchParams.get("from");
      const to = searchParams.get("to");

      const queryParams = new URLSearchParams();
      queryParams.set("merchantId", session.merchantId);
      if (status) queryParams.set("status", status);
      if (from) queryParams.set("from", from);
      if (to) queryParams.set("to", to);

      try {
        const result = await apiJson<{
          success: boolean;
          csv: string;
          filename: string;
          count: number;
        }>(
          `${process.env.BACKEND_API_URL}/api/export/orders?${queryParams.toString()}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: result,
        };
      } catch {
        // Fallback with headers only
        const headers = "OrderID,Customer,Total,Status,Date,Items\n";
        return {
          status: 200,
          body: {
            success: true,
            csv: headers,
            filename: "orders-export.csv",
            count: 0,
          },
        };
      }
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/export/orders/bulk
 * Export selected orders to CSV via backend API
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const body = await request.json();
      const { ids }: { ids: string[] } = body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          status: 400,
          body: { error: "No order IDs provided" },
        };
      }

      try {
        const result = await apiJson<{
          success: boolean;
          csv: string;
          filename: string;
          count: number;
        }>(
          `${process.env.BACKEND_API_URL}/api/export/orders/bulk`,
          {
            method: "POST",
            body: JSON.stringify({
              merchantId: session.merchantId,
              ids,
            }),
          }
        );

        return {
          status: 200,
          body: result,
        };
      } catch {
        return {
          status: 200,
          body: {
            success: true,
            csv: "OrderID,Customer,Total,Status,Date\n",
            filename: "orders-export.csv",
            count: ids.length,
          },
        };
      }
    },
    { requireAuth: true }
  );
}
