/**
 * Services Industry Core Service
 * Main service orchestrator for the services industry engine
 */

import { prisma } from '@vayva/db';
import { ServiceBase, ServiceProvider, Booking, Quote, Case, Application } from '../types';

export class ServicesCoreService {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  /**
   * Service Management
   */
  async createService(data: Omit<ServiceBase, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.service.create({
      data: {
        ...data,
        storeId: this.storeId,
      },
    });
  }

  async getServices(filters?: {
    serviceType?: string;
    isActive?: boolean;
    providerId?: string;
  }) {
    const where: any = { storeId: this.storeId };
    
    if (filters?.serviceType) where.serviceType = filters.serviceType;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.providerId) where.providerId = filters.providerId;

    return await prisma.service.findMany({
      where,
      include: {
        provider: true,
        allocations: {
          include: {
            resource: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getServiceById(id: string) {
    return await prisma.service.findUnique({
      where: { id },
      include: {
        provider: true,
        bookings: {
          where: { status: { not: 'cancelled' } },
          take: 5,
          orderBy: { startDate: 'desc' },
        },
        allocations: {
          include: {
            resource: true,
          },
        },
      },
    });
  }

  async updateService(id: string, data: Partial<ServiceBase>) {
    return await prisma.service.update({
      where: { id },
      data,
    });
  }

  async deleteService(id: string) {
    return await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Service Provider Management
   */
  async createServiceProvider(data: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>) {
    return await prisma.serviceProvider.create({
      data: {
        ...data,
        storeId: this.storeId,
        rating: 0,
        reviewCount: 0,
      },
    });
  }

  async getServiceProviders(filters?: { isActive?: boolean; serviceType?: string }) {
    const where: any = { storeId: this.storeId };
    
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.serviceType) {
      where.specializations = {
        has: filters.serviceType,
      };
    }

    return await prisma.serviceProvider.findMany({
      where,
      include: {
        services: true,
        _count: {
          select: {
            bookings: true,
            quotes: true,
            cases: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getServiceProviderById(id: string) {
    return await prisma.serviceProvider.findUnique({
      where: { id },
      include: {
        services: true,
        bookings: {
          where: { status: { not: 'cancelled' } },
          take: 10,
          orderBy: { startDate: 'desc' },
        },
        quotes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        cases: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateServiceProvider(id: string, data: Partial<ServiceProvider>) {
    return await prisma.serviceProvider.update({
      where: { id },
      data,
    });
  }

  /**
   * Booking Management
   */
  async createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus'>) {
    // Validate service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service || !service.isActive) {
      throw new Error('Service not found or inactive');
    }

    // Check for conflicts
    const conflicts = await prisma.serviceBooking.findFirst({
      where: {
        serviceId: data.serviceId,
        startDate: { lt: data.endDate },
        endDate: { gt: data.startDate },
        status: { not: 'cancelled' },
      },
    });

    if (conflicts) {
      throw new Error('Time slot is already booked');
    }

    return await prisma.serviceBooking.create({
      data: {
        ...data,
        storeId: this.storeId,
        status: 'pending',
        paymentStatus: 'pending',
        totalPrice: service.price,
      },
    });
  }

  async getBookings(filters?: {
    status?: string;
    customerId?: string;
    serviceProviderId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = { storeId: this.storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.serviceProviderId) where.serviceProviderId = filters.serviceProviderId;
    if (filters?.dateFrom || filters?.dateTo) {
      where.startDate = {};
      if (filters.dateFrom) where.startDate.gte = filters.dateFrom;
      if (filters.dateTo) where.startDate.lte = filters.dateTo;
    }

    return await prisma.serviceBooking.findMany({
      where,
      include: {
        service: true,
        serviceProvider: true,
        customer: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async updateBookingStatus(bookingId: string, status: string, notes?: string) {
    return await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: { 
        status,
        notes: notes || undefined,
      },
    });
  }

  async cancelBooking(bookingId: string, reason: string) {
    return await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
      },
    });
  }

  /**
   * Quote Management
   */
  async createQuote(data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'subtotal' | 'taxAmount' | 'total'>) {
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.075; // 7.5% tax
    const total = subtotal + taxAmount;

    return await prisma.serviceQuote.create({
      data: {
        ...data,
        storeId: this.storeId,
        status: 'draft',
        subtotal,
        taxAmount,
        total,
      },
    });
  }

  async getQuotes(filters?: { status?: string; customerId?: string }) {
    const where: any = { storeId: this.storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;

    return await prisma.serviceQuote.findMany({
      where,
      include: {
        serviceProvider: true,
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendQuote(quoteId: string) {
    const quote = await prisma.serviceQuote.update({
      where: { id: quoteId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Production: Integrate with @vayva/emails package to send transactional email
    // await this.sendQuoteNotification(quote);

    return quote;
  }

  async acceptQuote(quoteId: string) {
    return await prisma.serviceQuote.update({
      where: { id: quoteId },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });
  }

  /**
   * Case Management
   */
  async createCase(data: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.serviceCase.create({
      data: {
        ...data,
        storeId: this.storeId,
        status: 'open',
      },
    });
  }

  async getCases(filters?: { status?: string; customerId?: string; priority?: string }) {
    const where: any = { storeId: this.storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.priority) where.priority = filters.priority;

    return await prisma.serviceCase.findMany({
      where,
      include: {
        serviceProvider: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCaseStatus(caseId: string, status: string, resolution?: string) {
    return await prisma.serviceCase.update({
      where: { id: caseId },
      data: {
        status,
        resolution: resolution || undefined,
        ...(status === 'resolved' || status === 'closed' ? { updatedAt: new Date() } : {}),
      },
    });
  }

  /**
   * Application Management
   */
  async createApplication(data: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt'>) {
    return await prisma.serviceApplication.create({
      data: {
        ...data,
        storeId: this.storeId,
        status: 'submitted',
        submittedAt: new Date(),
      },
    });
  }

  async getApplications(filters?: { status?: string; serviceType?: string }) {
    const where: any = { storeId: this.storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.serviceType) where.serviceType = filters.serviceType;

    return await prisma.serviceApplication.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateApplicationStatus(applicationId: string, status: string, reviewerId?: string) {
    return await prisma.serviceApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewerId: reviewerId || undefined,
        reviewedAt: new Date(),
        ...(status === 'approved' || status === 'rejected' ? { decisionAt: new Date() } : {}),
      },
    });
  }

  /**
   * Analytics & Reporting
   */
  async getBookingStats(period: 'day' | 'week' | 'month' = 'month') {
    const dateFrom = new Date();
    switch (period) {
      case 'day':
        dateFrom.setDate(dateFrom.getDate() - 1);
        break;
      case 'week':
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case 'month':
        dateFrom.setMonth(dateFrom.getMonth() - 1);
        break;
    }

    const [totalBookings, confirmedBookings, revenue] = await Promise.all([
      prisma.serviceBooking.count({
        where: {
          storeId: this.storeId,
          createdAt: { gte: dateFrom },
        },
      }),
      prisma.serviceBooking.count({
        where: {
          storeId: this.storeId,
          status: 'confirmed',
          startDate: { gte: dateFrom },
        },
      }),
      prisma.serviceBooking.aggregate({
        where: {
          storeId: this.storeId,
          status: 'completed',
          startDate: { gte: dateFrom },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      totalBookings,
      confirmedBookings,
      conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0,
      revenue: revenue._sum.totalPrice || 0,
    };
  }

  async getTopServices(limit: number = 5) {
    const services = await prisma.service.findMany({
      where: { storeId: this.storeId, isActive: true },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: 'completed' },
            },
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return services.map((service: any) => ({
      ...service,
      bookingCount: service._count.bookings,
    }));
  }
}