import { FastifyPluginAsync } from 'fastify';
import { SecurityService } from '../../../../services/platform/security.service';

const securityService = new SecurityService();

export const securityRoutes: FastifyPluginAsync = async (server) => {
  server.get('/sudo/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const userId = (request.user as any).userId;
        const isSudo = await securityService.checkSudoMode(userId, storeId);
        return reply.send({ isSudo });
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/sudo/enable', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const userId = (request.user as any).userId;
        const body = request.body as Record<string, unknown>;
        const durationMinutes = (body.durationMinutes as number) || 30;

        const result = await securityService.enableSudoMode(userId, storeId, durationMinutes);
        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/sudo/disable', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const userId = (request.user as any).userId;
        const result = await securityService.disableSudoMode(userId, storeId);
        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/audit-log', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as Record<string, string | undefined>;
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        
        const logs = await securityService.getSecurityAuditLog(storeId, limit);
        return reply.send(logs);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
