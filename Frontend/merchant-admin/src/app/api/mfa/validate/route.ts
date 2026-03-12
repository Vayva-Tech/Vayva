import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { TOTP } from "otpauth";

interface ValidateBody {
  token: string;
}

/**
 * POST /api/mfa/validate
 * Validate TOTP code during login (when MFA is already enabled)
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: unknown) => {
      const body: ValidateBody = await request.json();
      const { token } = body;

      if (!token) {
        return {
          status: 400,
          body: { error: "Verification code is required" },
        };
      }

      // In production: fetch user's stored MFA secret
      // const user = await getUserById(session.userId);
      // const secret = user.mfaSecret;

      // For now, return error (this endpoint requires backend integration)
      return {
        status: 501,
        body: {
          error: "MFA validation requires backend integration with stored secret",
          message: "Please complete backend implementation to enable MFA validation",
        },
      };
    },
    { requireAuth: true }
  );
}
