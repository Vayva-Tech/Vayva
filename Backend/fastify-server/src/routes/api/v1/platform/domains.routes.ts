import { FastifyPluginAsync } from 'fastify';
import { DomainsService } from '../../../services/platform/domains.service';

const domainsService = new DomainsService();

export const domainsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const domains = await domainsService.getDomains(storeId);
      return reply.send({ success: true, data: domains });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const domainData = request.body as any;

      try {
        const domain = await domainsService.createDomain(storeId, domainData);
        return reply.code(201).send({ success: true, data: domain });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create domain' 
        });
      }
    },
  });

  server.post('/:id/verify', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const verified = await domainsService.verifyDomain(id, storeId);
        return reply.send({ success: true, data: verified });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to verify domain' 
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
        const result = await domainsService.deleteDomain(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete domain' 
        });
      }
    },
  });
};
