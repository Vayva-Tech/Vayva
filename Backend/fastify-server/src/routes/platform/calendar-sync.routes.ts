import { FastifyPluginAsync } from 'fastify';
import { CalendarSyncService } from '../../services/platform/calendar-sync.service';

export const calendarSyncRoutes: FastifyPluginAsync = async (fastify) => {
  const calendarSyncService = new CalendarSyncService();

  fastify.get('/:id', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const { id } = request.params as { id: string };
      const result = await calendarSyncService.getCalendarEvents(id, storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.post('/:id/sync', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const { id } = request.params as { id: string };
      const events = request.body as any[];
      const result = await calendarSyncService.syncCalendar(id, storeId, events);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
