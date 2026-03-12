import { prisma, Prisma, WhatsappTemplateStatus } from "@/lib/db";

/**
 * Server-side service for WhatsApp AI Agent interactions.
 * Handles database persistence and internal task logic.
 */
export const WhatsAppAgentService = {
  // 1. Thread Management (mapped to Conversation)
  getRecentThreads: async (storeId: string, limit = 10) => {
    return await prisma.conversation.findMany({
      where: { storeId },
      orderBy: { lastMessageAt: "desc" },
      take: limit,
    });
  },

  // 2. Knowledge Base Persistence (mapped to KnowledgeBaseEntry)
  upsertKBEntry: async (
    storeId: string,
    data: { question: string; answer: string; content?: string },
  ) => {
    return await prisma.knowledgeBaseEntry.create({
      data: {
        storeId,
        content: data.content || data.answer,
        sourceType: "MANUAL",
        // Note: KnowledgeBaseEntry schema doesn't have metadata field based on our audit,
        // but we keep the logic consistent with schema fields.
      },
    });
  },

  // 3. Automation Rules (mapped to AutomationRule)
  listRules: async (storeId: string) => {
    return await prisma.automationRule.findMany({
      where: { storeId, enabled: true },
    });
  },

  updateRule: async (ruleId: string, data: { enabled: boolean }) => {
    return await prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        enabled: data.enabled,
      },
    });
  },

  // 4. WhatsApp Channels (mapped to WhatsappChannel)
  getChannel: async (storeId: string) => {
    return await prisma.whatsappChannel.findUnique({
      where: { storeId },
    });
  },

  // --- Templates ---
  listTemplates: async (storeId: string) => {
    return await prisma.whatsappTemplate.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  },

  createTemplate: async (
    storeId: string,
    data: {
      name: string;
      language: string;
      category: string;
      status: string;
      components?: unknown[];
    },
  ) => {
    return await prisma.whatsappTemplate.create({
      data: {
        storeId,
        name: data.name,
        language: data.language,
        category: data.category,
        status: data.status as WhatsappTemplateStatus,
        components: (data.components as Prisma.InputJsonValue[]) ?? [],
      },
    });
  },

  getTemplate: async (storeId: string, templateId: string) => {
    const template = await prisma.whatsappTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template || template.storeId !== storeId) {
      throw new Error("Template not found or access denied");
    }
    return template;
  },

  deleteTemplate: async (storeId: string, templateId: string) => {
    return await prisma.whatsappTemplate.delete({
      where: { id: templateId, storeId },
    });
  },
};
