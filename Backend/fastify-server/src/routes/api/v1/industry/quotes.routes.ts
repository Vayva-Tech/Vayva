import { FastifyPluginAsync } from 'fastify';
import { QuoteService } from '../../../services/industry/quote.service';

const quoteService = new QuoteService();

export const quoteRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/quotes - List all quotes
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
      };

      const result = await quoteService.findAll(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  // POST /api/v1/quotes - Create a new quote
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const data = request.body as any;

      try {
        const quote = await quoteService.create(storeId, userId, data);
        return reply.code(201).send({ success: true, data: quote });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create quote',
        });
      }
    },
  });

  // GET /api/v1/quotes/:id - Get a single quote
  server.get('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const quote = await quoteService.findOne(id, storeId);
        return reply.send({ success: true, data: quote });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Quote not found',
        });
      }
    },
  });

  // PATCH /api/v1/quotes/:id - Update a quote
  server.patch('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const { id } = request.params as any;
      const data = request.body as any;

      try {
        const quote = await quoteService.update(id, storeId, userId, data);
        return reply.send({ success: true, data: quote });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update quote',
        });
      }
    },
  });

  // DELETE /api/v1/quotes/:id - Delete a quote
  server.delete('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        await quoteService.delete(id, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete quote',
        });
      }
    },
  });
};
