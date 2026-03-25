import { urls } from "@vayva/shared";
import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/session.server";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(
  PERMISSIONS.SECURITY_MANAGE,
  async (req, { storeId, user }) => {
    try {
      let jwtSecret: string;
      try {
        jwtSecret = getJwtSecret();
      } catch {
        logger.error("[PIN_RESET] Missing NEXTAUTH_SECRET or JWT_SECRET", "CONFIG");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 },
        );
      }

      // 1. Generate Reset Token (Valid for 15 mins)
      const token = jwt.sign(
        { userId: user.id, storeId, type: "pin_reset" },
        jwtSecret,
        { expiresIn: "15m" },
      );

      // 2. Construct Reset URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) {
        logger.error("[PIN_RESET] NEXT_PUBLIC_APP_URL not configured", "CONFIG");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }
      const resetUrl = `${appUrl}/dashboard/account/reset-pin?token=${token}`;

      // 3. Send Email
      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from:
              process.env.RESEND_FROM_EMAIL || `Vayva <${urls.noReplyEmail()}>`,
            to: user.email,
            subject: "Action Required: Reset your Wallet PIN",
            html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Reset Wallet PIN</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your Vayva Wallet PIN.</p>
                        <p>Click the button below to reset it. This link expires in 15 minutes.</p>
                        <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Reset PIN</a>
                        <p>If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `,
          });
        } catch (emailError) {
          logger.error("[PIN_RESET_EMAIL_SEND_FAILED]", emailError, {
            storeId,
            userId: user.id,
          });
        }
      }
      // 4. Log/Persist if needed (Audit Log)
      await prisma.adminAuditLog.create({
        data: {
          actorUserId: user.id,
          storeId,
          action: "PIN_RESET_REQUESTED",
          createdAt: new Date(),
        },
      });
      return NextResponse.json({
        success: true,
        message: "Reset link sent to your email.",
      });
    } catch (error: unknown) {
      logger.error("[PIN_RESET_REQUEST_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
