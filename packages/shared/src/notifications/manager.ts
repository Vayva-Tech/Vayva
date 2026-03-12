import { prisma } from "@vayva/db";
import { NOTIFICATION_REGISTRY, NotificationType } from "./registry";

export class NotificationManager {
  /**
   * Trigger a notification for a merchant.
   */
  static async trigger(
    storeId: string,
    type: NotificationType,
    variables: Record<string, unknown> = {},
  ) {
    const metadata = NOTIFICATION_REGISTRY[type];
    if (!metadata) {
      console.error(`[NotificationManager] Unknown notification type: ${type}`);
      return;
    }

    // 1. Deduplication (24h window)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLog = await prisma.notificationLog?.findFirst({
      where: {
        storeId,
        type,
        createdAt: { gte: dayAgo },
      },
    });

    if (recentLog) {
      console.log(
        `[NotificationManager] Deduplicated: ${type} for store ${storeId}`,
      );
      return;
    }

    // 2. Fetch Preferences
    const prefs = await prisma.notificationPreference?.findUnique({
      where: { storeId },
    });

    const prefsRecord = prefs as unknown as Record<string, unknown> | null;
    if (prefsRecord?.isMuted) {
      console.log(
        `[NotificationManager] Notifications muted for store ${storeId}`,
      );
      return;
    }

    const activeChannels = (prefsRecord?.channels as Record<string, boolean>) || {
      email: true,
      banner: true,
      in_app: true,
      whatsapp: false,
    };
    const activeCategories = (prefsRecord?.categories as Record<string, boolean>) || {
      orders: true,
      system: true,
      account: true,
      payments: true,
    };

    // Check category opt-out
    if (activeCategories[metadata.category as string] === false) {
      console.log(
        `[NotificationManager] Category ${metadata.category} disabled for store ${storeId}`,
      );
      return;
    }

    // 3. Render Message
    let body = metadata.message;
    let title = metadata.title;

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      body = body.replace(regex, String(variables[key]));
      title = title.replace(regex, String(variables[key]));
    });

    // 4. Create In-App Notification (Always if enabled)
    if (activeChannels.in_app !== false) {
      await prisma.notification?.create({
        data: {
          storeId,
          type,
          title,
          body,
          severity: metadata.severity,
          actionUrl: metadata.ctaLink,
          category: metadata.category,
          dedupeKey: `${storeId}-${type}-${Date.now()}`,
        },
      });
    }

    // 5. Create Outbox / Log entries for other channels
    const channelsToNotify: string[] = [];
    if (activeChannels.email) channelsToNotify.push("EMAIL");
    if (activeChannels.whatsapp) channelsToNotify.push("WHATSAPP");

    for (const channel of channelsToNotify) {
      // Fetch recipient info
      const recipient = await this.getRecipientInfo(storeId, channel);
      if (!recipient) continue;

      const outbox = await prisma.notificationOutbox?.create({
        data: {
          storeId,
          type,
          channel,
          to: recipient,
          payload: {
            title,
            body,
            ctaLabel: metadata.ctaLabel,
            ctaLink: metadata.ctaLink,
          },
          status: "QUEUED",
        },
      });

      // Log the attempt
      await prisma.notificationLog?.create({
        data: {
          storeId,
          type,
          channel,
          status: "PENDING",
          metadata: { outboxId: outbox.id, variables: variables as Record<string, string | number | boolean | null> },
        },
      });

      // Trigger WhatsApp Sender
      if (channel === "WHATSAPP") {
        try {
          const waUrl = process.env?.SERVICE_URL_WHATSAPP;

          if (!waUrl) {
            console.warn(`[NotificationManager] Skipping WhatsApp send - SERVICE_URL_WHATSAPP not configured`);
            continue;
          }

          await fetch(`${waUrl}/v1/whatsapp/send-notification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: recipient,
              // Map to specific template names if needed, otherwise use default
              templateName: `notification_${type.toLowerCase()}`,
              parameters: variables,
              textBody: body // Fallback text
            })
          });
        } catch (err: unknown) {
          console.error(`[NotificationManager] Failed to send WA to ${recipient}:`, err);
        }
      }
    }

  }

  private static async getRecipientInfo(
    storeId: string,
    channel: string,
  ): Promise<string | null> {
    if (channel === "WHATSAPP") {
      const profile = await prisma.storeProfile?.findUnique({
        where: { storeId },
      });
      return profile?.whatsappNumberE164 || null;
    }

    if (channel === "EMAIL") {
      const membership = await prisma.membership?.findFirst({
        where: {
          storeId,
          role_enum: { equals: "OWNER" }
        },
        include: { user: true },
      });
      return membership?.user?.email || null;
    }

    return null;
  }
}
