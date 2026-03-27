import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class NightlifeService {
  constructor(private readonly db = prisma) {}

  async getTickets(storeId: string, filter: string) {
    const events = await this.db.product.findMany({
      where: { storeId, productType: 'event' },
      select: { id: true, title: true, metadata: true },
    });

    const eventIds = events.map((e) => e.id);
    if (eventIds.length === 0) return [];

    let statusFilter: any = {};
    switch (filter) {
      case 'paid':
        statusFilter = { status: { in: ['PAID', 'PROCESSING'] } };
        break;
      case 'used':
        statusFilter = { metadata: { path: ['checkedIn'], equals: true } };
        break;
      case 'refunded':
        statusFilter = { status: 'REFUNDED' };
        break;
    }

    const orderItems = await this.db.orderItem.findMany({
      where: {
        productId: { in: eventIds },
        order: statusFilter,
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            customerEmail: true,
            totalAmount: true,
            metadata: true,
          },
        },
        product: {
          select: { title: true },
        },
      },
    });

    return orderItems.map((item) => ({
      id: item.id,
      eventId: item.productId,
      eventName: item.product.title,
      orderId: item.orderId,
      status: item.order.status,
      customerEmail: item.order.customerEmail,
      price: item.unitPrice,
      checkedIn: (item.order.metadata as any)?.checkedIn || false,
      purchasedAt: item.order.createdAt,
    }));
  }

  async checkInTicket(ticketId: string, storeId: string) {
    const orderItem = await this.db.orderItem.findUnique({
      where: { id: ticketId },
      include: { order: true },
    });

    if (!orderItem || orderItem.order.storeId !== storeId) {
      throw new Error('Ticket not found');
    }

    const updatedOrder = await this.db.order.update({
      where: { id: orderItem.orderId },
      data: {
        metadata: {
          ...(orderItem.order.metadata as any),
          checkedIn: true,
          checkedInAt: new Date().toISOString(),
        },
      },
    });

    logger.info(`[Nightlife] Checked in ticket ${ticketId}`);
    return { success: true, checkedInAt: updatedOrder.updatedAt };
  }

  async getTablesStatus(storeId: string) {
    const tables = await this.db.nightlifeTable.findMany({
      where: { storeId, active: true },
      orderBy: { tableNumber: 'asc' },
    });

    return tables.map((table) => ({
      id: table.id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      location: table.location,
      currentReservation: null,
    }));
  }

  async getReservations(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.date) {
      const date = new Date(filters.date);
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    if (filters.status) where.status = filters.status;

    const [reservations, total] = await Promise.all([
      this.db.nightlifeReservation.findMany({
        where,
        include: {
          table: true,
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.nightlifeReservation.count({ where }),
    ]);

    return { reservations, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createReservation(storeId: string, reservationData: any) {
    const {
      tableId,
      customerId,
      date,
      time,
      partySize,
      specialRequests,
    } = reservationData;

    const reservation = await this.db.nightlifeReservation.create({
      data: {
        id: `res-${Date.now()}`,
        storeId,
        tableId,
        customerId,
        date: new Date(date),
        time,
        partySize,
        status: 'confirmed',
        specialRequests: specialRequests || null,
      },
      include: { table: true, customer: true },
    });

    logger.info(`[Nightlife] Created reservation ${reservation.id}`);
    return reservation;
  }

  async cancelReservation(reservationId: string, storeId: string) {
    const reservation = await this.db.nightlifeReservation.findFirst({
      where: { id: reservationId, storeId },
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const updated = await this.db.nightlifeReservation.update({
      where: { id: reservationId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });

    logger.info(`[Nightlife] Cancelled reservation ${reservationId}`);
    return updated;
  }

  async getPromoters(storeId: string) {
    const promoters = await this.db.nightlifePromoter.findMany({
      where: { storeId, active: true },
      include: {
        _count: {
          select: { guests: true, orders: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return promoters;
  }

  async getSecurityLog(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.type) where.type = filters.type;
    if (filters.fromDate || filters.toDate) {
      where.timestamp = {};
      if (filters.fromDate) where.timestamp.gte = filters.fromDate;
      if (filters.toDate) where.timestamp.lte = filters.toDate;
    }

    const [logs, total] = await Promise.all([
      this.db.securityLog.findMany({
        where,
        include: { user: true },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.securityLog.count({ where }),
    ]);

    return { logs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async logSecurityIncident(storeId: string, incidentData: any) {
    const { type, description, userId, involvedParties, notes } = incidentData;

    const log = await this.db.securityLog.create({
      data: {
        id: `sec-${Date.now()}`,
        storeId,
        type,
        description,
        userId: userId || null,
        involvedParties: involvedParties || [],
        notes: notes || null,
        timestamp: new Date(),
      },
    });

    logger.info(`[Nightlife] Logged security incident ${log.id}`);
    return log;
  }

  async getBottleServicePackages(storeId: string) {
    const packages = await this.db.bottleServicePackage.findMany({
      where: { storeId, active: true },
      orderBy: { price: 'asc' },
    });

    return packages;
  }

  async getBottleServiceOrders(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;

    const [orders, total] = await Promise.all([
      this.db.bottleServiceOrder.findMany({
        where,
        include: {
          package: true,
          table: true,
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.bottleServiceOrder.count({ where }),
    ]);

    return { orders, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getGuestList(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.date) {
      const date = new Date(filters.date);
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const [guests, total] = await Promise.all([
      this.db.guestListEntry.findMany({
        where,
        include: { promoter: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.guestListEntry.count({ where }),
    ]);

    return { guests, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async addToGuestList(storeId: string, guestData: any) {
    const { name, email, phone, promoterId, date, partySize, notes } = guestData;

    const entry = await this.db.guestListEntry.create({
      data: {
        id: `gl-${Date.now()}`,
        storeId,
        name,
        email: email || null,
        phone: phone || null,
        promoterId: promoterId || null,
        date: new Date(date),
        partySize: partySize || 1,
        status: 'pending',
        notes: notes || null,
      },
      include: { promoter: true },
    });

    logger.info(`[Nightlife] Added to guest list ${entry.id}`);
    return entry;
  }

  async getNightlifeStats(storeId: string) {
    const [
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      activeReservations,
      totalGuests,
    ] = await Promise.all([
      this.db.product.count({ where: { storeId, productType: 'event' } }),
      this.db.orderItem.count({
        where: { product: { storeId, productType: 'event' } },
      }),
      this.db.order.aggregate({
        where: { storeId, productType: 'event' },
        _sum: { totalAmount: true },
      }),
      this.db.nightlifeReservation.count({
        where: { storeId, status: 'confirmed' },
      }),
      this.db.guestListEntry.count({ where: { storeId } }),
    ]);

    return {
      events: { total: totalEvents },
      tickets: { sold: totalTicketsSold },
      revenue: { total: totalRevenue._sum.totalAmount || 0 },
      reservations: { active: activeReservations },
      guests: { total: totalGuests },
    };
  }
}
