import { FastifyPluginAsync } from 'fastify';
import { ReviewService } from '../../../services/commerce/review.service';

const reviewService = new ReviewService();

export const reviewsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      
      try {
        const reviews = await reviewService.findAll(storeId);
        return reply.send({ success: true, data: reviews });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch reviews' 
        });
      }
    },
  });

  server.post('/:id/approve', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const review = await reviewService.approve(id, storeId);
        return reply.send({ success: true, data: review });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to approve review' 
        });
      }
    },
  });

  server.post('/:id/reject', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const review = await reviewService.reject(id, storeId);
        return reply.send({ success: true, data: review });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to reject review' 
        });
      }
    },
  });

  server.delete('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await reviewService.delete(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete review' 
        });
      }
    },
  });
};
