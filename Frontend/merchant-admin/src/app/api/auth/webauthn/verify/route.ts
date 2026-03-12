import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

interface CredentialAssertion {
  id: string;
  rawId: string;
  type: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
}

/**
 * POST /api/auth/webauthn/verify
 * Verify WebAuthn biometric authentication
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const body: CredentialAssertion = await request.json();
      
      if (!body.id || !body.response.signature) {
        return {
          status: 400,
          body: { error: "Invalid assertion data" },
        };
      }

      try {
        // Forward to backend for verification
        const result = await apiJson<{
          success: boolean;
          verified: boolean;
          message?: string;
        }>(
          `${process.env.BACKEND_API_URL}/api/auth/webauthn/verify`,
          {
            method: "POST",
            body: JSON.stringify({
              merchantId: session.merchantId,
              userId: session.userId,
              assertion: body,
            }),
          }
        );

        return {
          status: result.success ? 200 : 400,
          body: result,
        };
      } catch (error) {
        // Log error and return failure - NEVER mock success for biometric auth
        const { logger } = await import("@/lib/logger");
        logger.error("[WEBAUTHN_VERIFY] Backend verification failed", error);
        return {
          status: 500,
          body: { error: "Biometric verification unavailable" },
        };
      }
    },
    { requireAuth: true }
  );
}
