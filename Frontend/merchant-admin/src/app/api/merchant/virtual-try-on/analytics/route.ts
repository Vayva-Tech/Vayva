/**
 * Virtual Try-On Analytics API Route
 * GET /api/merchant/virtual-try-on/analytics - Get try-on analytics
 */

import { NextResponse } from 'next/server';
import { withVayvaAPI } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getVirtualTryOnService } from '@/services/virtual-try-on';
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(PERMISSIONS.ANALYTICS_VIEW, async (req: any, context: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const service = getVirtualTryOnService();
    const analytics = await service.getTryOnAnalytics(context.user.storeId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    logger.error('[VIRTUAL_TRYON_ANALYTICS_GET] Failed to fetch analytics', { storeId: context.user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
