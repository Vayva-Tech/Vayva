import { FastifyPluginAsync } from 'fastify';
import { DataGovernanceService } from '../../../../services/platform/data-governance.service';

const governanceService = new DataGovernanceService();

export const dataGovernanceRoutes: FastifyPluginAsync = async (server) => {
  server.post('/export/request', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const body = request.body as Record<string, unknown>;
        const storeId = (request.user as any).storeId;
        const userId = (request.user as any).userId;
        const userEmail = (request.user as any).email;

        const requestedBy = {
          userId,
          email: userEmail,
          role: (request.user as any).role,
        };

        const scopes = {
          dataTypes: body.dataTypes as string[],
          dateRange: body.dateRange as { from: string; to: string } | undefined,
          format: (body.format as 'json' | 'csv' | 'xlsx') || 'json',
        };

        const exportRequest = await governanceService.requestExport(storeId, requestedBy, scopes);
        return reply.send(exportRequest);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/deletion/request', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const body = request.body as Record<string, string>;
        const storeId = (request.user as any).storeId;
        const userId = (request.user as any).userId;
        const userEmail = (request.user as any).email;

        const requestedBy = {
          userId,
          email: userEmail,
          role: (request.user as any).role,
        };

        const deletionRequest = await governanceService.requestDeletion(
          storeId,
          requestedBy,
          body.reason
        );
        return reply.send(deletionRequest);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/exports', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as Record<string, string | undefined>;
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        
        const exports = await governanceService.getExportRequests(storeId, limit);
        return reply.send(exports);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/deletions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as Record<string, string | undefined>;
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        
        const deletions = await governanceService.getDeletionRequests(storeId, limit);
        return reply.send(deletions);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/ai-traces', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const query = request.query as Record<string, string | undefined>;
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        
        const traces = await governanceService.getAiTraces(storeId, limit);
        return reply.send(traces);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
