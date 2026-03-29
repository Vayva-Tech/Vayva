import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class TravelService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.startDate || filters.endDate) {
      where.travelDate = {};
      if (filters.startDate) where.travelDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.travelDate.lte = new Date(filters.endDate);
    }

    const [bookings, total] = await Promise.all([
      this.db.travelBooking.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.travelBooking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(storeId: string, data: any) {
    const {
      customerId,
      travelDate,
      returnDate,
      destination,
      travelers,
      totalPrice,
      currency,
      bookingType,
      supplierId,
      notes,
    } = data;

    // Verify customer exists
    const customer = await this.db.customer.findFirst({
      where: { id: customerId, storeId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Verify supplier exists if provided
    if (supplierId) {
      const supplier = await this.db.travelSupplier.findFirst({
        where: { id: supplierId, storeId },
      });

      if (!supplier) {
        throw new Error('Supplier not found');
      }
    }

    const booking = await this.db.travelBooking.create({
      data: {
        storeId,
        customerId,
        travelDate: new Date(travelDate),
        returnDate: returnDate ? new Date(returnDate) : null,
        destination,
        travelers,
        totalPrice,
        currency: currency || 'USD',
        bookingType: bookingType || 'package',
        supplierId: supplierId || null,
        notes: notes || null,
        status: 'pending',
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`[Travel] Created booking ${booking.id}`);
    return booking;
  }

  async findOne(bookingId: string, storeId: string) {
    const booking = await this.db.travelBooking.findFirst({
      where: { id: bookingId, storeId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  async updateStatus(bookingId: string, storeId: string, status: string) {
    const booking = await this.db.travelBooking.findFirst({
      where: { id: bookingId, storeId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const updated = await this.db.travelBooking.update({
      where: { id: bookingId },
      data: { status },
    });

    logger.info(`[Travel] Updated booking ${bookingId} status to ${status}`);
    return updated;
  }

  async delete(bookingId: string, storeId: string) {
    const booking = await this.db.travelBooking.findFirst({
      where: { id: bookingId, storeId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    await this.db.travelBooking.delete({
      where: { id: bookingId },
    });

    logger.info(`[Travel] Deleted booking ${bookingId}`);
  }
}
