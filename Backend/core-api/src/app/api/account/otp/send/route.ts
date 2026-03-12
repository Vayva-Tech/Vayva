import { NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req, { user }: APIContext) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const field = getString(body.field);
      const newValue = getString(body.newValue);

      if (!field || !newValue) {
        return NextResponse.json(
          { error: "field and newValue are required" },
          { status: 400 },
        );
      }

      if (!["email", "phone", "businessPhone"].includes(field)) {
        return NextResponse.json({ error: "Invalid field" }, { status: 400 });
      }

      // Validate email format if changing email
      if (field === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newValue)) {
          return NextResponse.json(
            { error: "Invalid email format" },
            { status: 400 },
          );
        }

        // Check if email is already taken
        const existing = await prisma.user.findUnique({
          where: { email: newValue.toLowerCase() },
        });
        if (existing && existing.id !== user.id) {
          return NextResponse.json(
            { error: "Email is already in use" },
            { status: 409 },
          );
        }
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { email: true, firstName: true },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date();
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

      // Invalidate old OTPs for this user + field change
      const identifier = `${user.id}:account:${field}`;
      await prisma.otpCode.updateMany({
        where: {
          identifier,
          type: { startsWith: "ACCOUNT_FIELD_CHANGE:" },
          isUsed: false,
        },
        data: { isUsed: true },
      });

      // Create new OTP (encode field+newValue in identifier for lookup during verify)
      await prisma.otpCode.create({
        data: {
          identifier,
          code: otpCode,
          type: `ACCOUNT_FIELD_CHANGE:${field}:${Buffer.from(newValue).toString("base64")}`,
          expiresAt: otpExpiresAt,
        },
      });

      // Send OTP to user's current email
      const { ResendEmailService } = await import("@/lib/email/resend");
      await ResendEmailService.sendOTPEmail(
        dbUser.email,
        otpCode,
        dbUser.firstName || "Merchant",
      );

      return NextResponse.json(
        { success: true },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[ACCOUNT_OTP_SEND]", error);
      return NextResponse.json(
        { error: "Failed to send verification code" },
        { status: 500 },
      );
    }
  },
);
