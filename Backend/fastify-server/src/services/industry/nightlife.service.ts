import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class NightlifeService {
  constructor(private readonly db = prisma) {}

  async getTickets(storeId: string, filter: string = 'all') {
    const events = await this.db.product?.findMany({
      where: { storeId, productType: 'event' },
      select: { id: true, title: true, metadata: true },
    });

    const eventIds = events?.map((e: any) => e.id) || [];
    const eventMap = new Map(events?.map((e: any) => [e.id, e]));

    if (eventIds.length === 0) {
      return [];
    }

    let statusFilter: any = {};
    switch (filter) {
      case 'paid':
        statusFilter = { status: { in: ['COMPLETED', 'PROCESSING'] } };
        break;
      case 'used':
        statusFilter = { metadata: { path: ['checkedIn'], equals: true } };
        break;
      case 'refunded':
        statusFilter = { status: 'REFUNDED' };
        break;
    }

    const orderItems = await this.db.orderItem?.findMany({
      where: {
        productId: { in: eventIds },
        order: {
          storeId,
          ...statusFilter,
        },
      },
      include: {
        order: {
          include: {
            customer: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        productVariant: true,
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    return (orderItems || []).map((item: any) => {
      const event = eventMap.get(item.productId || '');
      const eventMetadata = (event?.metadata as Record<string, unknown>) || {};
      const orderMetadata = (item.order?.metadata as Record<string, unknown>) || {};

      let status = 'PAID';
      if ((item.order as any).status === 'REFUNDED') status = 'REFUNDED';
      else if ((item.order as any).status?.toUpperCase() === 'PENDING') status = 'PENDING';
      else if (orderMetadata.checkedIn) status = 'USED';

      return {
        id: item.id,
        orderNumber: item.order?.orderNumber,
        customerName: item.order?.customer
          ? `${item?.order?.customer.firstName || ''} ${item?.order?.customer.lastName || ''}`.trim()
          : 'Guest',
        customerEmail: item.order?.customer?.email || item.order?.customerEmail || '',
        customerPhone: item.order?.customer?.phone || item.order?.customerPhone || '',
        eventName: event?.title || 'Unknown Event',
        eventDate: eventMetadata.eventDate || '',
        ticketType: item.variant?.title || 'General',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalAmount: Number(item.lineTotal),
        status,
        purchasedAt: item.createdAt?.toISOString(),
        qrCode: `${item?.order?.orderNumber}-${item.id}`,
      };
    });
  }

  async getReservations(storeId: string, filter: string = 'tonight') {
    const now = new Date();
    let dateFilter: any = {};

    switch (filter) {
      case 'tonight':
        dateFilter = {
          startsAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        };
        break;
      case 'upcoming':
        dateFilter = {
          startsAt: { gt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) },
        };
        break;
      case 'past':
        dateFilter = {
          startsAt: { lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
        };
        break;
    }

    const bookings = await this.db.booking?.findMany({
      where: {
        storeId,
        ...dateFilter,
      },
      include: {
        customer: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        service: {
          select: { title: true, metadata: true },
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    return (bookings || []).map((booking: any) => {
      const metadata = (booking.metadata as Record<string, unknown>) || {};
      const serviceMetadata = (booking.service?.metadata as Record<string, unknown>) || {};

      return {
        id: booking.id,
        guestName: booking.customer
          ? `${booking?.customer?.firstName || ''} ${booking?.customer?.lastName || ''}`.trim()
          : metadata.guestName || 'Guest',
        guestPhone: booking.customer?.phone || metadata.guestPhone || '',
        guestEmail: booking.customer?.email || metadata.guestEmail || '',
        tableName: booking.service?.title || metadata.tableName || 'Table',
        tableType: serviceMetadata.tableType || metadata.tableType || 'Standard',
        date: booking.startsAt?.toISOString().split('T')[0],
        time: booking.startsAt?.toTimeString().substring(0, 5),
        partySize: metadata.partySize || 2,
        minimumSpend: serviceMetadata.minimumSpend || metadata.minimumSpend || 0,
        bottles: metadata.bottles || [],
        totalAmount: metadata.totalAmount || Number(booking.totalPrice) || 0,
        status: booking.status,
        specialRequests: metadata.specialRequests || booking.notes || '',
        createdAt: booking.createdAt?.toISOString(),
      };
    });
  }
}
