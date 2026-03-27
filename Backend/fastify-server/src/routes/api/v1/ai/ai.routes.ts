import { FastifyPluginAsync } from 'fastify';
import { AiService } from '../../../services/ai/ai.service';

const aiService = new AiService();

export const aiRoutes: FastifyPluginAsync = async (server) => {
  // Health check endpoint
  server.get('/health', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const status = await aiService.getHealthStatus();
      return reply.send({ success: true, data: status });
    },
  });

  // Get credit summary
  server.get('/credits', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const [summary, alertInfo] = await Promise.all([
          aiService.getCreditSummary(storeId),
          aiService.checkLowCreditAlert(storeId),
        ]);

        return reply.send({
          success: true,
          data: {
            ...summary,
            showAlert: alertInfo.showAlert,
          },
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch AI credit data',
        });
      }
    },
  });

  // Get available top-up packages
  server.get('/credits/packages', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const packages = await aiService.getAvailablePackages();
        return reply.send({ success: true, data: packages });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch packages',
        });
      }
    },
  });

  // Get templates
  server.get('/templates', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const templates = await aiService.getTemplates(storeId);
        return reply.send({ success: true, data: templates });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch templates',
        });
      }
    },
  });

  // Create template
  server.post('/templates', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const templateData = request.body as any;

      try {
        const template = await aiService.createTemplate(storeId, templateData);
        return reply.code(201).send({ success: true, data: template });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create template',
        });
      }
    },
  });

  // Get insights
  server.get('/insights', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;
      const industry = query.industry || 'retail';
      const timeRange = query.timeRange || '7d';

      try {
        const result = await aiService.getInsights(storeId, industry, timeRange);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate insights',
        });
      }
    },
  });

  // Get WhatsApp status
  server.get('/whatsapp/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const status = await aiService.getWhatsAppStatus(storeId);
        return reply.send({ success: true, data: status });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get WhatsApp status',
        });
      }
    },
  });

  // Chat endpoint
  server.post('/chat', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { messages, channel = 'web' } = request.body as any;

      try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          return reply.code(400).send({
            success: false,
            error: 'Messages array is required',
          });
        }

        const response = await aiService.chat(storeId, messages, channel);
        return reply.send({
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process AI request',
        });
      }
    },
  });

  // Get conversations
  server.get('/conversations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        status: query.status,
        platform: query.platform,
      };

      const result = await aiService.getConversations(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  // Get analytics
  server.get('/analytics', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const analytics = await aiService.getAnalytics(storeId);
      return reply.send({ success: true, data: analytics });
    },
  });

  // WhatsApp webhook endpoint
  server.post('/whatsapp/webhook', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const payload = request.body as any;

      try {
        const result = await aiService.whatsappWebhook(storeId, payload);
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Webhook processing failed',
        });
      }
    },
  });

  // Get analytics
  server.get('/analytics', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const analytics = await aiService.getAnalytics(storeId);
        return reply.send({ success: true, data: analytics });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        });
      }
    },
  });

  // Initialize credit top-up
  server.post('/credits/topup/init', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { packId } = request.body as any;

      if (!packId || typeof packId !== 'string') {
        return reply.code(400).send({
          success: false,
          error: 'packId is required',
        });
      }

      try {
        const result = await aiService.initializeCreditTopup(storeId, packId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to initialize top-up',
        });
      }
    },
  });

  // Top-up credits
  server.post('/credits/topup', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { creditsAmount, paymentReference } = request.body as any;

      if (!creditsAmount || !paymentReference) {
        return reply.code(400).send({
          success: false,
          error: 'creditsAmount and paymentReference are required',
        });
      }

      try {
        const result = await aiService.topupCredits(storeId, creditsAmount, paymentReference);
        return reply.code(201).send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process credit top-up',
        });
      }
    },
  });

  // Verify credit top-up
  server.post('/credits/topup/verify', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { reference } = request.body as any;

      if (!reference || typeof reference !== 'string') {
        return reply.code(400).send({
          success: false,
          error: 'reference is required',
        });
      }

      try {
        const result = await aiService.verifyCreditTopup(storeId, reference);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to verify top-up',
        });
      }
    },
  });
};
