import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { logger } from "@/lib/logger";

function getJwtSecret(): string {
  const secret = process.env?.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export const POST = withVayvaAPI(PERMISSIONS.SECURITY_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; email?: string | null } }) => {
    try {
        const token = jwt.sign({ userId: user.id, storeId, type: "pin_reset" }, getJwtSecret(), { expiresIn: "15m" });
        const appUrl = process.env?.NEXT_PUBLIC_APP_URL;
        if (!appUrl) {
            throw new Error("NEXT_PUBLIC_APP_URL environment variable is required");
        }
        const resetUrl = `${appUrl}/dashboard/account/reset-pin?token=${token}`;
        
        if (process.env?.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env?.RESEND_API_KEY);
                if (user.email) {
                    await resend.emails?.send({
                        from: process.env?.RESEND_FROM_EMAIL || `Vayva <${urls.noReplyEmail()}>`,
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
                `
                    });
                }
            }
            catch (emailError: any) {
                logger.error("Failed to send PIN reset email", { error: emailError.message });
            }
        }
        await prisma.adminAuditLog?.create({
            data: {
                actorUserId: user.id,
                storeId,
                action: "PIN_RESET_REQUESTED",
                createdAt: new Date()
            }
        });
        return NextResponse.json({ success: true, message: "Reset link sent to your email." });
    }
    catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("[PIN_RESET_REQUEST_POST]", { error: errorMessage });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
