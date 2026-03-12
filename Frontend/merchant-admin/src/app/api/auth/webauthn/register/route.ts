import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

interface CredentialRegistration {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
}

/**
 * POST /api/auth/webauthn/register
 * Store WebAuthn credential after successful registration
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const body: CredentialRegistration = await request.json();
      
      if (!body.id || !body.rawId) {
        return {
          status: 400,
          body: { error: "Invalid credential data" },
        };
      }

      try {
        // Forward to backend for credential storage
        const result = await apiJson<{
          success: boolean;
          message?: string;
        }>(
          `${process.env.BACKEND_API_URL}/api/auth/webauthn/register`,
          {
            method: "POST",
            body: JSON.stringify({
              merchantId: session.merchantId,
              userId: session.userId,
              credentialId: body.id,
              credentialData: body,
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
        logger.error("[WEBAUTHN_REGISTER] Backend credential storage failed", error);
        return {
          status: 500,
          body: { error: "Failed to register biometric credential" },
        };
      }
    },
    { requireAuth: true }
  );
}
