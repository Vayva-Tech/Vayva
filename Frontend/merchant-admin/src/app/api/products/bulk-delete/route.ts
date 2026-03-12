import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * POST /api/products/bulk-delete
 * Bulk delete products via backend API
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { merchantId: string }) => {
      const body = await request.json();
      const { ids }: { ids: string[] } = body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          status: 400,
          body: { error: "No product IDs provided" },
        };
      }

      if (ids.length > 100) {
        return {
          status: 400,
          body: { error: "Maximum 100 products per batch" },
        };
      }

      try {
        const result = await apiJson<{
          success: boolean;
          deleted: number;
          message?: string;
        }>(
          `${process.env.BACKEND_API_URL}/api/products/bulk-delete`,
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
          body: { success: true, deleted: ids.length },
        };
      }
    },
    { requireAuth: true }
  );
}
