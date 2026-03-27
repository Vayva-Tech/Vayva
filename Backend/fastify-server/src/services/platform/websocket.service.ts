import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class WebsocketService {
  constructor(private readonly db = prisma) {}

  async broadcastMessage(storeId: string, message: any) {
    const { channel, data, type } = message;

    if (!channel || !data) {
      throw new Error('Channel and data are required');
    }

    const broadcast = await this.db.websocketMessage.create({
      data: {
        id: `ws-${Date.now()}`,
        storeId,
        channel,
        type: type || 'BROADCAST',
        payload: data,
        sentAt: new Date(),
      },
    });

    logger.info(`[WebSocket] Broadcast to ${channel} in store ${storeId}`);
    return broadcast;
  }

  async getConnectionStats(storeId: string) {
    const connections = await this.db.websocketConnection.findMany({
      where: { storeId, status: 'ACTIVE' },
    });

    return {
      totalConnections: connections.length,
      connections,
    };
  }
}
