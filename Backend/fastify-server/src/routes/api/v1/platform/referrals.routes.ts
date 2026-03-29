import { FastifyPluginAsync } from 'fastify';
import { ReferralService } from '../../../../services/marketing/referral.service';

const referralService = new ReferralService();

export const referralsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      
      try {
        const data = await referralService.getReferralData(storeId);
        return reply.send({ success: true, data });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch referral data' 
        });
      }
    },
  });
};
