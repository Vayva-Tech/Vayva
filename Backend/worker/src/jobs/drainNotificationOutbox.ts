import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

function backoffMinutes(attempt: number) {
  if (attempt <= 1) return 1;
  if (attempt === 2) return 5;
  if (attempt === 3) return 15;
  if (attempt === 4) return 60;
  if (attempt === 5) return 360; // 6 hours
  return 0; // DEAD after 6th failure
}

export async function drainNotificationOutbox(batchSize = 25) {
  const now = new Date();

  const candidates = await prisma.notificationOutbox.findMany({
    where: {
      status: { in: ["QUEUED", "FAILED"] as const },
      OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });

  let sent = 0;
  let failed = 0;
  let dead = 0;

  for (const notification of candidates) {
    // Claim atomically
    const claimed = await prisma.notificationOutbox.updateMany({
      where: { id: notification.id, status: { in: ["QUEUED", "FAILED"] as const } },
      data: {
        status: "SENDING",
        attempts: { increment: 1 },
        lastError: null,
      },
    });
    if (claimed.count === 0) continue; // already claimed by another worker

    const fresh = await prisma.notificationOutbox.findUnique({
      where: { id: notification.id },
    });
    if (!fresh) continue;

    try {
      // Logic: In a real system, this would call Meta/WhatsApp API or another provider
      // For now, we simulate the send based on channel

      if (fresh.channel === "WHATSAPP") {
        // Implementation would go here
        // await whatsappProvider.send(...)
      } else if (fresh.channel === "EMAIL") {
        // Implementation would go here
      } else {
        throw new Error(`Unsupported channel: ${fresh.channel}`);
      }

      await prisma.notificationOutbox.update({
        where: { id: fresh.id },
        data: { status: "SENT", sentAt: new Date(), nextRetryAt: null },
      });

      logger.info("Notification sent successfully", {
        app: "worker",
        outboxId: fresh.id,
        channel: fresh.channel,
        to: fresh.to,
        status: "SENT",
      });

      sent++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Send failed";
      const attempt = fresh.attempts;
      const mins = backoffMinutes(attempt);

      if (mins === 0) {
        await prisma.notificationOutbox.update({
          where: { id: fresh.id },
          data: { status: "FAILED", lastError: msg, nextRetryAt: null },
        });

        logger.error("Notification failed permanently", {
          app: "worker",
          outboxId: fresh.id,
          channel: fresh.channel,
          to: fresh.to,
          error: msg,
          status: "FAILED",
        });

        dead++;
      } else {
        const next = new Date(Date.now() + mins * 60 * 1000);
        await prisma.notificationOutbox.update({
          where: { id: fresh.id },
          data: { status: "FAILED", lastError: msg, nextRetryAt: next },
        });

        logger.warn("Notification send failed, retrying later", {
          app: "worker",
          outboxId: fresh.id,
          channel: fresh.channel,
          to: fresh.to,
          error: msg,
          attempt: fresh.attempts,
          nextRetryAt: next.toISOString(),
          status: "FAILED",
        });

        failed++;
      }
    }
  }

  return { scanned: candidates.length, sent, failed, dead };
}
