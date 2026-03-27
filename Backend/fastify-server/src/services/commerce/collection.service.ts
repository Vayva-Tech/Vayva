import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class CollectionService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string, filters?: any) {
    const collections = await this.db.collection.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { collectionProducts: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return collections.map((col) => ({
      id: col.id,
      name: col.title,
      handle: col.handle,
      count: col._count.collectionProducts,
      visibility: 'Public',
      updated: col.updatedAt.toISOString(),
    }));
  }

  async create(storeId: string, data: any) {
    const { title, handle, description } = data;

    if (!title || !handle) {
      throw new Error('Title and handle are required');
    }

    // Check for handle collision within store
    const existing = await this.db.collection.findUnique({
      where: { storeId_handle: { storeId, handle } },
    });

    if (existing) {
      throw new Error('A collection with this handle already exists in your store.');
    }

    const collection = await this.db.collection.create({
      data: {
        storeId,
        title,
        handle: handle.toLowerCase().replace(/\s+/g, '-'),
        description: description || null,
      },
    });

    logger.info(`[Collection] Created ${collection.id}`);
    return collection;
  }

  async update(collectionId: string, storeId: string, data: any) {
    const collection = await this.db.collection.findFirst({
      where: { id: collectionId, storeId },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    const updated = await this.db.collection.update({
      where: { id: collectionId },
      data: {
        ...data,
        handle: data.handle ? data.handle.toLowerCase().replace(/\s+/g, '-') : undefined,
      },
    });

    logger.info(`[Collection] Updated ${collection.id}`);
    return updated;
  }

  async delete(collectionId: string, storeId: string) {
    const collection = await this.db.collection.findFirst({
      where: { id: collectionId, storeId },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    await this.db.collection.delete({
      where: { id: collectionId },
    });

    logger.info(`[Collection] Deleted ${collectionId}`);
    return { success: true };
  }
}
