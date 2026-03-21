/**
 * AI Usage Activity Monitor API
 * ==============================
 * Real-time AI usage activity stream for Ops Console
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@vayva/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isOpsUser = session.user.email?.endsWith('@vayva.tech') || 
                    session.user.role === 'admin' || 
                    session.user.role === 'ops';

  if (!isOpsUser) {
    return res.status(403).json({ error: 'Forbidden - Ops access only' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetActivity(req, res);
      
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/ops/ai-activity
 * Get recent AI usage activity across all merchants
 */
async function handleGetActivity(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { limit = '50', storeId } = req.query;
  const take = parseInt(limit as string);

  const where: any = {
    success: true,
  };

  if (storeId) {
    where.storeId = storeId;
  }

  const events = await prisma.aiUsageEvent.findMany({
    where,
    include: {
      store: {
        select: {
          name: true,
          subscription: {
            select: {
              planKey: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take,
  });

  const activity = events.map(event => ({
    id: event.id,
    storeId: event.storeId,
    storeName: event.store.name,
    planKey: event.store.subscription?.planKey || 'unknown',
    model: event.model.split('/').pop() || event.model,
    inputTokens: event.inputTokens,
    outputTokens: event.outputTokens,
    creditsUsed: event.creditsUsed,
    costKobo: Number(event.costEstimateKobo),
    latencyMs: event.latencyMs,
    channel: event.channel,
    timestamp: event.createdAt,
  }));

  // Calculate aggregate stats for this activity set
  const totalCredits = activity.reduce((sum, a) => sum + a.creditsUsed, 0);
  const totalCost = activity.reduce((sum, a) => sum + a.costKobo, 0);
  const avgLatency = Math.round(
    activity.reduce((sum, a) => sum + (a.latencyMs || 0), 0) / activity.length
  );

  return res.status(200).json({
    success: true,
    data: {
      activity,
      summary: {
        totalRequests: activity.length,
        totalCreditsUsed: totalCredits,
        totalCostKobo: totalCost,
        totalCostNaira: (totalCost / 100).toFixed(2),
        avgLatencyMs: avgLatency,
      },
    },
  });
}
