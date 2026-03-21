// @ts-nocheck
/**
 * Ops Console - AI Credit Monitoring API
 * =======================================
 * Admin endpoint to monitor all merchant AI credit usage
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AICreditService } from '@/lib/ai/credit-service';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession({ req, ...authOptions });

  // Only ops/admin users should access this
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user has ops role (adjust based on your role system)
  const isOpsUser = session.user.email?.endsWith('@vayva.tech') || 
                    session.user.role === 'admin' || 
                    session.user.role === 'ops';

  if (!isOpsUser) {
    return res.status(403).json({ error: 'Forbidden - Ops access only' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetAllSubscriptions(req, res);
      
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('[Ops AI Credits API] Error handling request', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/ops/ai-credits
 * Get all merchant AI subscriptions with credit info
 */
async function handleGetAllSubscriptions(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const subscriptions = await AICreditService.getAllSubscriptionsWithCredits();

  // Add filtering and sorting options
  const { 
    filter = 'all', 
    sort = 'percentageUsed',
    lowCreditOnly = 'false' 
  } = req.query;

  let filtered = subscriptions;

  // Filter by low credit if requested
  if (lowCreditOnly === 'true') {
    filtered = filtered.filter(sub => sub.isLowCredit);
  }

  // Apply predefined filters
  if (filter === 'low') {
    filtered = filtered.filter(sub => sub.isLowCredit);
  } else if (filter === 'high_usage') {
    filtered = filtered.filter(sub => sub.percentageUsed > 80);
  } else if (filter === 'recent_topup') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    filtered = filtered.filter(sub => 
      sub.lastTopupAt && new Date(sub.lastTopupAt) > sevenDaysAgo
    );
  }

  // Sort results
  filtered.sort((a, b) => {
    switch (sort) {
      case 'creditsRemaining':
        return a.creditsRemaining - b.creditsRemaining;
      case 'percentageUsed':
        return b.percentageUsed - a.percentageUsed;
      case 'totalCreditsPurchased':
        return b.totalCreditsPurchased - a.totalCreditsPurchased;
      case 'storeName':
        return a.storeName.localeCompare(b.storeName);
      default:
        return b.percentageUsed - a.percentageUsed;
    }
  });

  return res.status(200).json({
    success: true,
    count: filtered.length,
    data: filtered,
    summary: {
      totalMerchants: subscriptions.length,
      lowCreditMerchants: subscriptions.filter(s => s.isLowCredit).length,
      averageUsagePercent: Math.round(
        subscriptions.reduce((sum, s) => sum + s.percentageUsed, 0) / subscriptions.length
      ),
      totalCreditsPurchased: subscriptions.reduce((sum, s) => sum + s.totalCreditsPurchased, 0),
      totalCreditsRemaining: subscriptions.reduce((sum, s) => sum + s.creditsRemaining, 0),
    },
  });
}
