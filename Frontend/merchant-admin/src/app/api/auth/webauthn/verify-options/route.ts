import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";
import { randomBytes } from "crypto";

/**
 * GET /api/auth/webauthn/verify-options
 * Generate WebAuthn authentication options for biometric verification
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      // Get user's registered credentials from backend
      try {
        const credentials = await apiJson<{
          credentials: { id: string; type: string }[];
        }>(
          `${process.env.BACKEND_API_URL}/api/auth/webauthn/credentials?userId=${session.userId}`,
          { method: "GET" }
        );

        const challenge = randomBytes(32).toString("base64url");
        
        const options = {
          challenge,
          allowCredentials: credentials.credentials || [],
          userVerification: "required",
          timeout: 60000,
        };

        return {
          status: 200,
          body: options,
        };
      } catch {
        // Fallback: return empty credentials
        return {
          status: 400,
          body: { error: "No biometric credentials found" },
        };
      }
    },
    { requireAuth: true }
  );
}
