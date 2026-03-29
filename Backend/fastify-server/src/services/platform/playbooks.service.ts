import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Playbook Service - Backend
 * Manages playbook executions and tracking
 */
export class PlaybookService {
  constructor(private readonly db = prisma) {}

  /**
   * Get all playbooks with execution stats
   */
  async getAllPlaybooks() {
    // Get unique playbook IDs from executions
    const executions = await this.db.playbookExecution.findMany({
      select: {
        playbookId: true,
        status: true,
      },
    });

    // Group by playbook ID and calculate stats
    const playbookStatsMap = new Map();
    executions.forEach((execution) => {
      if (!playbookStatsMap.has(execution.playbookId)) {
        playbookStatsMap.set(execution.playbookId, {
          totalExecutions: 0,
          successful: 0,
          failed: 0,
          pending: 0,
        });
      }
      const stats = playbookStatsMap.get(execution.playbookId);
      stats.totalExecutions++;
      if (execution.status === 'completed') stats.successful++;
      else if (execution.status === 'failed') stats.failed++;
      else if (execution.status === 'pending') stats.pending++;
    });

    // Convert to array format
    const playbooks = Array.from(playbookStatsMap.entries()).map(
      ([playbookId, stats]) => ({
        id: playbookId,
        stats,
      })
    );

    return { playbooks };
  }

  /**
   * Get specific playbook with stats and recent executions
   */
  async getPlaybookDetails(playbookId: string) {
    const [executions] = await Promise.all([
      this.db.playbookExecution.findMany({
        where: { playbookId },
        orderBy: { startedAt: 'desc' },
        take: 100,
      }),
    ]);

    const stats = {
      total: executions.length,
      completed: executions.filter((e) => e.status === 'completed').length,
      failed: executions.filter((e) => e.status === 'failed').length,
      pending: executions.filter((e) => e.status === 'pending').length,
    };

    return {
      playbook: { id: playbookId },
      stats,
      executions,
    };
  }

  /**
   * Get playbook executions for a specific store
   */
  async getStoreExecutions(storeId: string, limit = 50) {
    const executions = await this.db.playbookExecution.findMany({
      where: { storeId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return { executions };
  }

  /**
   * Trigger playbook execution
   * Note: Actual execution happens via queue worker
   */
  async triggerExecution(params: {
    playbookId: string;
    storeId: string;
    triggerData?: any;
  }): Promise<boolean> {
    const { playbookId, storeId, triggerData = { source: 'manual' } } = params;

    const store = await this.db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    logger.info(
      `[Playbook] Execution triggered: ${playbookId} for store ${storeId}`
    );
    return true;
  }
}
