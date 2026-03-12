import { Worker, Queue } from "bullmq";
import { prisma, MessageType } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import { AIProvider } from "../lib/ai";
import type { RedisConnection, AgentActionsJobData } from "../types";

export function registerAgentActionsWorker(connection: RedisConnection): void {
  const whatsappOutboundQueue = new Queue(QUEUES.WHATSAPP_OUTBOUND, { connection });

  new Worker<AgentActionsJobData>(
    QUEUES.AGENT_ACTIONS,
    async (job) => {
      const { messageId, storeId } = job.data;

      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            include: { contact: true },
          },
        },
      });

      if (!message || !message.textBody) return;

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
          products: {
            where: { status: "ACTIVE" },
            take: 10,
          },
        },
      });

      if (!store) return;

      const replyText = await AIProvider.chat(
        [{ role: "user", content: message.textBody }],
        {
          storeName: store.name,
          customerName: message.conversation.contact.displayName || undefined,
          products: store.products.map((p) => ({
            name: p.title,
            price: Number(p.price),
          })),
        },
      );

      if (replyText) {
        await whatsappOutboundQueue.add("send", {
          to: message.conversation.contact.phoneE164,
          body: replyText,
          storeId,
          messageId: message.id,
        });
      }
    },
    { 
      connection,
      concurrency: 3,
      lockDuration: 60000,
      stalledInterval: 30000,
      maxStalledCount: 2,
    },
  );

  logger.info("Registered agent actions worker", { queue: QUEUES.AGENT_ACTIONS, app: "worker" });
}
