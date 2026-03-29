import { FastifyPluginAsync } from 'fastify';
import { PlaybookService } from '../../../../services/platform/playbooks.service';

const playbookService = new PlaybookService();

export const playbooksRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/playbooks
   * Get all playbooks with execution stats
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const playbookId = query.playbookId as string | undefined;
      const storeId = query.storeId as string | undefined;

      if (playbookId) {
        // Get specific playbook details
        const result = await playbookService.getPlaybookDetails(playbookId);
        return reply.send({ success: true, data: result });
      }

      if (storeId) {
        // Get executions for specific store
        const result = await playbookService.getStoreExecutions(storeId);
        return reply.send({ success: true, data: result });
      }

      // Get all playbooks with stats
      const result = await playbookService.getAllPlaybooks();
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/playbooks/execute
   * Manually trigger playbook execution
   */
  server.post('/execute', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const body = request.body as any;
      const { playbookId, storeId, triggerData } = body;

      if (!playbookId || !storeId) {
        return reply.code(400).send({ 
          success: false, 
          error: 'playbookId and storeId are required' 
        });
      }

      try {
        const success = await playbookService.triggerExecution({
          playbookId,
          storeId,
          triggerData: triggerData || { source: 'manual' },
        });
        
        return reply.send({ 
          success: true, 
          message: 'Playbook execution queued',
          playbook: {
            id: playbookId,
          },
        });
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ 
            success: false, 
            error: 'Store not found' 
          });
        }
        throw error;
      }
    },
  });
};
