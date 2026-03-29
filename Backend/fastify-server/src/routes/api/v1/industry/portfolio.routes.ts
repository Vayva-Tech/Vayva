import { FastifyPluginAsync } from 'fastify';
import { PortfolioService } from '../../../../services/industry/portfolio.service';

const portfolioService = new PortfolioService();

export const portfolioRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const projects = await portfolioService.findAll(storeId);
      return reply.send({ success: true, data: projects });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const project = await portfolioService.create(storeId, data);
        return reply.code(201).send({ success: true, data: project });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create project',
        });
      }
    },
  });

  server.get('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const project = await portfolioService.findOne(id, storeId);
        return reply.send({ success: true, data: project });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Project not found',
        });
      }
    },
  });

  server.put('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const data = request.body as any;

      try {
        const project = await portfolioService.update(id, storeId, data);
        return reply.send({ success: true, data: project });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update project',
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
        await portfolioService.delete(id, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete project',
        });
      }
    },
  });
};
