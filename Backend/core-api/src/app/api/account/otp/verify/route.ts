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
  async (req, { storeId, user }: APIContext) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const field = getString(body.field);
      const newValue = getString(body.newValue);
      const otp = getString(body.otp);

      if (!field || !newValue || !otp) {
        return NextResponse.json(
          { error: "field, newValue, and otp are required" },
          { status: 400 },
        );
      }

      if (!["email", "phone", "businessPhone"].includes(field)) {
        return NextResponse.json({ error: "Invalid field" }, { status: 400 });
      }

      if (typeof otp !== "string" || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { error: "Invalid OTP format" },
          { status: 400 },
        );
      }

      const identifier = `${user.id}:account:${field}`;
      const expectedType = `ACCOUNT_FIELD_CHANGE:${field}:${Buffer.from(newValue).toString("base64")}`;

      // Find valid OTP
      const otpRecord = await prisma.otpCode.findFirst({
        where: {
          identifier,
          code: otp,
          type: expectedType,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        return NextResponse.json(
          { error: "Invalid or expired code" },
          { status: 400 },
        );
      }

      // Mark OTP as used AND apply field change atomically
      await prisma.$transaction(async (tx) => {
        // 1. Mark OTP as used
        await tx.otpCode.update({
          where: { id: otpRecord.id },
          data: { isUsed: true },
        });

        // 2. Apply the field change
        if (field === "email") {
          await tx.user.update({
            where: { id: user.id },
            data: { email: newValue.toLowerCase() },
          });
        } else if (field === "phone") {
          await tx.user.update({
            where: { id: user.id },
            data: { phone: String(newValue).trim() },
          });
        } else if (field === "businessPhone") {
          const store = await tx.store.findUnique({
            where: { id: storeId },
            select: { contacts: true },
          });
          const contacts = (store?.contacts as Record<string, unknown>) || {};

          await tx.store.update({
            where: { id: storeId },
            data: {
              contacts: {
                ...contacts,
                phone: String(newValue).trim(),
              },
            },
          });
        }
      });

      return NextResponse.json(
        { success: true },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[ACCOUNT_OTP_VERIFY]", error);
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 500 },
      );
    }
  },
);
