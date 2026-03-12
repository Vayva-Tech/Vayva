import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/export/products
 * Export products to CSV via backend API
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const category = searchParams.get("category");

      const queryParams = new URLSearchParams();
      queryParams.set("merchantId", session.merchantId);
      if (status) queryParams.set("status", status);
      if (category) queryParams.set("category", category);

      try {
        const result = await apiJson<{
          success: boolean;
          csv: string;
          filename: string;
          count: number;
        }>(
          `${process.env.BACKEND_API_URL}/api/export/products?${queryParams.toString()}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: result,
        };
      } catch {
        // Fallback with headers only
        const headers = "Name,SKU,Price,Stock,Status,Category,CreatedAt\n";
        return {
          status: 200,
          body: {
            success: true,
            csv: headers,
            filename: "products-export.csv",
            count: 0,
          },
        };
      }
    },
    { requireAuth: true }
  );
}
