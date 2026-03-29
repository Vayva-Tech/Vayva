import { FastifyPluginAsync } from 'fastify';
import { AiService } from '../../../../services/ai/ai.service';

const aiService = new AiService();

export const aiOpsRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/ai/stats
   * Get AI usage statistics
   */
  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const result = await aiService.getAIStats();
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * GET /api/v1/ai/feedback
   * Get AI feedback submissions
   */
  server.get('/feedback', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const limit = query.limit ? parseInt(query.limit, 10) : 50;

      const result = await aiService.getAIFeedback(limit);
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/ai/feedback
   * Submit AI feedback
   */
  server.post('/feedback', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const body = request.body as any;
      const { rating, comment, modelId, responseId } = body;
      const userId = (request.user as any).userId;

      if (!rating) {
        return reply.code(400).send({ success: false, error: 'rating is required' });
      }

      const feedback = await aiService.submitAIFeedback({
        userId,
        rating,
        comment,
        modelId,
        responseId,
      });
      
      return reply.send({ success: true, data: feedback });
    },
  });

  /**
   * POST /api/v1/ai/pause
   * Pause/resume AI operations
   */
  server.post('/pause', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const body = request.body as any;
      const { pause, reason } = body;

      if (typeof pause !== 'boolean') {
        return reply.code(400).send({ success: false, error: 'pause boolean is required' });
      }

      const result = await aiService.pauseAIOperations(pause, reason);
      return reply.send(result);
    },
  });

  /**
   * GET /api/v1/ai/handoffs
   * Get AI handoff configurations
   */
  server.get('/handoffs', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const result = await aiService.getAIHandoffs();
      return reply.send({ success: true, data: result });
    },
  });
};
