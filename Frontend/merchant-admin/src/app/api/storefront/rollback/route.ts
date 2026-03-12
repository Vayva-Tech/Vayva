import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";
import { z } from "zod";

const RollbackSchema = z.object({
  deploymentId: z.string(),
});

/**
 * POST /api/storefront/rollback
 * Rollback storefront to a previous deployment
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      const body = await request.json();
      const validated = RollbackSchema.parse(body);

      // Forward to Backend API to rollback storefront
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/storefront/rollback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-merchant-id": session.merchantId,
          },
          body: JSON.stringify({ deploymentId: validated.deploymentId }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to rollback storefront" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to rollback storefront" },
        };
      }

      const data = await backendResponse.json();

      return {
        status: 200,
        body: data,
      };
    },
    { requireAuth: true }
  );
}
