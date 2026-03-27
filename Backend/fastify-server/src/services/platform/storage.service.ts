import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class StorageService {
  constructor(private readonly db = prisma) {}

  async uploadFile(storeId: string, userId: string, fileData: any) {
    const { fileName, fileType, fileSize, fileUrl } = fileData;

    if (!fileName || !fileType || !fileUrl) {
      throw new Error('File name, type, and URL are required');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (fileSize && fileSize > maxSize) {
      throw new Error('File too large (max 10MB)');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedTypes.includes(fileType)) {
      throw new Error('Invalid file type');
    }

    const file = await this.db.fileUpload.create({
      data: {
        id: `file-${Date.now()}`,
        storeId,
        uploadedBy: userId,
        fileName,
        fileType,
        fileSize: fileSize || 0,
        fileUrl,
        status: 'ACTIVE',
        uploadedAt: new Date(),
      },
    });

    logger.info(`[Storage] Uploaded file ${file.id}`);
    return {
      id: file.id,
      url: file.fileUrl,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      createdAt: file.uploadedAt,
    };
  }

  async getFiles(storeId: string, filters?: any) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const where: any = { storeId, status: 'ACTIVE' };

    if (filters?.type) {
      where.fileType = { contains: filters.type };
    }

    const [files, total] = await Promise.all([
      this.db.fileUpload.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.fileUpload.count({ where }),
    ]);

    return {
      files,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async deleteFile(fileId: string, storeId: string) {
    const file = await this.db.fileUpload.findFirst({
      where: { id: fileId },
    });

    if (!file || file.storeId !== storeId) {
      throw new Error('File not found');
    }

    await this.db.fileUpload.update({
      where: { id: fileId },
      data: { status: 'DELETED' },
    });

    logger.info(`[Storage] Deleted file ${fileId}`);
    return { success: true };
  }
}
