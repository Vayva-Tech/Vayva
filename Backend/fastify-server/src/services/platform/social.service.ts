import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SocialService {
  constructor(private readonly db = prisma) {}

  async getSocialConnections(storeId: string) {
    const connections = await this.db.socialConnection.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return connections;
  }

  async createSocialConnection(storeId: string, connectionData: any) {
    const { platform, accessToken, refreshToken, platformUserId, metadata } = connectionData;

    if (!platform || !accessToken) {
      throw new Error('Platform and access token are required');
    }

    const connection = await this.db.socialConnection.create({
      data: {
        id: `sc-${Date.now()}`,
        storeId,
        platform,
        accessToken,
        refreshToken: refreshToken || null,
        platformUserId: platformUserId || null,
        metadata: metadata || {},
        status: 'ACTIVE',
        connectedAt: new Date(),
      },
    });

    logger.info(`[Social] Connected ${platform} for store ${storeId}`);
    return connection;
  }

  async disconnectSocial(connectionId: string, storeId: string) {
    const connection = await this.db.socialConnection.findFirst({
      where: { id: connectionId },
    });

    if (!connection || connection.storeId !== storeId) {
      throw new Error('Connection not found');
    }

    await this.db.socialConnection.update({
      where: { id: connectionId },
      data: { status: 'DISCONNECTED', disconnectedAt: new Date() },
    });

    logger.info(`[Social] Disconnected ${connection.platform}`);
    return { success: true };
  }
}
