import { FastifyPluginAsync } from 'fastify';
import { AccountDeletionService } from '../../../../services/platform/account-deletion.service';

const accountDeletionService = new AccountDeletionService();

export const accountDeletionRoutes: FastifyPluginAsync = async (server) => {
  server.get('/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const status = await accountDeletionService.getStatus(storeId);
        return reply.send(status || { active: false });
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/request', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const userId = (request.user as any).userId;
        const body = request.body as Record<string, unknown>;
        const reason = (body.reason as string) || '';

        const result = await accountDeletionService.requestDeletion(
          storeId,
          userId,
          reason
        );

        if (!result.success) {
          return reply.code(400).send(result);
        }

        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const result = await accountDeletionService.cancelDeletion(storeId);

        if (!result.success) {
          return reply.code(404).send(result);
        }

        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
