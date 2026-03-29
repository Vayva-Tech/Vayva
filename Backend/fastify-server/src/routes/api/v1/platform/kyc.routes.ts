import { FastifyPluginAsync } from 'fastify';
import { KycService } from '../../../../services/platform/kyc.service';

const kycService = new KycService();

export const kycRoutes: FastifyPluginAsync = async (server) => {
  server.get('/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const status = await kycService.getStatus(storeId);
        return reply.send(status || { active: false });
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/submit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const userId = (request.user as any).userId;
        const body = request.body as Record<string, unknown>;

        const result = await kycService.submitForReview(storeId, {
          nin: body.nin as string,
          cacNumber: body.cacNumber as string | undefined,
          consent: body.consent as boolean,
          ipAddress: request.ip,
          actorUserId: userId,
        });

        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/admin/update', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.query as any).storeId;
        const reviewerId = (request.user as any).userId;
        const body = request.body as Record<string, unknown>;

        const result = await kycService.updateStatus(
          storeId,
          body.status as any,
          reviewerId,
          body.notes as string
        );

        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
