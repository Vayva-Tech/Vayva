import { FastifyPluginAsync } from 'fastify';
import { CampaignsService } from '../../../services/platform/campaigns.service';

const campaignsService = new CampaignsService();

export const campaignsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        status: query.status,
      };

      const result = await campaignsService.getCampaigns(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const campaignData = request.body as any;

      try {
        const campaign = await campaignsService.createCampaign(storeId, campaignData);
        return reply.code(201).send({ success: true, data: campaign });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create campaign' 
        });
      }
    },
  });

  server.get('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const campaign = await campaignsService.getCampaignById(id, storeId);
      
      if (!campaign) {
        return reply.code(404).send({ success: false, error: 'Campaign not found' });
      }

      return reply.send({ success: true, data: campaign });
    },
  });

  server.put('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const campaign = await campaignsService.updateCampaign(id, storeId, updates);
        return reply.send({ success: true, data: campaign });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update campaign' 
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
        const result = await campaignsService.deleteCampaign(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete campaign' 
        });
      }
    },
  });

  server.get('/dashboard/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await campaignsService.getCampaignStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
