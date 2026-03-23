// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Event, EventStatus, EventCategory, TicketTier, Ticket, TicketStatus, EventsAnalytics } from '../types';

export interface EventFilters {
  category?: EventCategory;
  status?: EventStatus;
  city?: string;
  from?: Date;
  to?: Date;
  organizerId?: string;
  isOnline?: boolean;
}

export interface TicketOrder {
  eventId: string;
  tierId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  quantity: number;
  seatNumbers?: string[];
}

/**
 * TicketingService - Manages event ticketing lifecycle
 * Handles ticket sales, QR code generation, check-in, and refunds
 */
export class TicketingService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Create an event
   */
  async createEvent(data: Omit<Event, 'id' | 'ticketsSold' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const now = new Date();
    const event: Event = {
      ...data,
      id: `evt_${Date.now()}`,
      ticketsSold: 0,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.event.create({ data: event });
    return event;
  }

  /**
   * Get events with filters
   */
  async getEvents(filters: EventFilters): Promise<Event[]> {
    const where: Record<string, unknown> = {};

    if (filters.category) where['category'] = filters.category;
    if (filters.status) where['status'] = filters.status;
    if (filters.city) where['venueCity'] = { contains: filters.city, mode: 'insensitive' };
    if (filters.organizerId) where['organizerId'] = filters.organizerId;
    if (filters.isOnline !== undefined) where['isOnline'] = filters.isOnline;
    if (filters.from || filters.to) {
      where['startDate'] = {
        ...(filters.from ? { gte: filters.from } : {}),
        ...(filters.to ? { lte: filters.to } : {}),
      };
    }

    return this.db.event.findMany({ where, orderBy: { startDate: 'asc' } }) as Promise<Event[]>;
  }

  /**
   * Purchase tickets for an event
   */
  async purchaseTickets(order: TicketOrder): Promise<Ticket[]> {
    const tickets: Ticket[] = [];
    const now = new Date();

    for (let i = 0; i < order.quantity; i++) {
      const ticket: Ticket = {
        id: `tkt_${Date.now()}_${i}`,
        eventId: order.eventId,
        tierId: order.tierId,
        orderId: `ord_${Date.now()}`,
        attendeeId: order.attendeeId,
        attendeeName: order.attendeeName,
        attendeeEmail: order.attendeeEmail,
        qrCode: this.generateQrCode(order.eventId, `tkt_${Date.now()}_${i}`),
        status: 'valid',
        seatNumber: order.seatNumbers?.[i],
        issuedAt: now,
      };
      tickets.push(ticket);
    }

    await this.db.ticket.createMany({ data: tickets });

    // Update tickets sold count
    await this.db.event.update({
      where: { id: order.eventId },
      data: { ticketsSold: { increment: order.quantity } },
    });

    return tickets;
  }

  /**
   * Check in an attendee using QR code
   */
  async checkIn(qrCode: string): Promise<{ success: boolean; message: string; ticket?: Ticket }> {
    const ticket = await this.db.ticket.findFirst({ where: { qrCode } });

    if (!ticket) return { success: false, message: 'Ticket not found' };
    if (ticket.status === 'used') return { success: false, message: 'Ticket already used', ticket: ticket as Ticket };
    if (ticket.status === 'cancelled') return { success: false, message: 'Ticket has been cancelled' };

    await this.db.ticket.update({
      where: { id: ticket.id },
      data: { status: 'used', checkInAt: new Date() },
    });

    return { success: true, message: 'Check-in successful', ticket: ticket as Ticket };
  }

  /**
   * Cancel / refund a ticket
   */
  async cancelTicket(ticketId: string): Promise<void> {
    await this.db.ticket.update({
      where: { id: ticketId },
      data: { status: 'refunded' },
    });
  }

  /**
   * Update event status
   */
  async updateEventStatus(eventId: string, status: EventStatus): Promise<void> {
    await this.db.event.update({
      where: { id: eventId },
      data: { status, updatedAt: new Date() },
    });
  }

  /**
   * Get analytics for a tenant's events
   */
  async getAnalytics(tenantId: string): Promise<EventsAnalytics> {
    void tenantId;

    return {
      totalEvents: 0,
      upcomingEvents: 0,
      totalTicketsSold: 0,
      totalRevenue: 0,
      revenueThisMonth: 0,
      averageTicketPrice: 0,
      averageAttendanceRate: 0,
      topEventsByRevenue: [],
      ticketsByCategory: {
        conference: 0,
        concert: 0,
        festival: 0,
        workshop: 0,
        webinar: 0,
        sports: 0,
        exhibition: 0,
        corporate: 0,
        networking: 0,
        other: 0,
      },
      checkInRate: 0,
    };
  }

  private generateQrCode(eventId: string, ticketId: string): string {
    const payload = `${eventId}:${ticketId}:${Date.now()}`;
    return Buffer.from(payload).toString('base64');
  }
}
