import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BeautyService {
  constructor(private readonly db = prisma) {}

  async getServices(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 100, 100);
    const offset = filters.offset || 0;
    const where: any = { storeId };

    if (filters.category) where.category = filters.category;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const [services, total] = await Promise.all([
      this.db.beautyService.findMany({
        where,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        take: limit,
        skip: offset,
      }),
      this.db.beautyService.count({ where }),
    ]);

    return { services, total, limit, offset };
  }

  async createService(storeId: string, serviceData: any) {
    const {
      name,
      category,
      description,
      price,
      duration,
      isActive,
    } = serviceData;

    const service = await this.db.beautyService.create({
      data: {
        id: `beauty-svc-${Date.now()}`,
        storeId,
        name,
        category,
        description: description || null,
        price,
        duration,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    logger.info(`[Beauty] Created service ${service.id}`);
    return service;
  }

  async getClients(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.db.beautyClient.findMany({
        where,
        include: {
          appointments: {
            take: 5,
            orderBy: { date: 'desc' },
          },
        },
        orderBy: { lastName: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.beautyClient.count({ where }),
    ]);

    return { clients, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createClient(storeId: string, clientData: any) {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      preferences,
      notes,
    } = clientData;

    const client = await this.db.beautyClient.create({
      data: {
        id: `beauty-client-${Date.now()}`,
        storeId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        preferences: preferences || {},
        notes: notes || null,
      },
    });

    logger.info(`[Beauty] Created client ${client.id}`);
    return client;
  }

  async getAppointments(storeId: string, filters: any) {
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
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.serviceId) where.serviceId = filters.serviceId;

    const [appointments, total] = await Promise.all([
      this.db.beautyAppointment.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: true,
        },
        orderBy: { date: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.beautyAppointment.count({ where }),
    ]);

    return { appointments, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createAppointment(storeId: string, appointmentData: any) {
    const { clientId, serviceId, date, duration, notes } = appointmentData;

    const appointment = await this.db.beautyAppointment.create({
      data: {
        id: `beauty-apt-${Date.now()}`,
        storeId,
        clientId,
        serviceId,
        date: new Date(date),
        duration: duration || 60,
        status: 'scheduled',
        notes: notes || null,
      },
      include: { client: true, service: true },
    });

    logger.info(`[Beauty] Created appointment ${appointment.id}`);
    return appointment;
  }

  async cancelAppointment(appointmentId: string, storeId: string, reason?: string) {
    const appointment = await this.db.beautyAppointment.findFirst({
      where: { id: appointmentId, storeId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const updated = await this.db.beautyAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'cancelled',
        cancellationReason: reason || null,
        cancelledAt: new Date(),
      },
    });

    logger.info(`[Beauty] Cancelled appointment ${appointmentId}`);
    return updated;
  }

  async getTreatments(storeId: string) {
    const treatments = await this.db.beautyTreatment.findMany({
      where: { storeId, active: true },
      include: {
        products: true,
      },
      orderBy: { name: 'asc' },
    });

    return treatments;
  }

  async getProductSales(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.fromDate || filters.toDate) {
      where.soldAt = {};
      if (filters.fromDate) where.soldAt.gte = filters.fromDate;
      if (filters.toDate) where.soldAt.lte = filters.toDate;
    }

    const [sales, total] = await Promise.all([
      this.db.productSale.findMany({
        where,
        include: {
          product: true,
          customer: true,
        },
        orderBy: { soldAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.productSale.count({ where }),
    ]);

    return { sales, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getBeautyStats(storeId: string) {
    const [
      totalServices,
      activeServices,
      totalClients,
      totalAppointments,
      todayAppointments,
      totalRevenue,
    ] = await Promise.all([
      this.db.beautyService.count({ where: { storeId } }),
      this.db.beautyService.count({ where: { storeId, isActive: true } }),
      this.db.beautyClient.count({ where: { storeId } }),
      this.db.beautyAppointment.count({ where: { storeId } }),
      this.db.beautyAppointment.count({
        where: {
          storeId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.db.beautyAppointment.aggregate({
        where: { storeId, status: 'completed' },
        _sum: { price: true },
      }),
    ]);

    return {
      services: { total: totalServices, active: activeServices },
      clients: { total: totalClients },
      appointments: { total: totalAppointments, today: todayAppointments },
      revenue: { total: totalRevenue._sum.price || 0 },
    };
  }
}
