import { prisma } from '@vayva/db';
import { getDeliveryProvider } from './delivery-provider';
import { logger } from '../../lib/logger';

interface OrderWithStore {
  id: string;
  storeId: string;
  orderNumber: string;
  customerPhone?: string | null;
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  } | null;
  shipments?: Array<{
    status: string;
    recipientName?: string | null;
    recipientPhone?: string | null;
    addressLine1?: string | null;
    addressCity?: string | null;
  }>;
  store: {
    deliverySettings: {
      isEnabled: boolean;
      provider: string;
      autoDispatchEnabled: boolean;
      autoDispatchWhatsapp?: boolean;
      autoDispatchStorefront?: boolean;
      autoDispatchMode?: string;
      pickupAddressLine1?: string | null;
    } | null;
  };
}

interface DispatchResult {
  success: boolean;
  status: string;
  reason?: string;
  shipment?: unknown;
  providerJobId?: string;
  trackingUrl?: string;
}

export class DeliveryService {
  constructor(private readonly db = prisma) {}

  checkReadiness(order: OrderWithStore, settings: any) {
    const blockers: string[] = [];

    if (!settings.isEnabled) {
      return { status: 'DISABLED', blockers: ['Delivery Disabled'] };
    }

    if (!settings.pickupAddressLine1) {
      blockers.push('Store Pickup Address Missing');
    }

    if (settings.provider === 'KWIK' && !process.env.KWIK_API_KEY) {
      blockers.push('Kwik API Key Not Configured');
    }

    const recipientPhone = order.shipments?.[0]?.recipientPhone ||
      order.customerPhone ||
      order.customer?.phone;
    const addressLine1 = order.shipments?.[0]?.addressLine1;

    if (!recipientPhone) blockers.push('Recipient Phone Missing');
    if (!addressLine1 && !blockers.includes('Recipient Phone Missing')) {
      blockers.push('Delivery Address Missing');
    }

    if (blockers.length > 0) {
      if (blockers.includes('Store Pickup Address Missing'))
        return { status: 'NOT_READY_PICKUP_MISSING', blockers };
      if (blockers.includes('Kwik API Key Not Configured'))
        return { status: 'NOT_READY_PROVIDER_MISSING', blockers };
      return { status: 'NOT_READY_ADDRESS_MISSING', blockers };
    }

    return { status: 'READY', blockers: [] };
  }

  async autoDispatch(
    orderId: string,
    channel: string,
    idempotencyKey?: string
  ): Promise<DispatchResult> {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: {
        shipments: true,
        customer: true,
        store: { include: { deliverySettings: true } },
      },
    }) as OrderWithStore | null;

    if (!order || !order.store?.deliverySettings) {
      return {
        success: false,
        status: 'SKIPPED',
        reason: 'Order or Settings not found',
      };
    }

    const settings = order.store.deliverySettings;

    if (!settings.autoDispatchEnabled) {
      return {
        success: false,
        status: 'SKIPPED',
        reason: 'Auto-Dispatch Disabled globally',
      };
    }

    if (channel === 'whatsapp' && !settings.autoDispatchWhatsapp) {
      return {
        success: false,
        status: 'SKIPPED',
        reason: 'Auto-Dispatch Disabled for WhatsApp',
      };
    }

    if (channel === 'storefront' && !settings.autoDispatchStorefront) {
      return {
        success: false,
        status: 'SKIPPED',
        reason: 'Auto-Dispatch Disabled for Storefront',
      };
    }

    if (order.shipments?.[0] &&
      ['REQUESTED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.shipments[0].status)) {
      return {
        success: true,
        status: 'SKIPPED',
        reason: 'Already Dispatched',
        shipment: order.shipments[0],
      };
    }

    const readiness = this.checkReadiness(order, settings);
    if ((readiness as any).status !== 'READY') {
      return {
        success: false,
        status: 'BLOCKED',
        reason: `Readiness Failed: ${(readiness as any).blockers?.join(', ')}`,
      };
    }

    if (settings.autoDispatchMode === 'CONFIRM') {
      await this.db.shipment.upsert({
        where: { orderId: order.id },
        create: {
          storeId: order.storeId,
          orderId: order.id,
          provider: settings.provider,
          status: 'PENDING',
          recipientName: order.shipments?.[0]?.recipientName || 
            `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer',
          recipientPhone: order.shipments?.[0]?.recipientPhone ||
            order.customerPhone ||
            order.customer?.phone ||
            '',
          addressLine1: order.shipments?.[0]?.addressLine1 || '',
          addressCity: order.shipments?.[0]?.addressCity || '',
        },
        update: {},
      });

      return {
        success: true,
        status: 'PENDING_CONFIRMATION',
        reason: 'Awaiting Admin Confirmation',
      };
    }

    const provider = getDeliveryProvider(settings.provider);
    const dispatchData = {
      id: order.id,
      recipientName: order.shipments?.[0]?.recipientName || 
        `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer',
      recipientPhone: order.shipments?.[0]?.recipientPhone ||
        order.customerPhone ||
        order.customer?.phone ||
        '',
      addressLine1: order.shipments?.[0]?.addressLine1 || '',
      addressCity: order.shipments?.[0]?.addressCity || '',
      parcelDescription: `Order #${order.orderNumber}`,
    };

    if (!dispatchData.addressLine1 || !dispatchData.recipientPhone) {
      return {
        success: false,
        status: 'BLOCKED',
        reason: 'Address/Phone missing at dispatch time',
      };
    }

    try {
      const result = await provider.dispatch(dispatchData, settings);
      
      if (!result.success) {
        return {
          success: false,
          status: 'BLOCKED',
          reason: `Provider Error: ${(result as { error?: string }).error}`,
        };
      }

      const rawResponse = (result as { rawResponse?: unknown }).rawResponse;
      
      const shipment = await this.db.shipment.upsert({
        where: { orderId: order.id },
        create: {
          storeId: order.storeId,
          orderId: order.id,
          provider: settings.provider,
          status: 'CREATED',
          recipientPhone: dispatchData.recipientPhone,
          addressLine1: dispatchData.addressLine1,
          addressCity: dispatchData.addressCity,
          trackingCode: result.providerJobId,
          trackingUrl: result.trackingUrl,
          notes: rawResponse ? JSON.stringify(rawResponse) : undefined,
        },
        update: {
          provider: settings.provider,
          status: 'CREATED',
          trackingCode: result.providerJobId,
          trackingUrl: result.trackingUrl,
          notes: rawResponse ? JSON.stringify(rawResponse) : undefined,
        },
      });

      return { success: true, status: 'DISPATCHED', shipment };
    } catch (error) {
      logger.error('[DeliveryService] Dispatch failed:', error);
      return { success: false, status: 'BLOCKED', reason: (error as Error).message };
    }
  }

  async getOrderDeliveries(orderId: string) {
    return await this.db.shipment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateShipmentStatus(shipmentId: string, status: string) {
    return await this.db.shipment.update({
      where: { id: shipmentId },
      data: { status },
    });
  }
}
