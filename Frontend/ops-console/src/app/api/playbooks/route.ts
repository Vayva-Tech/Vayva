/**
 * Playbooks API Routes
 * GET /api/playbooks - List all playbooks and their stats
 * POST /api/playbooks/execute - Execute a playbook manually
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/db';
import { Queue } from 'bullmq';
import { getRedis } from '@vayva/redis';
import { QUEUES } from '@vayva/shared';
import {
  BUILT_IN_PLAYBOOKS,
  getEnabledPlaybooks,
} from '@vayva/customer-success';

// GET /api/playbooks - Get playbooks and execution stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playbookId = searchParams.get('playbookId');
    const storeId = searchParams.get('storeId');

    // If playbookId provided, get specific stats
    if (playbookId) {
      const executions = await prisma.playbookExecution.findMany({
        where: { playbookId },
        orderBy: { startedAt: 'desc' },
        take: 100,
        include: {
          store: {
            select: {
              name: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      const stats = {
        total: executions.length,
        completed: executions.filter((e) => e.status === 'completed').length,
        failed: executions.filter((e) => e.status === 'failed').length,
        pending: executions.filter((e) => e.status === 'pending').length,
      };

      return NextResponse.json({
        playbook: BUILT_IN_PLAYBOOKS[playbookId],
        stats,
        executions,
      });
    }

    // If storeId provided, get executions for that store
    if (storeId) {
      const executions = await prisma.playbookExecution.findMany({
        where: { storeId },
        orderBy: { startedAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({ executions });
    }

    // Get all playbooks with stats
    const playbooks = getEnabledPlaybooks();
    const playbookStats = await Promise.all(
      playbooks.map(async (playbook) => {
        const executions = await prisma.playbookExecution.findMany({
          where: { playbookId: playbook.id },
        });

        return {
          ...playbook,
          stats: {
            totalExecutions: executions.length,
            successful: executions.filter((e) => e.status === 'completed')
              .length,
            failed: executions.filter((e) => e.status === 'failed').length,
          },
        };
      })
    );

    return NextResponse.json({ playbooks: playbookStats });
  } catch (error) {
    console.error('Playbooks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/playbooks/execute - Manually execute a playbook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playbookId, storeId, triggerData } = body;

    if (!playbookId || !storeId) {
      return NextResponse.json(
        { error: 'playbookId and storeId are required' },
        { status: 400 }
      );
    }

    // Verify playbook exists
    const playbook = BUILT_IN_PLAYBOOKS[playbookId];
    if (!playbook) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    // Queue playbook execution
    const connection = await getRedis();
    const queue = new Queue(QUEUES.PLAYBOOK_EXECUTION, { connection });

    await queue.add(`manual-${playbookId}-${storeId}`, {
      playbookId,
      storeId,
      triggerData: triggerData || { source: 'manual' },
    });

    await queue.close();

    return NextResponse.json({
      success: true,
      message: 'Playbook execution queued',
      playbook: {
        id: playbook.id,
        name: playbook.name,
      },
    });
  } catch (error) {
    console.error('Playbook execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
