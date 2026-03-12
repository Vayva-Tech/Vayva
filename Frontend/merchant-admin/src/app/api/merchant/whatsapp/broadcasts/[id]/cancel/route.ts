/**
 * WhatsApp Broadcast Cancel API Route
 * POST /api/merchant/whatsapp/broadcasts/[id]/cancel - Cancel scheduled broadcast
 */

import { NextResponse } from 'next/server';
import { withVayvaAPI, APIContext } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getWhatsAppBroadcastService } from '@/services/whatsapp-broadcast';
import { logger } from "@/lib/logger";

// POST /api/merchant/whatsapp/broadcasts/[id]/cancel
export const POST = withVayvaAPI(
  PERMISSIONS.MARKETING_MANAGE,
  async (req: any, context: APIContext) => {
    try {
      const params = await context.params;
      const { id } = params;
      const service = getWhatsAppBroadcastService();
      const broadcast = await service.cancelBroadcast(id, context.user.storeId);

      if (!broadcast) {
        return NextResponse.json(
          { error: 'Broadcast not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, broadcast });
    } catch (error: unknown) {
      const params = await context.params;
      logger.error('[WHATSAPP_BROADCAST_CANCEL] Failed to cancel broadcast', { broadcastId: params.id, storeId: context.user.storeId, error });
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }
);
