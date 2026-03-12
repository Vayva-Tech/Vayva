import { Worker } from "bullmq";
import { prisma, MessageStatus } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import { evolutionProvider, metaProvider } from "../lib/providers";
import type { RedisConnection, WhatsAppOutboundJobData } from "../types";

export function registerWhatsAppOutboundWorker(
  connection: RedisConnection,
): void {
  new Worker<WhatsAppOutboundJobData>(
    QUEUES.WHATSAPP_OUTBOUND,
    async (job) => {
      const data = job.data as WhatsAppOutboundJobData & { message?: string };
      const to = data.to;
      const body = data.body || data.message || "";
      const messageId = data.messageId;
      const instanceName = data.instanceName || `merchant_${data.storeId}`;

      if (!to || !body) {
        logger.error("Invalid WhatsApp outbound job payload", {
          queue: QUEUES.WHATSAPP_OUTBOUND,
          jobId: job.id,
          hasTo: Boolean(to),
          hasBody: Boolean(body),
          app: "worker",
        });
        if (messageId) {
          await prisma.message.update({
            where: { id: messageId },
            data: { status: MessageStatus.FAILED },
          });
        }
        throw new Error("Invalid WhatsApp outbound job payload");
      }

      const evolutionKey = process.env.EVOLUTION_API_KEY || "";
      const metaToken = process.env.WHATSAPP_API_TOKEN || "";
      const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

      try {
        let providerMessageId: string | undefined;

        // Prefer Evolution (self-hosted) when configured.
        if (evolutionKey && instanceName) {
          const result = await evolutionProvider.sendText({
            instanceName,
            to,
            body,
          });
          providerMessageId = result.providerMessageId;
        } else if (metaToken && metaPhoneId) {
          const result = await metaProvider.sendMessage({
            recipient: to,
            type: "text",
            body,
          });
          providerMessageId = result.providerMessageId;
        } else {
          // Previously MetaProvider would "simulate" a send here, which can silently break the product.
          throw new Error(
            "WhatsApp outbound is not configured: set EVOLUTION_API_KEY + EVOLUTION_INSTANCE_NAME (preferred), or WHATSAPP_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID.",
          );
        }

        if (messageId) {
          await prisma.message.update({
            where: { id: messageId },
            data: {
              status: MessageStatus.SENT,
              providerMessageId,
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
    { connection },
  );
  logger.info("Registered WhatsApp outbound worker", {
    queue: QUEUES.WHATSAPP_OUTBOUND,
    app: "worker",
  });
}
