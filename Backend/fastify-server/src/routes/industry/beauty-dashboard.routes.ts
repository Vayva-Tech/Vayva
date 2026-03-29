import { FastifyPluginAsync } from "fastify";
import { BeautyDashboardService } from "../../services/industry/beauty-dashboard.service";

export const beautyDashboardRoutes: FastifyPluginAsync = async (fastify) => {
  const beautyDashboardService = new BeautyDashboardService();

  fastify.get("/", async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await beautyDashboardService.getDashboard(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get("/overview", async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await beautyDashboardService.getOverview(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
