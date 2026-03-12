import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import { logAudit, AuditEventType } from "@/lib/audit";
import { logger } from "@/lib/logger";

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
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const currentPassword = getString(body.currentPassword);
      const newPassword = getString(body.newPassword);
      const confirmPassword = getString(body.confirmPassword);

      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: "Current and new password required" },
          { status: 400 },
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "New passwords do not match" },
          { status: 400 },
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 },
        );
      }

      // 1. Fetch user
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // 2. Verify current password
      const isValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid current password" },
          { status: 400 },
        );
      }

      // 3. Hash and update
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Critical: Update password AND increment sessionVersion to invalidate other sessions
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          sessionVersion: { increment: 1 },
        },
      });

      // 4. Audit Log
      await logAudit(storeId, user.id, AuditEventType.ACCOUNT_SECURITY_ACTION, {
        correlationId,
        meta: {
          action: "password_change",
          ip: req.headers.get("x-forwarded-for") || "unknown",
          actor: { type: "USER", label: user.email },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Password updated and sessions invalidated",
      });
    } catch (error) {
      logger.error("[CHANGE_PASSWORD_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to change password" },
        { status: 500 },
      );
    }
  },
);
