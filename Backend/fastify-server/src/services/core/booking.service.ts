import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BookingService {
  constructor(private readonly db = prisma) {}

  async getBookings(storeId: string, start?: Date, end?: Date) {
    const where: any = { storeId };

    if (start && end) {
      where.startsAt = {
        gte: start,
        lte: end,
      };
    } else if (start) {
      where.startsAt = { gte: start };
    } else if (end) {
      where.startsAt = { lte: end };
    }

    const bookings = await this.db.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: true,
      },
      orderBy: { startsAt: 'asc' },
    });

    return bookings;
  }

  async createBooking(storeId: string, bookingData: any) {
    const {
      customerId,
      serviceId,
      staffId,
      startsAt,
      endsAt,
      status = 'SCHEDULED',
      notes,
      metadata,
    } = bookingData;

    // Validate dates
    if (!startsAt || isNaN(new Date(startsAt).getTime())) {
      throw new Error('Invalid start date');
    }

    if (endsAt && isNaN(new Date(endsAt).getTime())) {
      throw new Error('Invalid end date');
    }

    if (endsAt && new Date(startsAt) >= new Date(endsAt)) {
      throw new Error('End time must be after start time');
    }

    // Check for conflicts
    const conflicting = await this.db.booking.findFirst({
      where: {
        storeId,
        OR: [
          { staffId: staffId || undefined },
          { customerId: customerId || undefined },
        ],
        status: { not: 'CANCELLED' },
        AND: [
          {
            OR: [
              { startsAt: { lte: new Date(startsAt) } },
              { endsAt: { gte: new Date(startsAt) } },
            ],
          },
          {
            OR: [
              { startsAt: { lte: new Date(endsAt || startsAt) } },
              { endsAt: { gte: new Date(endsAt || startsAt) } },
            ],
          },
        ],
      },
    });

    if (conflicting) {
      throw new Error('Time slot conflicts with existing booking');
    }

    const booking = await this.db.booking.create({
      data: {
        id: `bkg-${Date.now()}`,
        storeId,
        customerId: customerId || null,
        serviceId: serviceId || null,
        staffId: staffId || null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        status,
        notes: notes || null,
        metadata: (metadata as any) || {},
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        service: true,
      },
    });

    logger.info(`[Booking] Created booking ${booking.id}`);
    return booking;
  }

  async createServiceProduct(storeId: string, data: {
    name: string;
    description?: string;
    price: number;
    metadata?: Record<string, any>;
  }) {
    const product = await this.db.product.create({
      data: {
        storeId,
        title: data.name,
        handle:
          data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
          '-' +
          Date.now(),
        description: data.description,
        price: data.price,
        status: 'ACTIVE',
        trackInventory: false,
        productType: 'SERVICE',
        metadata: (data.metadata as any) || {},
      },
    });

    logger.info(`[Booking] Created service product ${product.id}`);
    return product;
  }

  async updateBookingStatus(bookingId: string, storeId: string, status: string) {
    const booking = await this.db.booking.findFirst({
      where: { id: bookingId, storeId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const updated = await this.db.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    logger.info(`[Booking] Updated booking ${bookingId} status to ${status}`);
    return updated;
  }

  async cancelBooking(bookingId: string, storeId: string, reason?: string) {
    const booking = await this.db.booking.findFirst({
      where: { id: bookingId, storeId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const updated = await this.db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        metadata: {
          ...(booking.metadata as any),
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason || null,
        },
      },
    });

    logger.info(`[Booking] Cancelled booking ${bookingId}`);
    return updated;
  }

  async updateBooking(storeId: string, bookingId: string, data: {
    startsAt?: Date;
    endsAt?: Date;
    customerId?: string;
    serviceId?: string;
    notes?: string;
    status?: string;
  }) {
    const booking = await this.db.booking.findFirst({
      where: { id: bookingId, storeId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const updated = await this.db.booking.update({
      where: { id: bookingId },
      data: {
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        customerId: data.customerId,
        serviceId: data.serviceId,
        notes: data.notes,
        status: data.status,
      },
    });

    logger.info(`[Booking] Updated booking ${bookingId}`);
    return updated;
  }

  async deleteBooking(storeId: string, bookingId: string) {
    const booking = await this.db.booking.findFirst({
      where: { id: bookingId, storeId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    await this.db.booking.delete({
      where: { id: bookingId },
    });

    logger.info(`[Booking] Deleted booking ${bookingId}`);
  }
}
