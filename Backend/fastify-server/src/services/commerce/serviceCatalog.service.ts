import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import type { CreateServiceData } from '../../types/bookings';

export class ServiceCatalogService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string) {
    const services = await this.db.service.findMany({
      where: { 
        storeId,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return services;
  }

  async create(storeId: string, data: CreateServiceData) {
    const { name, description, price, metadata } = data;

    const service = await this.db.service.create({
      data: {
        id: `svc-${Date.now()}`,
        storeId,
        name,
        description: description || null,
        price,
        metadata: metadata || {},
        active: true,
      },
    });

    logger.info(`[ServiceCatalog] Created ${service.id}`);
    return service;
  }

  async update(serviceId: string, storeId: string, data: any) {
    const service = await this.db.service.findFirst({
      where: { id: serviceId, storeId },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    const updated = await this.db.service.update({
      where: { id: serviceId },
      data: {
        ...data,
        price: data.price ? Number(data.price) : undefined,
      },
    });

    logger.info(`[ServiceCatalog] Updated ${serviceId}`);
    return updated;
  }

  async delete(serviceId: string, storeId: string) {
    const service = await this.db.service.findFirst({
      where: { id: serviceId, storeId },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    await this.db.service.delete({
      where: { id: serviceId },
    });

    logger.info(`[ServiceCatalog] Deleted ${serviceId}`);
    return { success: true };
  }

  async getDashboard(storeId: string, date?: Date) {
    const selectedDate = date || new Date();
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [bookings, services, staffMembers] = await Promise.all([
      this.db.booking.findMany({
        where: {
          storeId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          service: true,
        },
        orderBy: { startTime: 'asc' },
      }),
      this.db.service.findMany({
        where: {
          storeId,
          active: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.db.staffMember.findMany({
        where: { storeId },
      }),
    ]);

    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    const noShows = bookings.filter(b => b.status === 'no_show');
    const pendingBookings = bookings.filter(b => b.status === 'pending');

    const totalStaffHours = staffMembers.length * 8;
    const bookedHours = bookings.reduce((sum, booking) => {
      const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    const utilizationRate = totalStaffHours > 0 ? (bookedHours / totalStaffHours) * 100 : 0;

    const serviceBookingsCount = services.map(service => ({
      ...service,
      bookingsCount: bookings.filter(b => b.serviceId === service.id).length,
    }));

    const topBookedServices = serviceBookingsCount
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5);

    return {
      config: {
        industry: 'services',
        title: 'Bookings & Calendar',
        primaryObjectLabel: 'Service',
      },
      metrics: {
        bookingsToday: bookings.length,
        revenue: 0,
        utilizationRate: Math.round(utilizationRate),
        averageServiceValue: 0,
      },
      primaryObjectHealth: {
        topBookedServices: topBookedServices.map(s => ({
          id: s.id,
          name: s.name,
          bookingsCount: s.bookingsCount,
          price: Number(s.price),
        })),
        underperformingServices: serviceBookingsCount
          .filter(s => s.bookingsCount === 0)
          .slice(0, 5)
          .map(s => ({
            id: s.id,
            name: s.name,
            bookingsCount: 0,
          })),
      },
      liveOperations: {
        todaysBookings: bookings.length,
        cancellations: cancelledBookings.length,
        noShows: noShows.length,
        pending: pendingBookings.length,
      },
    };
  }
}
