import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SiteService {
  constructor(private readonly db = prisma) {}

  async getOverview(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        slug: true,
        isLive: true,
        logoUrl: true,
        plan: true,
        currentTemplateId: true,
        currentTemplateProjectId: true,
        currentSystemTemplateKey: true,
        currentDeploymentId: true,
        draftDeploymentId: true,
        settings: true,
        branding: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const settings = (store.settings as Record<string, any>) || {};
    const branding = (store.branding as Record<string, any>) || {};
    const currentTemplateKey = store.currentSystemTemplateKey || settings.currentTemplateKey || null;
    const currentTemplateProjectId = store.currentTemplateProjectId || settings.currentTemplateProjectId || null;
    const draftChanged = Boolean(settings.draftChanged);

    // Resolve template display info
    let templateInfo: any = null;

    if (currentTemplateKey) {
      templateInfo = {
        type: 'system',
        name: currentTemplateKey,
        key: currentTemplateKey,
      };
    } else if (currentTemplateProjectId) {
      const project = await this.db.templateProject.findFirst({
        where: { id: currentTemplateProjectId, storeId },
        select: { id: true, name: true, updatedAt: true, thumbnailUrl: true },
      });
      templateInfo = project
        ? {
            type: 'custom',
            name: project.name,
            id: project.id,
            updatedAt: project.updatedAt.toISOString(),
            thumbnailUrl: project.thumbnailUrl,
          }
        : null;
    }

    // Fetch deployment history
    const deployments = await this.db.storeDeployment.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Recent activity
    const recentActivity = await this.db.publishHistory.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { createdAt: true, action: true, actorLabel: true },
    });

    const domain = `${store.slug}.vayva.ng`;

    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      domain,
      logoUrl: branding.logoUrl || store.logoUrl,
      branding,
      plan: store.plan,
      isLive: store.isLive,
      draftChanged,
      currentTemplate: templateInfo,
      currentDeploymentId: store.currentDeploymentId,
      draftDeploymentId: store.draftDeploymentId,
      deployments,
      lastPublished: recentActivity[0]
        ? {
            at: recentActivity[0].createdAt,
            action: recentActivity[0].action,
          }
        : null,
      recentActivity,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  async updateSiteSettings(storeId: string, updates: any) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const currentSettings = (store.settings as Record<string, any>) || {};
    const nextSettings = {
      ...currentSettings,
      ...updates,
    };

    const updated = await this.db.store.update({
      where: { id: storeId },
      data: { settings: nextSettings },
    });

    logger.info(`[Site] Updated settings for store ${storeId}`);
    return updated;
  }
}
