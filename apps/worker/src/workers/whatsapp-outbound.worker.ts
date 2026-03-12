import { Worker } from "bullmq";
import { prisma, MessageStatus } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import { metaProvider } from "../lib/providers";
import type { RedisConnection, WhatsAppOutboundJobData } from "../types";

export function registerWhatsAppOutboundWorker(connection: RedisConnection): void {
  new Worker<WhatsAppOutboundJobData>(
    QUEUES.WHATSAPP_OUTBOUND,
    async (job) => {
      const { to, body, messageId } = job.data;

      try {
        const result = await metaProvider.sendMessage({
          recipient: to,
          type: "text",
          body,
        });

        if (messageId) {
          await prisma.message.update({
            where: { id: messageId },
            data: {
              status: MessageStatus.SENT,
              providerMessageId: result.providerMessageId,
              sentAt: new Date(),
            },
          });
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Failed to send message", {
          error: err.message,
          stack: err.stack,
          queue: QUEUES.WHATSAPP_OUTBOUND,
          jobId: job.id,
          app: "worker",
        });
        if (messageId) {
          await prisma.message.update({
            where: { id: messageId },
            data: { status: MessageStatus.FAILED },
          });
        }
        throw error;
      }
    },
    { 
      connection,
      concurrency: 5,
      lockDuration: 30000,
      stalledInterval: 30000,
      maxStalledCount: 2,
    },
  );

  logger.info("Registered WhatsApp outbound worker", { queue: QUEUES.WHATSAPP_OUTBOUND, app: "worker" });
}
