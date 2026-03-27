import { FastifyPluginAsync } from 'fastify';
import { WorkflowService } from '../../../services/core/workflow.service';

const workflowService = new WorkflowService();

export const workflowsRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/workflows - List workflows
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        industry: query.industry,
        status: query.status,
      };

      try {
        const result = await workflowService.getWorkflows(storeId, filters);
        return reply.send(result);
      } catch (error) {
        return reply.code(502).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to reach workflow service',
        });
      }
    },
  });

  // POST /api/v1/workflows - Create workflow
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const workflowData = request.body as any;

      try {
        const result = await workflowService.createWorkflow(storeId, userId, workflowData);
        return reply.send(result);
      } catch (error) {
        return reply.code(502).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to reach workflow service',
        });
      }
    },
  });
};
