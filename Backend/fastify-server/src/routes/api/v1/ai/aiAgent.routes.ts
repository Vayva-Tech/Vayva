import { FastifyPluginAsync } from 'fastify';
import { AiAgentService } from '../../../../services/ai/aiAgent.service';

const aiAgentService = new AiAgentService();

export const aiAgentRoutes: FastifyPluginAsync = async (server) => {
  // Get AI agent profile
  server.get('/profile', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      
      try {
        const profile = await aiAgentService.getProfile(storeId);
        return reply.send({ success: true, data: profile });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get profile',
        });
      }
    },
  });

  // Update AI agent profile draft
  server.put('/profile', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const config = request.body as any;

      try {
        const result = await aiAgentService.updateProfile(storeId, userId, config);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update profile',
        });
      }
    },
  });

  // Publish AI agent profile
  server.post('/profile/publish', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;

      try {
        const result = await aiAgentService.publishProfile(storeId, userId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to publish profile',
        });
      }
    },
  });

  // Test message
  server.post('/test-message', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { message } = request.body as any;

      if (!message || typeof message !== 'string') {
        return reply.code(400).send({
          success: false,
          error: 'Message is required',
        });
      }

      try {
        const result = await aiAgentService.testMessage(storeId, message);
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Test message failed',
        });
      }
    },
  });
};
