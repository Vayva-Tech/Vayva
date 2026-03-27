import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class FulfillmentService {
  constructor(private readonly db = prisma) {}

  async getShipments(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 200);
    const offset = filters.offset || 0;

    const where: any = { storeId };

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.issue) {
      if (filters.issue === 'ALL') {
        // No filter
      } else {
        // Map issue to specific statuses
        where.status = { in: ['FAILED', 'CANCELLED'] };
      }
    }

    const [shipments, total] = await Promise.all([
      this.db.shipment.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              customerId: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.shipment.count({ where }),
    ]);

    return {
      shipments: shipments.map((s) => ({
        id: s.id,
        orderId: s.orderId,
        orderNumber: s.order?.orderNumber || 'Unknown',
        status: s.status,
        provider: s.provider,
        trackingCode: s.trackingCode,
        trackingUrl: s.trackingUrl,
        courierName: s.courierName,
        recipientName: s.recipientName,
        updatedAt: s.updatedAt,
      })),
      total,
      limit,
      offset,
    };
  }

  async createShipment(storeId: string, shipmentData: any) {
    const {
      orderId,
      provider,
      recipientName,
      recipientAddress,
      recipientPhone,
      items,
      metadata,
    } = shipmentData;

    // Verify order exists and belongs to store
    const order = await this.db.order.findFirst({
      where: { id: orderId, storeId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const shipment = await this.db.shipment.create({
      data: {
        id: `shp-${Date.now()}`,
        storeId,
        orderId,
        provider: provider || 'manual',
        recipientName: recipientName || order.shippingName,
        recipientAddress: recipientAddress || order.shippingAddress,
        recipientPhone: recipientPhone || order.shippingPhone,
        status: 'CREATED',
        items: (items as any) || [],
        metadata: (metadata as any) || {},
      },
    });

    logger.info(`[Fulfillment] Created shipment ${shipment.id}`);
    return shipment;
  }

  async updateShipmentStatus(shipmentId: string, storeId: string, status: string) {
    const shipment = await this.db.shipment.findFirst({
      where: { id: shipmentId, storeId },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const updated = await this.db.shipment.update({
      where: { id: shipmentId },
      data: { status },
    });

    logger.info(`[Fulfillment] Updated shipment ${shipmentId} status to ${status}`);
    return updated;
  }

  async assignCourier(shipmentId: string, storeId: string, courierData: any) {
    const { courierName, trackingCode, trackingUrl } = courierData;

    const shipment = await this.db.shipment.findFirst({
      where: { id: shipmentId, storeId },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const updated = await this.db.shipment.update({
      where: { id: shipmentId },
      data: {
        courierName,
        trackingCode,
        trackingUrl,
        status: 'ASSIGNED',
      },
    });

    logger.info(`[Fulfillment] Assigned courier to shipment ${shipmentId}`);
    return updated;
  }

  async markAsDelivered(shipmentId: string, storeId: string, proof?: any) {
    const shipment = await this.db.shipment.findFirst({
      where: { id: shipmentId, storeId },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const updated = await this.db.shipment.update({
      where: { id: shipmentId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        metadata: {
          ...(shipment.metadata as any),
          ...proof,
        },
      },
    });

    logger.info(`[Fulfillment] Marked shipment ${shipmentId} as delivered`);
    return updated;
  }
}
