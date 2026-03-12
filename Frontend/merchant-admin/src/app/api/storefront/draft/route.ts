import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";

/**
 * GET /api/storefront/draft
 * Get the current storefront draft
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      // Forward to Backend API
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/storefront/draft`,
        {
          headers: {
            "x-merchant-id": session.merchantId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch draft" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to fetch draft" },
        };
      }

      const draft = await backendResponse.json();

      return {
        status: 200,
        body: { draft },
      };
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/storefront/draft
 * Save storefront draft
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      const validated = await request.json().catch(() => ({}));

      // Forward to Backend API to save draft
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/storefront/draft`,
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
        const error = await backendResponse.json().catch(() => ({ error: "Failed to save draft" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to save draft" },
        };
      }

      const draft = await backendResponse.json();

      return {
        status: 200,
        body: { draft, message: "Draft saved successfully" },
      };
    },
    { requireAuth: true }
  );
}

/**
 * PATCH /api/storefront/draft
 * Partial update of storefront draft
 */
export async function PATCH(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      const validated = await request.json().catch(() => ({}));

      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/storefront/draft`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-merchant-id": session.merchantId,
          },
          body: JSON.stringify(validated),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse
          .json()
          .catch(() => ({ error: "Failed to update draft" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to update draft" },
        };
      }

      const draft = await backendResponse.json();

      return {
        status: 200,
        body: { draft, message: "Draft updated successfully" },
      };
    },
    { requireAuth: true }
  );
}
