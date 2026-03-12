import { prisma, Prisma } from "@vayva/db";
export class TemplateService {
  static async applyTemplate(
    storeId: string,
    templateId: string,
    userId: string,
  ) {
    // 1. Verify Template Exists
    const template = await prisma.templateManifest.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new Error("Template not found");
    // 2. Get Current Selection (for Rollback)
    const current = await prisma.storeTemplateSelection.findUnique({
      where: { storeId },
    });
    // 3. Transactional Update
    await prisma.$transaction(async (tx) => {
      await tx.storeTemplateSelection.upsert({
        where: { storeId },
        update: {
          templateId,
          version: template.version,
          config: (template.configSchema as Prisma.InputJsonValue) || {}, // Default config
          previousTemplateId: current?.templateId,
          previousVersion: current?.version,
          previousConfig: current?.config as Prisma.InputJsonValue,
          appliedAt: new Date(),
          appliedBy: userId,
        },
        create: {
          storeId,
          templateId,
          version: template.version,
          config: (template.configSchema as Prisma.InputJsonValue) || {},
          appliedAt: new Date(),
          appliedBy: userId,
        },
      });
      // 4. Audit
      await tx.auditLog.create({
        data: {
          action: "template.apply",
          actorUserId: userId,
          targetStoreId: storeId,
          app: "merchant",
          targetType: "store",
          targetId: storeId,
          requestId: crypto.randomUUID(),
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
    await prisma.$transaction(async (tx) => {
      await tx.storeTemplateSelection.update({
        where: { storeId },
        data: {
          templateId: current.previousTemplateId!,
          version: current.previousVersion ?? undefined,
          config: current.previousConfig as Prisma.InputJsonValue,
          // Shift current to previous? Or just clear previous?
          // Let's just swap them to allow toggle back and forth potentially,
          // or usually rollback clears the "Redo" stack.
          // For simplicity: Set previous to NULL to prevent infinite rollback loop or simple toggle.
          previousTemplateId: current.templateId,
          previousVersion: current.version,
          previousConfig: current.config as Prisma.InputJsonValue,
          appliedAt: new Date(),
          appliedBy: userId,
        },
      });
      await tx.auditLog.create({
        data: {
          action: "template.rollback",
          actorUserId: userId,
          targetStoreId: storeId,
          app: "merchant",
          targetType: "store",
          targetId: storeId,
          requestId: crypto.randomUUID(),
        },
      });
    });
    return { success: true };
  }
}
