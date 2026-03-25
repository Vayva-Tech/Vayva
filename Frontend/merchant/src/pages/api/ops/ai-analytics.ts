/**
 * AI Revenue & Analytics API
 * ===========================
 * Tracks AI-related income, costs, and profitability for Ops Console
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@vayva/db';
import { logger } from '@/lib/logger';

function numKobo(value: bigint | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'bigint' ? Number(value) : value;
}

function groupByCount(row: { _count: number | Record<string, number> }): number {
  const c = row._count;
  if (typeof c === 'number') return c;
  if (c && typeof c === 'object' && '_all' in c && typeof c._all === 'number') {
    return c._all;
  }
  return 0;
}

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
        return handleGetAnalytics(req, res);
      
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('[AI Revenue Analytics API] Error', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/ops/ai-analytics
 * Get comprehensive AI business analytics
 */
async function handleGetAnalytics(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { period = '30' } = req.query; // days
  const days = parseInt(period as string);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 1. REVENUE: Credit top-ups purchased
  const revenueData = await prisma.aiAddonPurchase.groupBy({
    by: ['packType'],
    where: {
      createdAt: { gte: startDate },
    },
    _sum: {
      priceKobo: true,
      creditsAdded: true,
    },
    _count: true,
  });

  const totalRevenueKobo = revenueData.reduce(
    (sum, r) => sum + numKobo(r._sum?.priceKobo),
    0,
  );
  const totalCreditsSold = revenueData.reduce(
    (sum, r) => sum + (r._sum?.creditsAdded ?? 0),
    0,
  );

  // 2. COSTS: OpenRouter API usage costs (from aiUsageEvents)
  const costData = await prisma.aiUsageEvent.aggregate({
    where: {
      createdAt: { gte: startDate },
      success: true,
    },
    _sum: {
      costEstimateKobo: true,
      inputTokens: true,
      outputTokens: true,
      creditsUsed: true,
    },
    _count: {
      id: true,
    },
  });

  const totalCostKobo = numKobo(costData._sum.costEstimateKobo);
  const totalRequests = costData._count.id;
  const totalTokens = (costData._sum.inputTokens || 0) + (costData._sum.outputTokens || 0);
  const totalCreditsConsumed = costData._sum.creditsUsed || 0;

  // 3. PROFIT MARGINS
  const profitKobo = totalRevenueKobo - totalCostKobo;
  const profitMarginPercent = totalRevenueKobo > 0 
    ? Math.round((profitKobo / totalRevenueKobo) * 100) 
    : 0;

  // 4. USAGE TRENDS (daily breakdown)
  const dailyUsage = await prisma.aiUsageDaily.groupBy({
    by: ['date'],
    where: {
      date: { gte: startDate },
    },
    _sum: {
      tokensCount: true,
      requestsCount: true,
      costKobo: true,
    },
    orderBy: { date: 'asc' },
  });

  const trends = dailyUsage.map(day => ({
    date: day.date.toISOString().split('T')[0],
    tokens: day._sum.tokensCount || 0,
    requests: day._sum.requestsCount || 0,
    costKobo: numKobo(day._sum.costKobo),
  }));

  // 5. TOP SPENDING MERCHANTS
  const topMerchants = await prisma.aiUsageEvent.groupBy({
    by: ['storeId'],
    where: {
      createdAt: { gte: startDate },
      success: true,
    },
    _sum: {
      creditsUsed: true,
      costEstimateKobo: true,
    },
    orderBy: {
      _sum: {
        creditsUsed: 'desc',
      },
    },
    take: 10,
  });

  const topMerchantDetails = await Promise.all(
    topMerchants.map(async (merchant) => {
      const store = await prisma.store.findUnique({
        where: { id: merchant.storeId },
        select: { name: true, subscription: true },
      });

      return {
        storeId: merchant.storeId,
        storeName: store?.name || 'Unknown',
        planKey: store?.subscription?.planKey || 'unknown',
        creditsUsed: merchant._sum.creditsUsed || 0,
        costToServeKobo: numKobo(merchant._sum.costEstimateKobo),
      };
    })
  );

  // 6. MODEL BREAKDOWN (which models are most used/costly)
  const modelBreakdown = await prisma.aiUsageEvent.groupBy({
    by: ['model'],
    where: {
      createdAt: { gte: startDate },
      success: true,
    },
    _sum: {
      inputTokens: true,
      outputTokens: true,
      costEstimateKobo: true,
      creditsUsed: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        creditsUsed: 'desc',
      },
    },
  });

  const modelStats = modelBreakdown.map(m => ({
    model: m.model.split('/').pop() || m.model,
    requests: m._count.id,
    avgTokensPerRequest: Math.round(((m._sum.inputTokens || 0) + (m._sum.outputTokens || 0)) / m._count.id),
    totalCostKobo: numKobo(m._sum.costEstimateKobo),
    totalCredits: m._sum.creditsUsed || 0,
    marginPercent: calculateModelMargin(
      m.model,
      m._sum.creditsUsed || 0,
      numKobo(m._sum.costEstimateKobo),
    ),
  }));

  return res.status(200).json({
    success: true,
    data: {
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      revenue: {
        totalKobo: totalRevenueKobo,
        totalNaira: (totalRevenueKobo / 100).toFixed(2),
        creditsSold: totalCreditsSold,
        transactions: revenueData.reduce((sum, r) => sum + groupByCount(r), 0),
        breakdown: revenueData.map((r) => ({
          packType: r.packType,
          revenueKobo: numKobo(r._sum?.priceKobo),
          creditsSold: r._sum?.creditsAdded ?? 0,
          count: groupByCount(r),
        })),
      },
      costs: {
        totalKobo: totalCostKobo,
        totalNaira: (totalCostKobo / 100).toFixed(2),
        requests: totalRequests,
        tokens: totalTokens,
        creditsConsumed: totalCreditsConsumed,
        avgCostPerRequest: totalRequests > 0 ? Math.round(totalCostKobo / totalRequests) : 0,
        avgCostPerToken: totalTokens > 0 ? (totalCostKobo / totalTokens) : 0,
      },
      profit: {
        grossKobo: profitKobo,
        grossNaira: (profitKobo / 100).toFixed(2),
        marginPercent: profitMarginPercent,
        roi: totalCostKobo > 0 ? ((profitKobo / totalCostKobo) * 100).toFixed(2) : 0,
      },
      trends: {
        daily: trends,
        avgDailyRevenue: totalRevenueKobo / days,
        avgDailyCost: totalCostKobo / days,
      },
      topMerchants: topMerchantDetails,
      modelBreakdown: modelStats,
      insights: generateInsights({
        revenue: totalRevenueKobo,
        cost: totalCostKobo,
        profit: profitKobo,
        margin: profitMarginPercent,
        creditsSold: totalCreditsSold,
        creditsConsumed: totalCreditsConsumed,
      }),
    },
  });
}

/**
 * Calculate profit margin per model based on credit rate vs actual cost
 */
function calculateModelMargin(model: string, creditsUsed: number, costKobo: number): number {
  // Credit value: ₦3 per 1,000 credits average (₦3,000 / 1,000)
  const creditValueKobo = 3; // per credit
  
  const revenueFromCredits = creditsUsed * creditValueKobo;
  
  if (revenueFromCredits === 0) return 0;
  
  return Math.round(((revenueFromCredits - costKobo) / revenueFromCredits) * 100);
}

/**
 * Generate business insights from analytics data
 */
function generateInsights(data: {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  creditsSold: number;
  creditsConsumed: number;
}): string[] {
  const insights: string[] = [];

  // Profitability insights
  if (data.margin > 50) {
    insights.push('✅ Excellent profit margin - AI service is highly profitable');
  } else if (data.margin > 20) {
    insights.push('📊 Healthy profit margin - room for optimization');
  } else if (data.margin > 0) {
    insights.push('⚠️ Low profit margin - consider adjusting credit pricing');
  } else {
    insights.push('🚨 Operating at loss - immediate pricing review needed');
  }

  // Usage balance insights
  const creditBalance = data.creditsSold - data.creditsConsumed;
  if (creditBalance > 0) {
    insights.push(`💰 ${creditBalance.toLocaleString()} credits in circulation (future liability)`);
  } else {
    insights.push(`📈 High credit consumption - merchants using more than purchasing`);
  }

  // Growth insights
  if (data.revenue > data.cost * 2) {
    insights.push('🎯 Strong unit economics - scalable business model');
  }

  return insights;
}
