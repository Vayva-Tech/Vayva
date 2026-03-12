import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";
import { logger } from "@vayva/shared";

const SESSION_COOKIE_NAME = "vayva_ops_session";
const SESSION_DURATION_DAYS = 7;

export class OpsAuthService {
  /**
   * Bootstraps the first Ops Owner if no users exist.
   * Uses env vars OPS_OWNER_EMAIL and OPS_OWNER_PASSWORD.
   */
  static async bootstrapOwner() {
    const count = await prisma.opsUser?.count();
    if (count > 0) return; // Already initialized

    // Production Safety: Require explicit opt-in
    if (
      process.env.NODE_ENV === "production" &&
      process.env.OPS_BOOTSTRAP_ENABLE !== "true"
    ) {
      logger.warn(
        "OPS_BOOTSTRAP_SKIPPED: OPS_BOOTSTRAP_ENABLE not true in production",
      );
      return;
    }

    const email = process.env?.OPS_OWNER_EMAIL;
    const password = process.env?.OPS_OWNER_PASSWORD;

    if (!email || !password) {
      logger.warn(
        "OPS_BOOTSTRAP_SKIPPED: Missing OPS_OWNER_EMAIL or OPS_OWNER_PASSWORD",
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.opsUser?.create({
      data: {
        email,
        password: passwordHash,
        role: "OPS_OWNER",
        name: "System Owner",
        isActive: true,
      },
    });
  }

  /**
   * Authenticate user and create session
   * Returns user if successful, null if failed
   * If MFA is required but no code provided, returns object with requiresMfa: true
   */
  static async login(
    email: string,
    passwordString: string,
    mfaCode?: string,
  ): Promise<{
    email: string;
    name: string;
    role: string;
    requiresMfa?: boolean;
    tempToken?: string;
  } | null> {
    const user = await prisma.opsUser?.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(passwordString, user.password);
    if (!isValid) return null;

    if (!user.isActive) throw new Error("Account disabled");

    // MFA enforcement: If MFA is enabled, verify the code
    if (user.isMfaEnabled && user.mfaSecret) {
      if (!mfaCode) {
        // Generate temp token for MFA step
        const tempToken = crypto.randomBytes(32).toString("hex");
        // Store temp token with expiration (5 minutes)
        await prisma.opsSession?.create({
          data: {
            opsUserId: user.id,
            token: `mfa_pending_${tempToken}`,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
        return {
          email: user.email,
          name: user.name,
          role: user.role,
          requiresMfa: true,
          tempToken,
        };
      }

      // Verify MFA code
      const verified = this.verifyTOTP(user.mfaSecret, mfaCode);
      if (!verified) {
        await this.logEvent(user.id, "OPS_MFA_FAILED", { ip: "unknown" });
        return null;
      }
    }

    // Create Session
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    // Record last login
    await prisma.opsUser?.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create OpsSession
    await prisma.opsSession?.create({
      data: {
        opsUserId: user.id,
        token,
        expiresAt,
      },
    });

    // Set Cookie
    (await cookies()).set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    // Audit Log
    await this.logEvent(user.id, "OPS_LOGIN_SUCCESS", { ip: "unknown" });

    return {
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Verify TOTP code against secret
   */
  private static verifyTOTP(secret: string, code: string): boolean {
    // Simple TOTP verification using speakeasy-like logic
    // In production, use a proper TOTP library like 'speakeasy' or 'otpauth'
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { authenticator } = require("otplib");
    try {
      return authenticator.verify({ token: code, secret });
    } catch {
      // Fallback: basic time-based verification
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const crypto = require("crypto");
      const timeStep = 30; // 30-second window
      const timeCounter = Math.floor(Date.now() / 1000 / timeStep);

      // Check current and adjacent windows
      for (let i = -1; i <= 1; i++) {
        const counter = timeCounter + i;
        const hmac = crypto
          .createHmac("sha1", Buffer.from(secret, "base64"))
          .update(Buffer.from(counter.toString(16).padStart(16, "0"), "hex"))
          .digest();
        const offset = hmac[hmac.length - 1] & 0xf;
        const codeCalc =
          ((hmac[offset] & 0x7f) << 24 |
            (hmac[offset + 1] & 0xff) << 16 |
            (hmac[offset + 2] & 0xff) << 8 |
            (hmac[offset + 3] & 0xff)) %
          1000000;
        if (codeCalc.toString().padStart(6, "0") === code) return true;
      }
      return false;
    }
  }

  /**
   * Check if IP is rate limited (Max 5 failed attempts in 15 mins)
   */
  static async isRateLimited(ip: string): Promise<boolean> {
    const WINDOW_MINUTES = 15;
    const MAX_ATTEMPTS = 5;
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

    // Fetch recent failures to check IP (JSON filtering can be DB-specific)
    const failures = await prisma.opsAuditEvent?.findMany({
      where: {
        eventType: "OPS_LOGIN_FAILED",
        createdAt: { gte: windowStart },
      },
      select: { metadata: true },
    });

    const count = failures.filter(
      (f) => (f.metadata as Record<string, unknown>)?.ip === ip,
    ).length;
    return count >= MAX_ATTEMPTS;
  }

  /**
   * Get current session from cookies
   */
  static async getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await prisma.opsSession?.findUnique({
      where: { token },
      include: { opsUser: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    if (!session.opsUser?.isActive) return null;

    return {
      user: session.opsUser,
      session,
    };
  }

  /**
   * Require session or throw
   */
  static async requireSession() {
    const session = await this.getSession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    return session;
  }

  /**
   * Require specific role or throw
   * Role hierarchy: OPS_OWNER > SUPERVISOR > OPERATOR > SUPPORT
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static requireRole(user: any, requiredRole: string) {
    const roleHierarchy: Record<string, number> = {
      OPS_OWNER: 4,
      SUPERVISOR: 3,
      OPERATOR: 2,
      OPS_SUPPORT: 1,
      OPS_ADMIN: 3, // Alias for SUPERVISOR
    };

    const userLevel =
      roleHierarchy[(user as Record<string, unknown>).role as string] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 999;

    if (userLevel < requiredLevel) {
      throw new Error(
        `Insufficient permissions. Required: ${requiredRole}, Current: ${(user as Record<string, unknown>).role}`,
      );
    }
  }

  static async logout() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.opsSession?.deleteMany({ where: { token } });
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  static async logEvent(
    userId: string | null,
    eventType: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any = {},
  ) {
    try {
      const user = userId
        ? await prisma.opsUser?.findUnique({ where: { id: userId } })
        : null;

      await prisma.auditLog?.create({
        data: {
          app: "ops",
          actorUserId: userId || "system",
          actorEmail: user?.email || "system",
          action: eventType,
          targetType: ((metadata?.targetType as string) || "system") as import("@vayva/db").AuditTargetType,
          targetId: (metadata?.targetId as string) || "n/a",
          targetStoreId:
            (metadata?.targetStoreId as string) ||
            (metadata?.storeId as string) ||
            null,
          requestId: "system-event", // or extract if possible
          metadata: (metadata ||
            {}) as unknown as import("@vayva/db").Prisma.InputJsonValue,
          severity: ((metadata?.severity as string) || "INFO") as import("@vayva/db").AuditSeverity,
        },
      });
    } catch (error) {
      logger.error("Failed to log ops event to AuditLog", {
        error: (error as Error)?.message,
      });
    }
  }

  /**
   * Generate MFA secret for user
   */
  static async generateMFASecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
// @ts-expect-error - Module resolution pending
    const { authenticator } = await import("otplib");
    const secret = authenticator.generateSecret();

    const user = await prisma.opsUser?.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const otpauth = authenticator.keyuri(user.email, "Vayva Ops", secret);

    // Generate QR code URL (using a QR code service or library)
    const qrCodeUrl = `https://api.qrserver?.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;

    // Temporarily store secret (not enabled until verified)
    await prisma.opsUser?.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { secret, qrCodeUrl };
  }

  /**
   * Verify and enable MFA for user
   */
  static async verifyAndEnableMFA(userId: string, code: string): Promise<boolean> {
    const user = await prisma.opsUser?.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) throw new Error("MFA not initialized");

// @ts-expect-error - Module resolution pending
    const { authenticator } = await import("otplib");
    const isValid = authenticator.verify({ token: code, secret: user.mfaSecret });

    if (isValid) {
      await prisma.opsUser?.update({
        where: { id: userId },
        data: { isMfaEnabled: true },
      });
      await this.logEvent(userId, "OPS_MFA_ENABLED", {});
    }

    return isValid;
  }

  /**
   * Disable MFA for user
   */
  static async disableMFA(userId: string): Promise<void> {
    await prisma.opsUser?.update({
      where: { id: userId },
      data: { mfaSecret: null, isMfaEnabled: false },
    });
    await this.logEvent(userId, "OPS_MFA_DISABLED", {});
  }

  // --- User Management ---

  static async createUser(
    currentUserRole: string,
    data: { email: string; role: string; name: string },
  ) {
    if (currentUserRole !== "OPS_OWNER") {
      throw new Error("Unauthorized");
    }

    // Temp password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hash = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.opsUser?.create({
      data: {
        email: data.email,
        role: data.role,
        name: data.name,
        password: hash,
        isActive: true,
      },
    });

    return { user: newUser, tempPassword };
  }
}
