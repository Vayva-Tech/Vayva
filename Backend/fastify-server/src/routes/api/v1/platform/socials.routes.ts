import { FastifyPluginAsync } from 'fastify';
import { SocialService } from '../../../../services/platform/social.service';

const socialService = new SocialService();

export const socialsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const connections = await socialService.getSocialConnections(storeId);
        return reply.send({ success: true, data: connections });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch connections' 
        });
      }
    },
  });

  server.post('/connect', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const connectionData = request.body as any;

      try {
        const connection = await socialService.createSocialConnection(storeId, connectionData);
        return reply.code(201).send({ success: true, data: connection });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to connect' 
        });
      }
    },
  });

  server.post('/:id/disconnect', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await socialService.disconnectSocial(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to disconnect' 
        });
      }
    },
  });
};
