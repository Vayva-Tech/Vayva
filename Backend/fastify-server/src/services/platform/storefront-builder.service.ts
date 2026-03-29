import { prisma, Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class StorefrontBuilderService {
  constructor(private readonly db = prisma) {}

  async saveDraft(storeId: string, designData: Record<string, unknown>) {
    const draft = await this.db.storeDesign.create({
      data: {
        id: `design-${Date.now()}`,
        storeId,
        version: 'DRAFT',
        designData: designData as Prisma.JsonObject,
        status: 'DRAFT',
      },
    });

    logger.info(`[Storefront] Saved draft design ${draft.id} for store ${storeId}`);
    return draft;
  }

  async publishStore(storeId: string, slug: string) {
    // Get latest draft
    const draft = await this.db.storeDesign.findFirst({
      where: {
        storeId,
        version: 'DRAFT',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!draft) {
      throw new Error('No draft design found');
    }

    // Create published version
    const published = await this.db.storeDesign.create({
      data: {
        id: `design-${Date.now()}`,
        storeId,
        version: slug,
        designData: draft.designData,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    // Update store slug
    await this.db.store.update({
      where: { id: storeId },
      data: { slug },
    });

    logger.info(`[Storefront] Published store ${storeId} with slug ${slug}`);
    return published;
  }

  async unpublishStore(storeId: string) {
    await this.db.storeDesign.updateMany({
      where: {
        storeId,
        status: 'PUBLISHED',
      },
      data: { status: 'UNPUBLISHED' },
    });

    logger.info(`[Storefront] Unpublished store ${storeId}`);
    return { success: true };
  }

  async getPublishedStore(slug: string) {
    const design = await this.db.storeDesign.findFirst({
      where: {
        version: slug,
        status: 'PUBLISHED',
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            brandColor: true,
          },
        },
      },
    });

    if (!design) {
      throw new Error('Published store not found');
    }

    return {
      slug,
      design: design.designData,
      store: design.store,
    };
  }

  async updateTheme(storeId: string, themeConfig: Record<string, unknown>) {
    const currentDesign = await this.db.storeDesign.findFirst({
      where: {
        storeId,
        version: 'DRAFT',
      },
      orderBy: { createdAt: 'desc' },
    });

    const designData = currentDesign?.designData || {};
    const updatedDesign = {
      ...designData,
      theme: themeConfig,
    };

    return this.saveDraft(storeId, updatedDesign);
  }

  async addSection(
    storeId: string,
    sectionType: string,
    config: Record<string, unknown>
  ) {
    const currentDesign = await this.db.storeDesign.findFirst({
      where: {
        storeId,
        version: 'DRAFT',
      },
      orderBy: { createdAt: 'desc' },
    });

    const designData = (currentDesign?.designData as any) || {};
    const sections = designData.sections || [];
    
    const newSection = {
      id: `section-${Date.now()}`,
      type: sectionType,
      config,
      order: sections.length,
    };

    sections.push(newSection);
    const updatedDesign = {
      ...designData,
      sections,
    };

    return this.saveDraft(storeId, updatedDesign);
  }

  async removeSection(storeId: string, sectionId: string) {
    const currentDesign = await this.db.storeDesign.findFirst({
      where: {
        storeId,
        version: 'DRAFT',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!currentDesign) {
      throw new Error('No draft design found');
    }

    const designData = (currentDesign.designData as any) || {};
    const sections = designData.sections || [];
    
    const updatedSections = sections.filter((s: any) => s.id !== sectionId);
    const updatedDesign = {
      ...designData,
      sections: updatedSections,
    };

    return this.saveDraft(storeId, updatedDesign);
  }

  async reorderSections(storeId: string, sectionIds: string[]) {
    const currentDesign = await this.db.storeDesign.findFirst({
      where: {
        storeId,
        version: 'DRAFT',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!currentDesign) {
      throw new Error('No draft design found');
    }

    const designData = (currentDesign.designData as any) || {};
    const sections = designData.sections || [];
    
    // Reorder based on new order
    const reorderedSections = sectionIds.map((id, index) => {
      const section = sections.find((s: any) => s.id === id);
      return section ? { ...section, order: index } : null;
    }).filter(Boolean);

    const updatedDesign = {
      ...designData,
      sections: reorderedSections,
    };

    return this.saveDraft(storeId, updatedDesign);
  }

  async previewStore(storeId: string, draftId?: string) {
    const design = await this.db.storeDesign.findFirst({
      where: {
        id: draftId,
        storeId,
      },
    });

    if (!design) {
      throw new Error('Draft design not found');
    }

    return {
      preview: design.designData,
      isDraft: design.version === 'DRAFT',
      createdAt: design.createdAt,
    };
  }

  async rollbackToVersion(storeId: string, versionId: string) {
    const version = await this.db.storeDesign.findFirst({
      where: {
        id: versionId,
        storeId,
      },
    });

    if (!version) {
      throw new Error('Version not found');
    }

    // Create new draft from version
    const draft = await this.db.storeDesign.create({
      data: {
        id: `design-${Date.now()}`,
        storeId,
        version: 'DRAFT',
        designData: version.designData,
        status: 'DRAFT',
        notes: `Rolled back from version ${versionId}`,
      },
    });

    logger.info(`[Storefront] Rolled back store ${storeId} to version ${versionId}`);
    return draft;
  }

  async getDesignHistory(storeId: string) {
    const designs = await this.db.storeDesign.findMany({
      where: { storeId },
      select: {
        id: true,
        version: true,
        status: true,
        createdAt: true,
        publishedAt: true,
        notes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return designs;
  }
}
