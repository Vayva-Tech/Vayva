import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { logAudit, AuditEventType } from "@/lib/audit";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

const _COOKIE_NAME = "vayva_sudo_token"; // Aligned with session.ts if applicable

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.SECURITY_MANAGE,
  async (req, { storeId, user, correlationId }) => {
    try {
      await checkRateLimitCustom(user.id, "auth_sudo", 5, 900);

      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const password = getString(body.password);
      if (!password) {
        return NextResponse.json(
          { error: "Password required" },
          { status: 400 },
        );
      }

      // 1. Verify Password
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser || !dbUser.password) {
        return NextResponse.json(
          { error: "User not found or no password" },
          { status: 401 },
        );
      }

      const isValid = await bcrypt.compare(password, dbUser.password);
      if (!isValid) {
        await logAudit(storeId, user.id, AuditEventType.SUDO_FAILED, {
          entityType: "USER",
          entityId: user.id,
          afterState: { reason: "invalid_password" },
          correlationId,
        });
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 },
        );
      }

      // 2. Update Session
      const cookieStore = await cookies();
      // Since withVayvaAPI uses requireAuthFromRequest, it might be using a specific cookie strategy
      // In this project, sudo seems to be tracked via a session token in the DB
      const token =
        cookieStore.get("next-auth.session-token")?.value ||
        cookieStore.get("__Secure-next-auth.session-token")?.value;

      if (!token) {
        return NextResponse.json({ error: "Session missing" }, { status: 401 });
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes sudo

      await prisma.merchantSession.update({
        where: { token },
        data: { sudoExpiresAt: expiresAt },
      });

      await logAudit(storeId, user.id, AuditEventType.SUDO_SUCCESS, {
        entityType: "USER",
        entityId: user.id,
        afterState: {
          method: "password",
          duration: "10m",
        },
        correlationId,
      });

      return NextResponse.json({ success: true, sudoExpiresAt: expiresAt });
    } catch (error: unknown) {
      logger.error("[AUTH_SUDO_POST]", error, { storeId, userId: user.id });
      return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
    }
  },
);
