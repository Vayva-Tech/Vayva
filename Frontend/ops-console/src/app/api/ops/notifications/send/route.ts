import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function POST(req: NextRequest) {
  const { user } = await OpsAuthService.requireSession();

  try {
    const { merchantIds, type, template, customMessage } = await req.json();

    if (
      !merchantIds ||
      !Array.isArray(merchantIds) ||
      merchantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "No merchants selected" },
        { status: 400 },
      );
    }

    if (!type || !["email", "whatsapp"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 },
      );
    }

    // Get merchant details for notifications
    const stores = await prisma.store.findMany({
      where: { id: { in: merchantIds } },
      include: {
        memberships: {
          where: { role_enum: "OWNER" },
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                firstName: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    // Notification templates
    const templates: Record<string, { subject: string; body: string }> = {
      welcome_onboarding: {
        subject: "Welcome to Vayva! 🎉",
        body: "Congratulations on completing your store setup! Your store is now ready to accept orders. Here are some tips to get started...",
      },
      feature_announcement: {
        subject: "New Feature Available on Vayva",
        body:
          customMessage ||
          "We've added exciting new features to help grow your business!",
      },
      reminder: {
        subject: "Reminder from Vayva",
        body:
          customMessage || "This is a friendly reminder from the Vayva team.",
      },
    };

    const selectedTemplate = templates[template] || templates.reminder;
    let sent = 0;
    let failed = 0;

    for (const store of stores) {
      const owner = store.memberships[0]?.user;
      if (!owner) continue;

      try {
        if (type === "email" && owner.email) {
          // Queue email notification
          await prisma.notificationOutbox.create({
            data: {
              storeId: store.id,
              channel: "EMAIL",
              to: owner.email,
              type: "OPS_NOTIFICATION",
              templateKey: template,
              status: "QUEUED",
              payload: {
                subject: selectedTemplate.subject,
                body: selectedTemplate.body.replace(
                  "{{name}}",
                  owner.firstName || "Merchant",
                ),
                sentBy: user.email || "ops_admin",
                sentAt: new Date().toISOString(),
              },
            },
          });
          sent++;
        } else if (type === "whatsapp" && owner.phone) {
          // Queue WhatsApp notification
          await prisma.notificationOutbox.create({
            data: {
              storeId: store.id,
              channel: "WHATSAPP",
              to: owner.phone,
              type: "OPS_NOTIFICATION",
              templateKey: template,
              status: "QUEUED",
              payload: {
                subject: selectedTemplate.subject,
                body: selectedTemplate.body.replace(
                  "{{name}}",
                  owner.firstName || "Merchant",
                ),
                sentBy: user.email || "ops_admin",
                sentAt: new Date().toISOString(),
              },
            },
          });
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        logger.error("[NOTIFICATION_QUEUE_ERROR]", { error: err, storeId: store.id });
        failed++;
      }
    }

    // Log the action
    await OpsAuthService.logEvent(user.id, "SEND_BULK_NOTIFICATION", {
      type,
      template,
      merchantCount: merchantIds.length,
      sent,
      failed,
    });

    return NextResponse.json({
      success: true,
      sent,
      failed,
      message: `Notification queued for ${sent} merchants`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[SEND_NOTIFICATION_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
