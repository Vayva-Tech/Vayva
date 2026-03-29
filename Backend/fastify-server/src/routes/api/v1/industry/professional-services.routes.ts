import { FastifyPluginAsync } from 'fastify';
import { ProfessionalServicesService } from '../../../../services/industry/professionalServices.service';

const professionalServicesService = new ProfessionalServicesService();

export const professionalServicesRoutes: FastifyPluginAsync = async (server) => {
  server.get('/proposals', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        limit: query.limit ? parseInt(query.limit, 10) : 200,
        status: query.status,
      };

      const proposals = await professionalServicesService.findProposals(storeId, filters);
      return reply.send({ success: true, data: proposals });
    },
  });

  server.post('/proposals', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const proposal = await professionalServicesService.createProposal(storeId, data);
        return reply.code(201).send({ success: true, data: proposal });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create proposal',
        });
      }
    },
  });

  server.get('/proposals/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as any;

      try {
        const proposal = await professionalServicesService.findOne(id);
        return reply.send({ success: true, data: proposal });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Proposal not found',
        });
      }
    },
  });

  server.patch('/proposals/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const { status } = request.body as any;

      try {
        const proposal = await professionalServicesService.updateStatus(id, status);
        return reply.send({ success: true, data: proposal });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update status',
        });
      }
    },
  });

  server.delete('/proposals/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as any;

      try {
        await professionalServicesService.delete(id);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete proposal',
        });
      }
    },
  });

  server.get('/analytics/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await professionalServicesService.getAnalytics(storeId);
      return reply.send({ success: true, data: stats });
    },
  });

  server.get('/team', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const team = await professionalServicesService.getTeamMembers(storeId);
      return reply.send({ success: true, data: team });
    },
  });
};
