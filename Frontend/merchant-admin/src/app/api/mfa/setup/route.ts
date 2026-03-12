import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * POST /api/mfa/setup
 * Generate TOTP secret via backend API
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const data = await apiJson<{
          secret: string;
          uri: string;
          message: string;
        }>(
          `${process.env.BACKEND_API_URL}/api/mfa/setup`,
          {
            method: "POST",
            body: JSON.stringify({
              merchantId: session.merchantId,
              email: session.email,
            }),
          }
        );

        return {
          status: 200,
          body: data,
        };
      } catch {
        // Fallback error
        return {
          status: 500,
          body: { error: "Failed to generate MFA setup" },
        };
      }
    },
    { requireAuth: true }
  );
}
