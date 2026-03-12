import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";
import { randomBytes } from "crypto";

/**
 * GET /api/auth/webauthn/register-options
 * Generate WebAuthn registration options for biometric setup
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      // Generate challenge
      const challenge = randomBytes(32).toString("base64url");
      
      // Store challenge in session/cache for verification (5 min expiry)
      // In production, use Redis: await redis.setex(`webauthn:challenge:${session.userId}`, 300, challenge);
      
      const options = {
        challenge,
        rp: {
          name: "Vayva Merchant",
          id: process.env.WEBAUTHN_RP_ID || (process.env.NODE_ENV === "production" ? undefined : "localhost"),
        },
        user: {
          id: Buffer.from(session.userId).toString("base64url"),
          name: session.email || session.merchantId,
          displayName: session.email || "Vayva Merchant",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },   // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      };

      return {
        status: 200,
        body: options,
      };
    },
    { requireAuth: true }
  );
}
