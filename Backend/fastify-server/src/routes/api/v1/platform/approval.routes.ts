import { FastifyPluginAsync } from 'fastify';
import { ApprovalExecutionService } from '../../../../services/platform/approval-execution.service';

const approvalService = new ApprovalExecutionService();

export const approvalRoutes: FastifyPluginAsync = async (server) => {
  server.get('/pending', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const pending = await approvalService.getPendingApprovals(storeId);
        return reply.send(pending);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/:requestId/execute', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const requestId = (request.params as any).requestId;
        const userId = (request.user as any).userId;
        
        const result = await approvalService.executeApproval(
          requestId,
          userId
        );
        
        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/:requestId/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const requestId = (request.params as any).requestId;
        const status = await approvalService.getApprovalStatus(requestId);
        return reply.send(status);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
