import { FastifyPluginAsync } from 'fastify';
import { WebsocketService } from '../../../services/platform/websocket.service';

const websocketService = new WebsocketService();

export const websocketRoutes: FastifyPluginAsync = async (server) => {
  server.post('/broadcast', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const message = request.body as any;

      try {
        const broadcast = await websocketService.broadcastMessage(storeId, message);
        return reply.code(201).send({ success: true, data: broadcast });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to broadcast' 
        });
      }
    },
  });

  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const stats = await websocketService.getConnectionStats(storeId);
        return reply.send({ success: true, data: stats });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch stats' 
        });
      }
    },
  });
};
