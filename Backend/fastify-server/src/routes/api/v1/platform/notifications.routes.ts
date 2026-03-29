import { FastifyPluginAsync } from 'fastify';
import { NotificationsService } from '../../../../services/platform/notifications.service';

const notificationsService = new NotificationsService();

export const notificationsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        unreadOnly: query.unreadOnly === 'true',
        type: query.type,
      };

      const result = await notificationsService.getNotifications(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/mark-read', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { notificationId } = request.body as any;

      try {
        const notification = await notificationsService.markAsRead(notificationId, storeId);
        return reply.send({ success: true, data: notification });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to mark as read' 
        });
      }
    },
  });

  server.post('/mark-all-read', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.body as any).userId;

      const result = await notificationsService.markAllAsRead(storeId, userId);
      return reply.send({ success: true, data: result });
    },
  });

  server.get('/unread-count', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.query as any).userId;

      const count = await notificationsService.getUnreadCount(storeId, userId);
      return reply.send({ success: true, data: count });
    },
  });
};
