import { Worker, Queue } from "bullmq";
import { prisma, Direction, MessageStatus, MessageType } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import { getRedis } from "@vayva/redis";
import { WorkerRescueService } from "../lib/worker-rescue";
import type { RedisConnection, WhatsAppInboundJobData } from "../types";

export function registerWhatsAppInboundWorker(connection: RedisConnection): void {
  const agentActionsQueue = new Queue(QUEUES.AGENT_ACTIONS, { connection });

  new Worker<WhatsAppInboundJobData>(
    QUEUES.WHATSAPP_INBOUND,
    async (job) => {
      const { storeId, payload } = job.data;
      const messageData = payload.messages?.[0];
      const contactData = payload.contacts?.[0];

      if (!messageData || !contactData) return;

      const messageId = messageData.id;
      const dedupeKey = `wa_msg:${messageId}`;

      const redis = await getRedis();
      const isProcessed = await redis.get(dedupeKey);
      if (isProcessed) return;
      await redis.set(dedupeKey, "1", "EX", 60 * 60 * 24);

      try {
        const waId = contactData.wa_id;
        let contact = await prisma.contact.findUnique({
          where: {
            storeId_channel_externalId: {
              storeId,
              channel: "WHATSAPP",
              externalId: waId,
            },
          },
        });

        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              storeId,
              channel: "WHATSAPP",
              externalId: waId,
              displayName: contactData.profile?.name,
              phoneE164: waId,
            },
          });
        }

        let conversation = await prisma.conversation.findUnique({
          where: {
            storeId_contactId: {
              storeId,
              contactId: contact.id,
            },
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              storeId,
              contactId: contact.id,
              status: "OPEN",
            },
          });
        }

        const message = await prisma.message.create({
          data: {
            storeId,
            conversationId: conversation.id,
            direction: Direction.INBOUND,
            type: (messageData.type?.toUpperCase() as MessageType) || MessageType.TEXT,
            providerMessageId: messageId,
            textBody: messageData.text?.body || "",
            status: MessageStatus.DELIVERED,
            receivedAt: new Date(),
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(),
            unreadCount: { increment: 1 },
          },
        });

        if (message.type === MessageType.TEXT) {
          await agentActionsQueue.add("process", {
            messageId: message.id,
            storeId,
          });
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Error processing inbound message", {
          error: err.message,
          stack: err.stack,
          queue: QUEUES.WHATSAPP_INBOUND,
          jobId: job.id,
          app: "worker",
        });
        await WorkerRescueService.reportJobFailure(QUEUES.WHATSAPP_INBOUND, job.id!, error);
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

  logger.info("Registered WhatsApp inbound worker", { queue: QUEUES.WHATSAPP_INBOUND, app: "worker" });
}
