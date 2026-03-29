import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class WebhookService {
  constructor(private readonly db = prisma) {}

  async getWebhooks(storeId: string) {
    const webhooks = await this.db.webhook.findMany({
      where: { storeId },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            responseCode: true,
            attempt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks.map((w) => ({
      id: w.id,
      url: w.url,
      events: w.events,
      active: w.active,
      secret: w.secret,
      lastDelivery: w.deliveries[0],
      totalDeliveries: w.deliveries.length,
      successRate: w.deliveries.filter((d) => d.status === 'success').length / 
        (w.deliveries.length || 1),
    }));
  }

  async handleKwikWebhook(jobId: string, kwikStatus: number) {
    const KWIK_TO_DISPATCH: Record<string, string> = {
      ACCEPTED: 'ACCEPTED',
      PICKED_UP: 'PICKED_UP',
      IN_TRANSIT: 'IN_TRANSIT',
      DELIVERED: 'DELIVERED',
      FAILED: 'FAILED',
      CANCELED: 'CANCELLED',
    };

    let vayvaStatus = 'UNKNOWN';
    switch (Number(kwikStatus)) {
      case 1:
        vayvaStatus = 'ACCEPTED';
        break;
      case 2:
        vayvaStatus = 'PICKED_UP';
        break;
      case 3:
        vayvaStatus = 'IN_TRANSIT';
        break;
      case 4:
        vayvaStatus = 'DELIVERED';
        break;
      case 5:
        vayvaStatus = 'FAILED';
        break;
      case 9:
        vayvaStatus = 'CANCELED';
        break;
      default:
        vayvaStatus = 'UNKNOWN';
    }

    if (vayvaStatus === 'UNKNOWN') {
      return { success: true, message: 'Ignored Status' };
    }

    const shipment = await this.db.shipment.findFirst({
      where: { externalId: jobId },
    });

    if (!shipment) {
      throw new Error('Shipment Not Found');
    }

    const prismaStatus = KWIK_TO_DISPATCH[vayvaStatus];
    if (!prismaStatus) {
      return { success: true, message: 'Ignored Status' };
    }

    if (shipment.status === prismaStatus) {
      return { success: true, message: 'Idempotent: Status already set' };
    }

    await this.db.shipment.update({
      where: { id: shipment.id, storeId: shipment.storeId },
      data: { status: prismaStatus },
    });

    logger.info(`[Webhook] Updated shipment ${shipment.id} status to ${prismaStatus}`);
    return { success: true, message: 'Updated' };
  }
}
