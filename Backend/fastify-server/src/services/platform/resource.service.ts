import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class ResourceService {
  constructor(private readonly db = prisma) {}

  async listResources(storeId: string, type?: string) {
    const resources = await this.db.resource.findMany({
      where: {
        storeId,
        ...(type && { type }),
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      url: r.url,
      mimeType: r.mimeType,
      size: r.size ? Number(r.size) : null,
      tags: r.tags,
      metadata: r.metadata,
      uploadedBy: r.uploadedBy
        ? `${r.uploadedBy.firstName} ${r.uploadedBy.lastName}`
        : null,
      createdAt: r.createdAt,
    }));
  }
}
