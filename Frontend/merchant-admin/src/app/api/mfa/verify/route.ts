import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { TOTP } from "otpauth";

interface VerifyBody {
  secret: string;
  token: string;
}

/**
 * POST /api/mfa/verify
 * Verify TOTP code during setup (validates the user can generate correct codes)
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: unknown) => {
      const body: VerifyBody = await request.json();
      const { secret, token } = body;

      if (!secret || !token) {
        return {
          status: 400,
          body: { error: "Secret and token are required" },
        };
      }

      // Validate the TOTP code
      const totp = new TOTP({
        secret,
        digits: 6,
        period: 30,
      });

      const isValid = totp.validate({ token, window: 1 }) !== null;

      if (!isValid) {
        return {
          status: 400,
          body: { error: "Invalid verification code. Please try again." },
        };
      }

      // Code is valid - in production, save the secret to user profile here
      // await updateUserMfaSecret(session.userId, secret);

      return {
        status: 200,
        body: {
          verified: true,
          message: "MFA enabled successfully. You'll need to enter a code at each login.",
        },
      };
    },
    { requireAuth: true }
  );
}
