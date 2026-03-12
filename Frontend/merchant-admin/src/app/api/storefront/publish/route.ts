import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";

/**
 * POST /api/storefront/publish
 * Publish storefront with selected template
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      const validated = await request.json().catch(() => ({}));

      // Forward to Backend API to publish storefront
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/storefront/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-merchant-id": session.merchantId,
          },
          body: JSON.stringify(validated),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to publish storefront" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to publish storefront" },
        };
      }

      const deployment = await backendResponse.json();

      return {
        status: 200,
        body: {
          deployment,
          message: "Storefront published successfully",
        },
      };
    },
    { requireAuth: true }
  );
}
