import { FastifyPluginAsync } from 'fastify';
import { CouponService } from '../../../../services/commerce/coupon.service';

const couponService = new CouponService();

export const couponRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status,
        ruleId: query.ruleId,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      };

      const result = await couponService.findAll(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const result = await couponService.create(storeId, data);
        return reply.code(201).send(result);
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create coupon' 
        });
      }
    },
  });
};
