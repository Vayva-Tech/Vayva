import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { Event, EventStatus, CreateEventInput, TicketTier, CreateTicketTierInput, TicketPurchase, TicketStatus, CreateTicketPurchaseInput, EventAttendee, CreateEventAttendeeInput, CheckInInput } from '@/types/phase4-industry';
import type { Event as PrismaEvent, TicketTier as PrismaTicketTier, TicketPurchase as PrismaTicketPurchase, EventAttendee as PrismaEventAttendee } from '@vayva/db';

export class EventsService {
  // ===== EVENTS =====

  async getEvents(
    storeId: string,
    filters?: { status?: EventStatus; category?: string; upcoming?: boolean }
  ): Promise<Event[]> {
    const now = new Date();
    const events = await prisma.event.findMany({
      where: {
        storeId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.upcoming && { startDate: { gte: now } }),
      },
      orderBy: { startDate: 'asc' },
    });

    return events.map((e: PrismaEvent) => ({
      id: e.id,
      storeId: e.storeId,
      title: e.title,
      description: e.description ?? undefined,
      venue: e.venue ?? undefined,
      address: e.address ?? undefined,
      startDate: e.startDate,
      endDate: e.endDate,
      timezone: e.timezone,
      status: e.status as EventStatus,
      capacity: e.capacity,
      bannerImage: e.bannerImage ?? undefined,
      organizerId: e.organizerId,
      category: e.category,
      isPublic: e.isPublic,
      requiresApproval: e.requiresApproval,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  }

  async getEventById(id: string): Promise<Event | null> {
    const e = await prisma.event.findUnique({ where: { id } });
    if (!e) return null;

    return {
      id: e.id,
      storeId: e.storeId,
      title: e.title,
      description: e.description ?? undefined,
      venue: e.venue ?? undefined,
      address: e.address ?? undefined,
      startDate: e.startDate,
      endDate: e.endDate,
      timezone: e.timezone,
      status: e.status as EventStatus,
      capacity: e.capacity,
      bannerImage: e.bannerImage ?? undefined,
      organizerId: e.organizerId,
      category: e.category,
      isPublic: e.isPublic,
      requiresApproval: e.requiresApproval,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async createEvent(data: CreateEventInput): Promise<Event> {
    const e = await prisma.event.create({
      data: {
        storeId: data.storeId,
        title: data.title,
        description: data.description,
        venue: data.venue,
        address: data.address,
        startDate: data.startDate,
        endDate: data.endDate,
        timezone: data.timezone ?? 'UTC',
        status: 'draft',
        capacity: data.capacity,
        bannerImage: data.bannerImage,
        organizerId: data.organizerId,
        category: data.category,
        isPublic: data.isPublic ?? true,
        requiresApproval: data.requiresApproval ?? false,
      },
    });

    return {
      id: e.id,
      storeId: e.storeId,
      title: e.title,
      description: e.description ?? undefined,
      venue: e.venue ?? undefined,
      address: e.address ?? undefined,
      startDate: e.startDate,
      endDate: e.endDate,
      timezone: e.timezone,
      status: e.status as EventStatus,
      capacity: e.capacity,
      bannerImage: e.bannerImage ?? undefined,
      organizerId: e.organizerId,
      category: e.category,
      isPublic: e.isPublic,
      requiresApproval: e.requiresApproval,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async publishEvent(id: string): Promise<Event> {
    const e = await prisma.event.update({
      where: { id },
      data: { status: 'published' },
    });

    return {
      id: e.id,
      storeId: e.storeId,
      title: e.title,
      description: e.description ?? undefined,
      venue: e.venue ?? undefined,
      address: e.address ?? undefined,
      startDate: e.startDate,
      endDate: e.endDate,
      timezone: e.timezone,
      status: e.status as EventStatus,
      capacity: e.capacity,
      bannerImage: e.bannerImage ?? undefined,
      organizerId: e.organizerId,
      category: e.category,
      isPublic: e.isPublic,
      requiresApproval: e.requiresApproval,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  // ===== TICKET TIERS =====

  async getTicketTiers(eventId: string): Promise<TicketTier[]> {
    const tiers = await prisma.ticketTier.findMany({
      where: { eventId },
      orderBy: { price: 'asc' },
    });

    return tiers.map((t: PrismaTicketTier) => ({
      id: t.id,
      eventId: t.eventId,
      name: t.name,
      description: t.description ?? undefined,
      price: Number(t.price),
      quantity: t.quantity,
      remaining: t.remaining,
      salesStart: t.salesStart,
      salesEnd: t.salesEnd,
      maxPerOrder: t.maxPerOrder,
      benefits: t.benefits,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  async createTicketTier(data: CreateTicketTierInput): Promise<TicketTier> {
    const t = await prisma.ticketTier.create({
      data: {
        eventId: data.eventId,
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        remaining: data.quantity,
        salesStart: data.salesStart,
        salesEnd: data.salesEnd,
        maxPerOrder: data.maxPerOrder ?? 10,
        benefits: data.benefits ?? [],
      },
    });

    return {
      id: t.id,
      eventId: t.eventId,
      name: t.name,
      description: t.description ?? undefined,
      price: Number(t.price),
      quantity: t.quantity,
      remaining: t.remaining,
      salesStart: t.salesStart,
      salesEnd: t.salesEnd,
      maxPerOrder: t.maxPerOrder,
      benefits: t.benefits,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  // ===== TICKET PURCHASES =====

  private generateTicketNumber(): string {
    return `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async getTicketPurchases(
    eventId: string,
    filters?: { customerId?: string; status?: TicketStatus }
  ): Promise<TicketPurchase[]> {
    const purchases = await prisma.ticketPurchase.findMany({
      where: {
        eventId,
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return purchases.map((p: PrismaTicketPurchase) => ({
      id: p.id,
      tierId: p.tierId,
      eventId: p.eventId,
      customerId: p.customerId,
      orderId: p.orderId,
      quantity: p.quantity,
      unitPrice: Number(p.unitPrice),
      totalPrice: Number(p.totalPrice),
      status: p.status as TicketStatus,
      ticketNumber: p.ticketNumber,
      qrCode: p.qrCode ?? undefined,
      checkedInAt: p.checkedInAt ?? undefined,
      checkedInBy: p.checkedInBy ?? undefined,
      seatNumber: p.seatNumber ?? undefined,
      transferredFrom: p.transferredFrom ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async purchaseTickets(data: CreateTicketPurchaseInput): Promise<TicketPurchase> {
    // Get ticket tier to update remaining count
    const tier = await prisma.ticketTier.findUnique({ where: { id: data.tierId } });
    if (!tier) throw new Error('Ticket tier not found');
    if (tier.remaining < data.quantity) throw new Error('Not enough tickets available');

    const ticketNumber = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const [purchase] = await prisma.$transaction([
      prisma.ticketPurchase.create({
        data: {
          tierId: data.tierId,
          eventId: data.eventId,
          customerId: data.customerId,
          orderId: data.orderId,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          totalPrice: data.totalPrice,
          status: 'active',
          ticketNumber,
          seatNumber: data.seatNumber,
        },
      }),
      prisma.ticketTier.update({
        where: { id: data.tierId },
        data: { remaining: { decrement: data.quantity } },
      }),
    ]);

    return {
      id: purchase.id,
      tierId: purchase.tierId,
      eventId: purchase.eventId,
      customerId: purchase.customerId,
      orderId: purchase.orderId,
      quantity: purchase.quantity,
      unitPrice: Number(purchase.unitPrice),
      totalPrice: Number(purchase.totalPrice),
      status: purchase.status as TicketStatus,
      ticketNumber: purchase.ticketNumber,
      qrCode: purchase.qrCode ?? undefined,
      checkedInAt: purchase.checkedInAt ?? undefined,
      checkedInBy: purchase.checkedInBy ?? undefined,
      seatNumber: purchase.seatNumber ?? undefined,
      transferredFrom: purchase.transferredFrom ?? undefined,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }

  async checkInTicket(data: CheckInInput): Promise<TicketPurchase> {
    const p = await prisma.ticketPurchase.update({
      where: { ticketNumber: data.ticketNumber },
      data: {
        status: 'used',
        checkedInAt: new Date(),
        checkedInBy: data.checkedInBy,
      },
    });

    return {
      id: p.id,
      tierId: p.tierId,
      eventId: p.eventId,
      customerId: p.customerId,
      orderId: p.orderId,
      quantity: p.quantity,
      unitPrice: Number(p.unitPrice),
      totalPrice: Number(p.totalPrice),
      status: p.status as TicketStatus,
      ticketNumber: p.ticketNumber,
      qrCode: p.qrCode ?? undefined,
      checkedInAt: p.checkedInAt ?? undefined,
      checkedInBy: p.checkedInBy ?? undefined,
      seatNumber: p.seatNumber ?? undefined,
      transferredFrom: p.transferredFrom ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  // ===== ATTENDEES =====

  async getAttendees(eventId: string): Promise<EventAttendee[]> {
    const attendees = await prisma.eventAttendee.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });

    return attendees.map((a: PrismaEventAttendee) => ({
      id: a.id,
      eventId: a.eventId,
      customerId: a.customerId,
      email: a.email,
      firstName: a.firstName,
      lastName: a.lastName,
      company: a.company ?? undefined,
      jobTitle: a.jobTitle ?? undefined,
      dietaryRequirements: a.dietaryRequirements ?? undefined,
      accessibilityNeeds: a.accessibilityNeeds ?? undefined,
      checkedIn: a.checkedIn,
      checkedInAt: a.checkedInAt ?? undefined,
      notes: a.notes ?? undefined,
      createdAt: a.createdAt,
    }));
  }

  async addAttendee(data: CreateEventAttendeeInput): Promise<EventAttendee> {
    const a = await prisma.eventAttendee.create({
      data: {
        eventId: data.eventId,
        customerId: data.customerId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        jobTitle: data.jobTitle,
        dietaryRequirements: data.dietaryRequirements,
        accessibilityNeeds: data.accessibilityNeeds,
        notes: data.notes,
      },
    });

    return {
      id: a.id,
      eventId: a.eventId,
      customerId: a.customerId,
      email: a.email,
      firstName: a.firstName,
      lastName: a.lastName,
      company: a.company ?? undefined,
      jobTitle: a.jobTitle ?? undefined,
      dietaryRequirements: a.dietaryRequirements ?? undefined,
      accessibilityNeeds: a.accessibilityNeeds ?? undefined,
      checkedIn: a.checkedIn,
      checkedInAt: a.checkedInAt ?? undefined,
      notes: a.notes ?? undefined,
      createdAt: a.createdAt,
    };
  }

  async getEventStats(eventId: string): Promise<{
    totalTickets: number;
    ticketsSold: number;
    checkedIn: number;
    revenue: number;
    attendees: number;
  }> {
    const [tiers, purchases, attendees] = await Promise.all([
      prisma.ticketTier.findMany({ where: { eventId } }),
      prisma.ticketPurchase.findMany({
        where: { eventId, status: { in: ['active', 'used'] } },
      }),
      prisma.eventAttendee.count({ where: { eventId } }),
    ]);

    const totalTickets = tiers.reduce((sum: number, t: PrismaTicketTier) => sum + t.quantity, 0);
    const ticketsSold = purchases.reduce((sum: number, p: PrismaTicketPurchase) => sum + p.quantity, 0);
    const checkedIn = purchases.filter((p: PrismaTicketPurchase) => p.status === 'used').length;
    const revenue = purchases.reduce((sum: number, p: PrismaTicketPurchase) => sum + Number(p.totalPrice), 0);

    return {
      totalTickets,
      ticketsSold,
      checkedIn,
      revenue,
      attendees,
    };
  }
}

export const eventsService = new EventsService();
