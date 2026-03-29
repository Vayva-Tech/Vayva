import { FastifyPluginAsync } from 'fastify';
import { BeautyService } from '../../services/industry/beauty.service';

export const beautyRoutes: FastifyPluginAsync = async (fastify) => {
  const beautyService = new BeautyService();

  fastify.get('/stylists', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await beautyService.getStylists(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/stylists/availability', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const stylistId = (request.query as any).stylistId;
      const date = (request.query as any).date;
      const result = await beautyService.getStylistAvailability(stylistId, storeId, date);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/gallery', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const id = (request.query as any).id;
      const result = await beautyService.getGallery(storeId, id);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/packages', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await beautyService.getPackages(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/services/performance', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await beautyService.getServicePerformance(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
