import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class EventsService {
  constructor(private readonly db = prisma) {}

  async getEvents(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.fromDate || filters.toDate) {
      where.date = {};
      if (filters.fromDate) where.date.gte = filters.fromDate;
      if (filters.toDate) where.date.lte = filters.toDate;
    }

    const [events, total] = await Promise.all([
      this.db.event.findMany({
        where,
        include: {
          tickets: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { date: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.event.count({ where }),
    ]);

    return { events, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createEvent(storeId: string, eventData: any) {
    const {
      name,
      description,
      date,
      venue,
      capacity,
      ticketTypes,
    } = eventData;

    const event = await this.db.event.create({
      data: {
        id: `event-${Date.now()}`,
        storeId,
        name,
        description: description || null,
        date: new Date(date),
        venue: venue || null,
        capacity: capacity || 0,
        status: 'draft',
      },
    });

    if (ticketTypes && ticketTypes.length > 0) {
      await this.db.eventTicketType.createMany({
        data: ticketTypes.map((t: any) => ({
          id: `tt-${Date.now()}-${Math.random()}`,
          eventId: event.id,
          name: t.name,
          price: t.price,
          quantity: t.quantity,
          soldCount: 0,
        })),
      });
    }

    logger.info(`[Events] Created event ${event.id}`);
    return event;
  }

  async getAttendees(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.eventId) where.eventId = filters.eventId;
    if (filters.status) where.checkInStatus = filters.status;

    const [attendees, total] = await Promise.all([
      this.db.eventAttendee.findMany({
        where,
        include: {
          event: true,
          ticket: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.eventAttendee.count({ where }),
    ]);

    return { attendees, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async checkinAttendee(attendeeId: string, storeId: string) {
    const attendee = await this.db.eventAttendee.findFirst({
      where: { id: attendeeId },
      include: { event: true },
    });

    if (!attendee || attendee.event.storeId !== storeId) {
      throw new Error('Attendee not found');
    }

    const updated = await this.db.eventAttendee.update({
      where: { id: attendeeId },
      data: {
        checkInStatus: 'checked_in',
        checkedAt: new Date(),
      },
    });

    logger.info(`[Events] Checked in attendee ${attendeeId}`);
    return updated;
  }

  async getVendors(storeId: string) {
    const vendors = await this.db.eventVendor.findMany({
      where: { storeId, active: true },
      orderBy: { name: 'asc' },
    });

    return vendors;
  }

  async createVendor(storeId: string, vendorData: any) {
    const { name, contactEmail, contactPhone, boothNumber, category } = vendorData;

    const vendor = await this.db.eventVendor.create({
      data: {
        id: `vendor-${Date.now()}`,
        storeId,
        name,
        contactEmail,
        contactPhone: contactPhone || null,
        boothNumber: boothNumber || null,
        category: category || null,
        active: true,
      },
    });

    logger.info(`[Events] Created vendor ${vendor.id}`);
    return vendor;
  }

  async getSponsors(storeId: string) {
    const sponsors = await this.db.eventSponsor.findMany({
      where: { storeId, active: true },
      orderBy: { name: 'asc' },
    });

    return sponsors;
  }

  async createSponsor(storeId: string, sponsorData: any) {
    const { name, contactEmail, sponsorshipLevel, contribution } = sponsorData;

    const sponsor = await this.db.eventSponsor.create({
      data: {
        id: `sponsor-${Date.now()}`,
        storeId,
        name,
        contactEmail,
        sponsorshipLevel: sponsorshipLevel || 'standard',
        contribution: contribution || 0,
        active: true,
      },
    });

    logger.info(`[Events] Created sponsor ${sponsor.id}`);
    return sponsor;
  }

  async getTicketSales(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.eventId) where.eventId = filters.eventId;
    if (filters.fromDate || filters.toDate) {
      where.purchasedAt = {};
      if (filters.fromDate) where.purchasedAt.gte = filters.fromDate;
      if (filters.toDate) where.purchasedAt.lte = filters.toDate;
    }

    const [sales, totalRevenue] = await Promise.all([
      this.db.eventTicketSale.findMany({
        where,
        include: {
          ticketType: true,
          attendee: true,
        },
        orderBy: { purchasedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.eventTicketSale.aggregate({
        where,
        _sum: { price: true },
      }),
    ]);

    return {
      sales,
      total: sales.length,
      page,
      limit,
      totalRevenue: totalRevenue._sum.price || 0,
    };
  }

  async getEventStats(storeId: string) {
    const [
      totalEvents,
      upcomingEvents,
      totalAttendees,
      checkedInAttendees,
      totalRevenue,
    ] = await Promise.all([
      this.db.event.count({ where: { storeId } }),
      this.db.event.count({
        where: {
          storeId,
          date: { gte: new Date() },
          status: 'published',
        },
      }),
      this.db.eventAttendee.count({ where: { event: { storeId } } }),
      this.db.eventAttendee.count({
        where: { event: { storeId }, checkInStatus: 'checked_in' },
      }),
      this.db.eventTicketSale.aggregate({
        where: { event: { storeId } },
        _sum: { price: true },
      }),
    ]);

    return {
      events: { total: totalEvents, upcoming: upcomingEvents },
      attendees: { total: totalAttendees, checkedIn: checkedInAttendees },
      revenue: { total: totalRevenue._sum.price || 0 },
    };
  }
}
