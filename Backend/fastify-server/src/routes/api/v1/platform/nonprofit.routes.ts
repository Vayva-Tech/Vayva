import { FastifyPluginAsync } from 'fastify';
import { NonprofitService } from '../../../services/platform/nonprofit.service';

const nonprofitService = new NonprofitService();

export const nonprofitRoutes: FastifyPluginAsync = async (server) => {
  server.get('/donors', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        donorType: query.donorType,
        search: query.search,
      };

      const result = await nonprofitService.getDonors(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/donors', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const donorData = request.body as any;

      try {
        const donor = await nonprofitService.createDonor(storeId, donorData);
        return reply.code(201).send({ success: true, data: donor });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create donor' 
        });
      }
    },
  });

  server.get('/donors/:id/engagement', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const engagement = await nonprofitService.getDonorEngagement(id, storeId);
      return reply.send({ success: true, data: engagement });
    },
  });

  server.get('/grants', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
      };

      const result = await nonprofitService.getGrants(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/grants', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const grantData = request.body as any;

      try {
        const grant = await nonprofitService.createGrant(storeId, grantData);
        return reply.code(201).send({ success: true, data: grant });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create grant' 
        });
      }
    },
  });

  server.get('/grants/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const grant = await nonprofitService.getGrant(id, storeId);
        return reply.send({ success: true, data: grant });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Grant not found',
        });
      }
    },
  });

  server.put('/grants/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const updated = await nonprofitService.updateGrant(id, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update grant',
        });
      }
    },
  });

  server.delete('/grants/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await nonprofitService.deleteGrant(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete grant',
        });
      }
    },
  });

  server.get('/grants/pipeline/summary', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      const pipeline = await nonprofitService.getGrantPipeline(storeId);
      return reply.send({ success: true, data: pipeline });
    },
  });

  server.get('/donations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        donorId: query.donorId,
        campaignId: query.campaignId,
        status: query.status,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await nonprofitService.getDonations(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/donations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const donationData = request.body as any;

      try {
        const donation = await nonprofitService.createDonation(storeId, donationData);
        return reply.code(201).send({ success: true, data: donation });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create donation' 
        });
      }
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await nonprofitService.getNonprofitStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
