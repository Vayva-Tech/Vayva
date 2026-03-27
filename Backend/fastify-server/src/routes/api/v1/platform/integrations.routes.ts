import { FastifyPluginAsync } from 'fastify';
import { MarketingService } from '../../../services/platform/marketing.service';

const marketingService = new MarketingService();

export const integrationsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/api-keys', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const apiKeys = await marketingService.getApiKeys(storeId);
      return reply.send({ success: true, data: apiKeys });
    },
  });

  server.post('/api-keys', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const keyData = request.body as any;

      try {
        const apiKey = await marketingService.createApiKey(storeId, keyData);
        return reply.code(201).send({ success: true, data: apiKey });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create API key' 
        });
      }
    },
  });

  server.post('/api-keys/:id/rotate', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const rotated = await marketingService.rotateApiKey(id, storeId);
        return reply.send({ success: true, data: rotated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to rotate API key' 
        });
      }
    },
  });

  server.delete('/api-keys/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await marketingService.deleteApiKey(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete API key' 
        });
      }
    },
  });

  server.get('/webhooks', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const webhooks = await marketingService.getWebhooks(storeId);
      return reply.send({ success: true, data: webhooks });
    },
  });

  server.post('/webhooks', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const webhookData = request.body as any;

      try {
        const webhook = await marketingService.createWebhook(storeId, webhookData);
        return reply.code(201).send({ success: true, data: webhook });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create webhook' 
        });
      }
    },
  });

  server.post('/webhooks/:id/test', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await marketingService.testWebhook(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to test webhook' 
        });
      }
    },
  });
};
