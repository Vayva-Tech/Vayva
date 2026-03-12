/**
 * Referral Analytics API Route
 * GET /api/merchant/referrals/analytics - Get referral program analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@/lib/logger";
import { withVayvaAPI } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getReferralService } from '@/services/referral';

export const GET = withVayvaAPI(PERMISSIONS.SETTINGS_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const service = getReferralService();
    const analytics = await service.getReferralAnalytics(storeId);

    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    logger.error('[REFERRAL_ANALYTICS_GET] Failed to fetch analytics', { storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
