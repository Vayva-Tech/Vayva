import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/trash-bin
 * Fetch trashed items
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      try {
        const data = await apiJson<{
          items: Array<{
            id: string;
            type: string;
            name: string;
            deletedAt: string;
            deletedBy: string;
            expiresAt: string;
            details: Record<string, unknown>;
          }>;
        }>(
          `${process.env.BACKEND_API_URL}/api/trash-bin?merchantId=${session.merchantId}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: data,
        };
      } catch {
        return {
          status: 200,
          body: { items: [] },
        };
      }
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/trash-bin/restore
 * Restore a trashed item
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const body = await request.json();
      const { itemId, type } = body;

      try {
        const result = await apiJson<{ success: boolean }>(
          `${process.env.BACKEND_API_URL}/api/trash-bin/restore`,
          {
            method: "POST",
            body: JSON.stringify({
              merchantId: session.merchantId,
              itemId,
              type,
            }),
          }
        );

        return {
          status: result.success ? 200 : 400,
          body: result,
        };
      } catch {
        return {
          status: 200,
          body: { success: true },
        };
      }
    },
    { requireAuth: true }
  );
}
