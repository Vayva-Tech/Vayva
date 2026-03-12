import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { logger } from "@vayva/shared";

// Routes that require MFA for financial/sensitive actions
export const MFA_REQUIRED_ROUTES = [
  "/api/payments/payout",
  "/api/payments/refund",
  "/api/payments/withdraw",
  "/api/accounting/export",
  "/api/accounting/expenses/delete",
  "/api/products/bulk-delete",
  "/api/team/delete",
  "/api/settings/payment-methods/delete",
  "/api/kyc/resubmit",
];

// Check if route requires MFA
export function requiresMFA(pathname: string): boolean {
  return MFA_REQUIRED_ROUTES.some((route) => pathname.startsWith(route));
}

// MFA verification result
export interface MFAVerificationResult {
  verified: boolean;
  method?: "totp" | "biometric" | "backup";
  timestamp?: Date;
}

/**
 * Check if store has 2FA enabled via Wallet model
 * MFA is linked to store wallet, not user account directly
 */
export async function checkMFAEnabled(storeId: string): Promise<{
  enabled: boolean;
  methods: { totp: boolean; biometric: boolean; backupCodes: boolean };
}> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { storeId },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!wallet) {
      return { enabled: false, methods: { totp: false, biometric: false, backupCodes: false } };
    }

    const hasTotp = !!wallet.twoFactorSecret && wallet.twoFactorEnabled;
    const hasBackupCodes = Array.isArray(wallet.twoFactorBackupCodes) && wallet.twoFactorBackupCodes.length > 0;

    return {
      enabled: hasTotp || hasBackupCodes,
      methods: {
        totp: hasTotp,
        biometric: false, // Biometric handled via WebAuthn separate flow
        backupCodes: hasBackupCodes,
      },
    };
  } catch (error) {
    logger.error("MFA check failed", { error, storeId });
    return { enabled: false, methods: { totp: false, biometric: false, backupCodes: false } };
  }
}

/**
 * Verify MFA code (TOTP or backup code)
 * Uses store wallet's 2FA settings
 */
export async function verifyMFACode(
  storeId: string,
  code: string,
  method: "totp" | "backup" = "totp",
): Promise<MFAVerificationResult> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { storeId },
      select: {
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!wallet) {
      return { verified: false };
    }

    if (method === "backup") {
      // Check backup codes
      const validBackupCode = wallet.twoFactorBackupCodes?.find((hashedCode: string) => {
        return code === hashedCode;
      });

      if (validBackupCode) {
        // Remove used backup code
        await prisma.wallet.update({
          where: { storeId },
          data: {
            twoFactorBackupCodes: {
              set: wallet.twoFactorBackupCodes?.filter((c: string) => c !== validBackupCode) || [],
            },
          },
        });

        return { verified: true, method: "backup", timestamp: new Date() };
      }
    } else {
      // Verify TOTP using speakeasy
      const speakeasy = await import("speakeasy");
      if (wallet.twoFactorSecret) {
        const isValid = speakeasy.totp.verify({
          secret: wallet.twoFactorSecret,
          encoding: "base32",
          token: code,
          window: 2, // Allow 2 time steps of drift (±1 minute)
        });

        if (isValid) {
          return { verified: true, method: "totp", timestamp: new Date() };
        }
      }
    }

    return { verified: false };
  } catch (error) {
    logger.error("MFA verification failed", { error, storeId, method });
    return { verified: false };
  }
}

/**
 * Middleware to enforce MFA on financial/sensitive actions
 * Usage: Apply this in your API route handler
 * 
 * Example:
 * export async function POST(req: NextRequest) {
 *   return withMFAEnforcement(req, async (session, mfaVerification) => {
 *     // Your handler logic - only runs if MFA is verified
 *     return { success: true };
 *   });
 * }
 */
interface SessionUser {
  user?: {
    id?: string;
    email?: string | null;
  };
}

export async function withMFAEnforcement<T>(
  req: Request,
  handler: (session: SessionUser, mfaVerification: MFAVerificationResult) => Promise<T>,
): Promise<NextResponse | T> {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pathname = new URL(req.url).pathname;

    // Check if this route requires MFA
    if (!requiresMFA(pathname)) {
      // Route doesn't require MFA, proceed normally
      return handler(session, { verified: false });
    }

    // Check if store has 2FA enabled (via wallet)
    const storeId = session.user?.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Store not found" }, { status: 400 });
    }

    const mfaStatus = await checkMFAEnabled(storeId);

    // If MFA is not enabled, require them to set it up first
    if (!mfaStatus.enabled) {
      await logAuditEvent(
        storeId,
        session.user.id,
        AuditEventType.SECURITY_STEP_UP_REQUIRED,
        {
          targetType: "endpoint",
          targetId: pathname,
          reason: "MFA required but not enabled",
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
        },
      );

      return NextResponse.json(
        {
          error: "MFA required",
          code: "MFA_REQUIRED",
          message: "Multi-factor authentication is required for this action. Please set up MFA in your security settings.",
          redirectTo: "/settings/security/mfa",
        },
        { status: 403 },
      );
    }

    // Extract MFA code from header or body
    const mfaCode = req.headers.get("x-mfa-code");
    let mfaVerification: MFAVerificationResult = { verified: false };

    if (mfaCode) {
      // Determine method from header or default to TOTP
      const method = (req.headers.get("x-mfa-method") as "totp" | "backup") || "totp";
      mfaVerification = await verifyMFACode(storeId, mfaCode, method);
    }

    // Check if biometric was recently verified (within last 5 minutes)
    const biometricVerified = req.headers.get("x-biometric-verified") === "true";
    const biometricTimestamp = req.headers.get("x-biometric-timestamp");
    
    if (biometricVerified && biometricTimestamp) {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if (parseInt(biometricTimestamp) > fiveMinutesAgo) {
        mfaVerification = { verified: true, method: "biometric", timestamp: new Date(parseInt(biometricTimestamp)) };
      }
    }

    // If MFA not verified, return 403 with required methods
    if (!mfaVerification.verified) {
      await logAuditEvent(
        storeId,
        session.user.id,
        AuditEventType.SECURITY_STEP_UP_REQUIRED,
        {
          targetType: "endpoint",
          targetId: pathname,
          reason: "MFA verification failed or missing",
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
        },
      );

      return NextResponse.json(
        {
          error: "MFA verification required",
          code: "MFA_VERIFICATION_REQUIRED",
          message: "Please verify your identity using your authenticator app or backup code.",
          methods: mfaStatus.methods,
        },
        { status: 403 },
      );
    }

    // MFA verified, log success and proceed
    await logAuditEvent(
      storeId,
      session.user.id,
      AuditEventType.ACCOUNT_SECURITY_ACTION,
      {
        targetType: "endpoint",
        targetId: pathname,
        reason: `MFA verified via ${mfaVerification.method}`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        meta: { method: mfaVerification.method },
      },
    );

    return handler(session, mfaVerification);
  } catch (error) {
    logger.error("MFA enforcement error", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * HOF (Higher Order Function) to wrap API handlers with MFA enforcement
 * Usage:
 * export const POST = withMFARequired(async (req, session, mfaVerification) => {
 *   // Your handler
 * });
 */
export function withMFARequired(
  handler: (req: Request, session: SessionUser, mfaVerification: MFAVerificationResult) => Promise<NextResponse>,
) {
  return async function (req: Request): Promise<NextResponse> {
    return withMFAEnforcement(req, (session, mfaVerification) => {
      return handler(req, session, mfaVerification);
    }) as Promise<NextResponse>;
  };
}
