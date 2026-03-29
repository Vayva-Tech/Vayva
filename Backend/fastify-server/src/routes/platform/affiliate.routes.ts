import { FastifyPluginAsync } from "fastify";
import { AffiliateService } from "../../services/platform/affiliate.service";

export const affiliateRoutes: FastifyPluginAsync = async (fastify) => {
  const affiliateService = new AffiliateService();

  fastify.get("/dashboard", async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await affiliateService.getDashboard(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get("/payout/approvals", async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await affiliateService.getPayoutApprovals(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
