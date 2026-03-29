import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class CalendarSyncService {
  constructor(private readonly db = prisma) {}

  async getCalendarEvents(eventId: string, storeId: string) {
    const calendarEvents = await this.db.calendarEvent.findMany({
      where: { 
        externalEventId: eventId,
        storeId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { start: 'asc' },
    });

    return calendarEvents.map((event) => ({
      id: event.id,
      externalEventId: event.externalEventId,
      title: event.title,
      description: event.description,
      start: event.start,
      end: event.end,
      location: event.location,
      type: event.type,
      status: event.status,
      assignedTo: event.assignedTo
        ? `${event.assignedTo.firstName} ${event.assignedTo.lastName}`
        : null,
      metadata: event.metadata,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));
  }

  async syncCalendar(eventId: string, storeId: string, events: any[]) {
    const existingEvents = await this.db.calendarEvent.findMany({
      where: { externalEventId: eventId, storeId },
      select: { id: true, externalRef: true },
    });

    const existingRefs = new Set(existingEvents.map((e) => e.externalRef));
    const createdOrUpdated: any[] = [];

    for (const eventData of events) {
      if (existingRefs.has(eventData.externalRef)) {
        const updated = await this.db.calendarEvent.updateMany({
          where: { externalEventId: eventId, externalRef: eventData.externalRef },
          data: eventData,
        });
        createdOrUpdated.push(updated);
      } else {
        const created = await this.db.calendarEvent.create({
          data: {
            ...eventData,
            externalEventId: eventId,
            storeId,
          },
        });
        createdOrUpdated.push(created);
      }
    }

    logger.info(`[Calendar] Synced ${createdOrUpdated.length} events for ${eventId}`);
    return createdOrUpdated;
  }
}
