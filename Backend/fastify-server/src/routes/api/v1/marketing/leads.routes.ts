import { FastifyPluginAsync } from 'fastify';
import { LeadService } from '../../../../services/marketing/lead.service';

const leadService = new LeadService();

export const leadsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status,
        source: query.source,
      };

      const leads = await leadService.findAll(storeId, filters);
      return reply.send({ 
        success: true, 
        data: {
          leads,
          total: leads.length,
        }
      });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const data = request.body as any;

      try {
        const result = await leadService.create(storeId, userId, data);
        return reply.code(201).send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create lead' 
        });
      }
    },
  });
};
