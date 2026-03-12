import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/nightlife/promoters
 * Get promoter performance data
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const date = searchParams.get('date');

    const where: Record<string, unknown> = {};
    if (eventId) where.eventId = eventId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      where.date = { gte: startOfDay, lt: endOfDay };
    }

    const sales = await (prisma as any).promoterSale?.findMany({
      where,
      orderBy: [{ barRevenue: 'desc' }],
    });

    // Group by promoter
    const byPromoter: Record<string, any> = {};
    sales?.forEach((sale: any) => {
      if (!byPromoter[sale.promoterId]) {
        byPromoter[sale.promoterId] = {
          promoterId: sale.promoterId,
          promoterName: sale.promoterName,
          guestCount: 0,
          barRevenue: 0,
          commissionAmount: 0,
        };
      }
      byPromoter[sale.promoterId].guestCount += sale.guestCount;
      byPromoter[sale.promoterId].barRevenue += sale.barRevenue;
      byPromoter[sale.promoterId].commissionAmount += sale.commissionAmount;
    });

    const topPromoters = Object.values(byPromoter).sort(
      (a: any, b: any) => b.barRevenue - a.barRevenue
    );

    const stats = {
      totalGuests: sales?.reduce((sum: number, s: any) => sum + s.guestCount, 0) || 0,
      totalBarRevenue: sales?.reduce((sum: number, s: any) => sum + s.barRevenue, 0) || 0,
      totalCommissions: sales?.reduce((sum: number, s: any) => sum + s.commissionAmount, 0) || 0,
    };

    return NextResponse.json({
      sales: sales || [],
      topPromoters,
      stats,
    });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_PROMOTERS_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to fetch promoter data' },
      { status: 500 }
    );
  }
}
