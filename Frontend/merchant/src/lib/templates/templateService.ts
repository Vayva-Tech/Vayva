import { prisma } from "@vayva/db";
export class TemplateService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async applyTemplate(storeId: string, templateId: any, userId: string) {
        // 1. Verify Template Exists
        const template = await prisma.templateManifest.findUnique({
            where: { id: templateId },
        });
        if (!template)
            throw new Error("Template not found");
        // 2. Get Current Selection (for Rollback)
        const current = await prisma.storeTemplateSelection.findUnique({
            where: { storeId },
        });
        // 3. Transactional Update
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            await tx.storeTemplateSelection.upsert({
                where: { storeId },
                update: {
                    templateId,
                    version: template.version,
                    config: template.configSchema || {}, // Default config
                    previousTemplateId: current?.templateId,
                    previousVersion: current?.version,
                    previousConfig: current?.config,
                    appliedAt: new Date(),
                    appliedBy: userId,
                },
                create: {
                    storeId,
                    templateId,
                    version: template.version,
                    config: template.configSchema || {},
                    appliedAt: new Date(),
                    appliedBy: userId,
                },
            });
            // 4. Audit
            await tx.auditLog.create({
                data: {
                    action: "template.apply",
                    actorType: "merchant_user",
                    actorId: userId,
                    actorLabel: "Merchant User",
                    storeId: storeId,
                    correlationId: crypto.randomUUID(),
                    afterState: { templateId, version: template.version },
                },
            });
        });
        return { success: true };
    }
    static async rollback(storeId: string, userId: string) {
        const current = await prisma.storeTemplateSelection.findUnique({
            where: { storeId },
        });
        if (!current || !current.previousTemplateId) {
            throw new Error("No previous template to rollback to");
        }
        // Apply Previous
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            await tx.storeTemplateSelection.update({
                where: { storeId },
                data: {
                    templateId: current.previousTemplateId,
                    version: current.previousVersion,
                    config: current.previousConfig,
                    // Shift current to previous? Or just clear previous?
                    // Let's just swap them to allow toggle back and forth potentially,
                    // or usually rollback clears the "Redo" stack.
                    // For simplicity: Set previous to NULL to prevent infinite rollback loop or simple toggle.
                    previousTemplateId: current.templateId,
                    previousVersion: current.version,
                    previousConfig: current.config,
                    appliedAt: new Date(),
                    appliedBy: userId,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: "template.rollback",
                    actorType: "merchant_user",
                    actorId: userId,
                    actorLabel: "Merchant User",
                    storeId: storeId,
                    correlationId: crypto.randomUUID(),
                    afterState: {
                        from: current.templateId,
                        to: current.previousTemplateId,
                    },
                },
            });
        });
        return { success: true };
    }
}
