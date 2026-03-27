import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class PortfolioService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string) {
    const projects = await this.db.portfolioProject.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  async create(storeId: string, data: any) {
    const { title, description } = data;

    if (!title) {
      throw new Error('Title is required');
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now();

    const project = await this.db.portfolioProject.create({
      data: {
        storeId,
        title,
        description: description || null,
        slug,
        images: [],
      },
    });

    logger.info(`[Portfolio] Created project ${project.id}`);
    return project;
  }

  async findOne(projectId: string, storeId: string) {
    const project = await this.db.portfolioProject.findFirst({
      where: { id: projectId, storeId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async update(projectId: string, storeId: string, data: any) {
    const existing = await this.db.portfolioProject.findFirst({
      where: { id: projectId, storeId },
    });

    if (!existing) {
      throw new Error('Project not found');
    }

    const { title, description, images } = data;
    const updateData: any = {};

    if (title) {
      updateData.title = title;
      if (!updateData.slug) {
        updateData.slug =
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') +
          '-' +
          Date.now();
      }
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (images && Array.isArray(images)) {
      updateData.images = images;
    }

    const project = await this.db.portfolioProject.update({
      where: { id: projectId },
      data: updateData,
    });

    logger.info(`[Portfolio] Updated project ${projectId}`);
    return project;
  }

  async delete(projectId: string, storeId: string) {
    const existing = await this.db.portfolioProject.findFirst({
      where: { id: projectId, storeId },
    });

    if (!existing) {
      throw new Error('Project not found');
    }

    await this.db.portfolioProject.delete({
      where: { id: projectId },
    });

    logger.info(`[Portfolio] Deleted project ${projectId}`);
  }
}
