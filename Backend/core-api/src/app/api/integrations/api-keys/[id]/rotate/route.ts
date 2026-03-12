import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { apiKeyManager } from "@vayva/integrations/api-keys/manager";
import { prisma } from "@vayva/db";
import { Resend } from "resend";

const rotateSchema = z.object({
  gracePeriodDays: z.number().int().min(1).max(90).default(30),
});

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request: NextRequest, { storeId, params, user }: APIContext) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = rotateSchema.parse(body);

      // Get current key details for audit
      const currentKey = await prisma.apiKey.findUnique({
        where: { id, storeId },
        select: {
          name: true,
          createdAt: true,
          lastUsedAt: true,
          usageCount: true,
        },
      });

      if (!currentKey) {
        return NextResponse.json(
          { error: "API key not found" },
          { status: 404 }
        );
      }

      const result = await apiKeyManager.rotateApiKey(
        storeId,
        id,
        data.gracePeriodDays
      );

      // Create audit log
      await prisma.auditLog.create({
        data: {
          app: "merchant",
          action: "API_KEY_ROTATED",
          targetType: "ApiKey",
          targetId: result.newKey.id,
          targetStoreId: storeId,
          actorUserId: user?.id || "system",
          actorRole: user?.role || "unknown",
          metadata: {
            oldKeyId: id,
            newKeyId: result.newKey.id,
            gracePeriodDays: data.gracePeriodDays,
            keyName: currentKey.name,
            previousUsageCount: currentKey.usageCount,
            rotatedAt: new Date().toISOString(),
          },
        },
      });

      logger.info("[API_KEY_ROTATE] Rotated API key", {
        oldKeyId: id,
        newKeyId: result.newKey.id,
        storeId,
        gracePeriodDays: data.gracePeriodDays,
        userId: user?.id,
      });

      // Send email notification if Resend is configured
      if (resend && user?.email) {
        try {
          await sendRotationNotification(user.email, {
            keyName: currentKey.name,
            oldKeyId: id,
            newKeyId: result.newKey.id,
            gracePeriodDays: data.gracePeriodDays,
            oldKeyExpiry: result.oldKeyExpiry.toISOString(),
          });
        } catch (emailError) {
          logger.warn("[API_KEY_ROTATE] Failed to send email notification", {
            error: emailError,
            storeId,
            userId: user?.id,
          });
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            newKey: result.newKey,
            oldKeyExpiry: result.oldKeyExpiry.toISOString(),
            message: result.message,
            gracePeriodDays: data.gracePeriodDays,
          },
          warning: "Store the new secret key securely. It will not be shown again.",
        },
        { 
          status: 200,
          headers: { "Cache-Control": "no-store" } 
        }
      );
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false,
            error: "Invalid input", 
            details: error.errors 
          },
          { status: 400 }
        );
      }
      logger.error("[API_KEY_ROTATE]", error, { storeId });
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to rotate API key" 
        },
        { status: 500 }
      );
    }
  }
);

// Email notification function
async function sendRotationNotification(
  userEmail: string,
  details: {
    keyName: string;
    oldKeyId: string;
    newKeyId: string;
    gracePeriodDays: number;
    oldKeyExpiry: string;
  }
) {
  if (!resend) {
    logger.warn("[EMAIL] Resend not configured, skipping notification");
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🔐 API Key Rotated</h1>
      </div>
      
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 30px; background: white; border-radius: 0 0 8px 8px;">
        <p>Hello,</p>
        
        <p>Your API key <strong>"${details.keyName}"</strong> has been successfully rotated.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #374151;">New Key Details:</h3>
          <p style="margin: 5px 0;"><strong>Key ID:</strong> ${details.newKeyId}</p>
          <p style="margin: 5px 0;"><strong>Grace Period:</strong> ${details.gracePeriodDays} days</p>
          <p style="margin: 5px 0;"><strong>Old Key Expires:</strong> ${new Date(details.oldKeyExpiry).toLocaleString()}</p>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
          <h4 style="margin-top: 0; color: #92400e;">⚠️ Important Action Required</h4>
          <p style="margin: 0; color: #92400e;">
            Update your applications to use the new API key before the old one expires.
            The old key will stop working after the grace period ends.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you did not initiate this rotation, please contact support immediately.<br>
          Best regards,<br>
          Vayva Security Team
        </p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'security@vayva.io',
    to: userEmail,
    subject: `API Key Rotated: ${details.keyName}`,
    html,
  });

  logger.info("[EMAIL] Rotation notification sent", {
    to: userEmail,
    keyName: details.keyName,
    newKeyId: details.newKeyId,
  });
}
