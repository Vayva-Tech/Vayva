/**
 * WhatsApp Broadcast Analytics API Route
 * GET /api/merchant/whatsapp/analytics - Get broadcast analytics
 */

import { NextResponse } from 'next/server';
import { logger } from "@/lib/logger";
import { withVayvaAPI, APIContext } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getWhatsAppBroadcastService } from '@/services/whatsapp-broadcast';

export const GET = withVayvaAPI(PERMISSIONS.MARKETING_VIEW, async (req: any, context: APIContext) => {
  try {
    const service = getWhatsAppBroadcastService();
    const analytics = await service.getBroadcastAnalytics(context.user.storeId);

    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    logger.error('[WHATSAPP_ANALYTICS_GET] Failed to fetch analytics', { storeId: context.user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
