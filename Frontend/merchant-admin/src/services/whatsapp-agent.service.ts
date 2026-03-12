import { prisma } from "@/lib/prisma";
export const WhatsAppAgentService = {
    // --- Agent Logic Settings ---
    getSettings: async (storeId: string) => {
        // Upsert to ensure it exists
        return await prisma.whatsAppAgentSettings?.upsert({
            where: { storeId },
            update: {},
            create: { storeId },
        });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateSettings: async (storeId: string, data: any) => {
        return await prisma.whatsAppAgentSettings?.update({
            where: { storeId },
            data,
        });
    },
    // --- Connection (Channel) ---
    getChannel: async (storeId: string) => {
        return await prisma.whatsappChannel?.findUnique({
            where: { storeId },
        });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateChannel: async (storeId: string, data: any) => {
        return await prisma.whatsappChannel?.upsert({
            where: { storeId },
            update: data,
            create: {
                storeId,
                ...data,
            },
        });
    },
    // --- Templates ---
    listTemplates: async (storeId: string) => {
        return await prisma.whatsappTemplate?.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
        });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createTemplate: async (storeId: string, data: any) => {
        // Note: Schema defines storeId as String, not relation in strict sense for this model in some versions,
        // but we pass it directly.
        return await prisma.whatsappTemplate?.create({
            data: {
                storeId,
                name: data.name,
                language: data.language,
                category: data.category,
                status: (data as any).status,
                components: data.components ?? [],
            },
        });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTemplate: async (storeId: string, templateId: any) => {
        const template = await prisma.whatsappTemplate?.findUnique({
            where: { id: templateId }
        });
        if (!template || template.storeId !== storeId) {
            throw new Error("Template not found or access denied");
        }
        return template;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteTemplate: async (storeId: string, templateId: any) => {
        // Ensure ownership
        const template = await prisma.whatsappTemplate?.findUnique({ where: { id: templateId } });
        if (!template || template.storeId !== storeId) {
            throw new Error("Template not found or access denied");
        }
        return await prisma.whatsappTemplate?.delete({
            where: { id: templateId },
        });
    }
};
