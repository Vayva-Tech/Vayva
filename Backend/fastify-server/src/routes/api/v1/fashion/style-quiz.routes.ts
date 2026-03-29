import { FastifyPluginAsync } from 'fastify';
import { FashionStyleQuizService } from '../../../../services/fashion/style-quiz.service';

const fashionService = new FashionStyleQuizService();

export const fashionRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /fashion/quizzes
   * Get all quizzes for store
   */
  server.get('/quizzes', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const quizzes = await fashionService.getStoreQuizzes(storeId);
      return reply.send({ success: true, data: quizzes });
    },
  });

  /**
   * POST /fashion/quizzes
   * Create a new quiz
   */
  server.post('/quizzes', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const quizData = request.body as any;

      try {
        const quiz = await fashionService.createQuiz({ ...quizData, storeId });
        return reply.send({ success: true, data: quiz });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Creation failed' 
        });
      }
    },
  });

  /**
   * POST /fashion/quizzes/:quizId/submit
   * Submit quiz and get recommendations
   */
  server.post('/quizzes/:quizId/submit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { quizId } = request.params as { quizId: string };
      const answers = request.body as { answers: any[] };

      try {
        const result = await fashionService.submitQuiz(quizId, answers.answers);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Submission failed' 
        });
      }
    },
  });

  /**
   * GET /fashion/quizzes/:quizId/results/:customerId
   * Get customer's quiz results
   */
  server.get('/quizzes/:quizId/results/:customerId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { quizId, customerId } = request.params as { quizId: string; customerId: string };

      try {
        const result = await fashionService.getCustomerResults(quizId, customerId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(404).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Results not found' 
        });
      }
    },
  });
};
