import { FastifyPluginAsync } from 'fastify';
import { DiscountRulesService } from '../../../../services/commerce/discountRules.service';

const discountRulesService = new DiscountRulesService();

export const discountRulesRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        active: query.active,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      };

      const result = await discountRulesService.findAll(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const rule = await discountRulesService.create(storeId, data);
        return reply.code(201).send({ success: true, rule });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create discount rule' 
        });
      }
    },
  });

  server.patch('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id, ...data } = request.body as any;

      try {
        if (!id) {
          return reply.code(400).send({ error: 'Rule ID required' });
        }

        const rule = await discountRulesService.update(id, storeId, data);
        return reply.send({ success: true, rule });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update discount rule' 
        });
      }
    },
  });

  server.delete('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;
      const id = query.id;

      try {
        if (!id) {
          return reply.code(400).send({ error: 'Rule ID required' });
        }

        const result = await discountRulesService.delete(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete discount rule' 
        });
      }
    },
  });
};
