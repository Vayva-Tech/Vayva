import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class WebstudioService {
  constructor(private readonly db = prisma) {}

  async getStudioConfig(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        slug: true,
        currentTemplateId: true,
        currentTemplateProjectId: true,
        settings: true,
        branding: true,
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    return {
      store,
      config: {
        theme: (store.settings as any)?.theme || {},
        layout: (store.settings as any)?.layout || {},
        components: (store.settings as any)?.components || [],
      },
    };
  }

  async updateStudioConfig(storeId: string, config: any) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const currentSettings = (store.settings as Record<string, any>) || {};
    const nextSettings = {
      ...currentSettings,
      ...config,
    };

    const updated = await this.db.store.update({
      where: { id: storeId },
      data: { settings: nextSettings },
    });

    logger.info(`[Webstudio] Updated config for store ${storeId}`);
    return updated;
  }

  async publishChanges(storeId: string, userId: string) {
    const publishHistory = await this.db.publishHistory.create({
      data: {
        id: `pub-${Date.now()}`,
        storeId,
        action: 'PUBLISHED',
        actorId: userId,
        actorLabel: 'merchant',
        publishedAt: new Date(),
      },
    });

    await this.db.store.update({
      where: { id: storeId },
      data: {
        isLive: true,
        currentDeploymentId: `dep-${Date.now()}`,
      },
    });

    logger.info(`[Webstudio] Published changes for store ${storeId}`);
    return publishHistory;
  }

  async createProject(storeId: string, templateProjectId: string) {
    const project = await this.db.templateProject.findFirst({
      where: { id: templateProjectId, storeId },
    });

    if (!project) {
      throw new Error('Template project not found');
    }

    if (project.webstudioProjectId) {
      return {
        projectId: project.webstudioProjectId,
        editorUrl: `${process.env.WEBSTUDIO_BASE_URL}/builder/${project.webstudioProjectId}`,
      };
    }

    const webstudioProjectId = `ws_${project.id}`;
    const editorUrl = `${process.env.WEBSTUDIO_BASE_URL}/builder/${webstudioProjectId}`;

    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { branding: true },
    });

    const branding = (store?.branding as Record<string, any>) || {};
    const projectConfig = (project.config as Record<string, any>) || {};

    const mergedConfig = {
      ...projectConfig,
      branding: {
        primaryColor: branding.primaryColor || null,
        accentColor: branding.accentColor || null,
        logoUrl: branding.logoUrl || null,
      },
    };

    await this.db.templateProject.update({
      where: { id: project.id },
      data: {
        webstudioProjectId,
        source: 'WEBSTUDIO',
        config: mergedConfig,
      },
    });

    logger.info(`[Webstudio] Created project ${webstudioProjectId} for store ${storeId}`);
    return {
      projectId: webstudioProjectId,
      editorUrl,
    };
  }

  async exportProject(projectId: string, storeId: string, userId: string) {
    const project = await this.db.templateProject.findFirst({
      where: { id: projectId, storeId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.webstudioProjectId) {
      throw new Error('Project is not linked to Webstudio');
    }

    // Create export record
    const exportRecord = await this.db.exportJob.create({
      data: {
        id: `exp-${Date.now()}`,
        storeId,
        userId,
        projectId,
        type: 'WEBSTUDIO_PROJECT',
        status: 'PROCESSING',
        createdAt: new Date(),
      },
    });

    logger.info(`[Webstudio] Export started for project ${projectId}`);
    
    return {
      exportId: exportRecord.id,
      status: 'PROCESSING',
      message: 'Export initiated. This may take a few moments.',
    };
  }
}
