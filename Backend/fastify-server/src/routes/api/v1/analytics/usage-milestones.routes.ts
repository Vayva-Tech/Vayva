import { FastifyPluginAsync } from 'fastify';
import { UsageMilestonesService, MILESTONE_CONFIGS } from '../../../../services/security/usage-milestones.service';
import { z } from 'zod';

const usageMilestonesService = new UsageMilestonesService();

export const usageMilestonesRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/usage/milestones/check
   * Check for new milestones and return unachieved ones
   */
  server.post('/check', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        storeId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { storeId } = request.body;
        
        const newMilestones = await usageMilestonesService.checkNewMilestones(storeId);
        
        // Record any new milestones found
        for (const milestone of newMilestones) {
          await usageMilestonesService.recordMilestone(storeId, milestone.type);
        }

        return reply.send({
          success: true,
          data: {
            newMilestones,
            count: newMilestones.length,
          },
        });
      } catch (error) {
        server.log.error('[UsageMilestonesRoute] Check failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/usage/milestones/progress
   * Get progress to next milestone
   */
  server.get('/progress', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        const progress = await usageMilestonesService.getNextMilestoneProgress(storeId);
        
        return reply.send(progress);
      } catch (error) {
        server.log.error('[UsageMilestonesRoute] Progress check failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/usage/milestones/history
   * Get achieved milestones history
   */
  server.get('/history', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        const history = await usageMilestonesService.getMilestoneHistory(storeId);
        
        return reply.send({
          success: true,
          data: history,
        });
      } catch (error) {
        server.log.error('[UsageMilestonesRoute] History fetch failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/usage/milestones/list
   * Get list of all achieved milestone types
   */
  server.get('/list', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        const achieved = await usageMilestonesService.getAchievedMilestones(storeId);
        
        return reply.send({
          success: true,
          data: {
            achieved,
            total: achieved.length,
          },
        });
      } catch (error) {
        server.log.error('[UsageMilestonesRoute] List fetch failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/usage/milestones/config
   * Get all milestone configurations
   */
  server.get('/config', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        return reply.send({
          success: true,
          data: MILESTONE_CONFIGS,
        });
      } catch (error) {
        server.log.error('[UsageMilestonesRoute] Config fetch failed', error);
        throw error;
      }
    },
  });
};
