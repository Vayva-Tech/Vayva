/**
 * WhatsApp Broadcast API Routes
 * POST /api/merchant/whatsapp/broadcasts - Create broadcast
 * GET /api/merchant/whatsapp/broadcasts - List broadcasts
 * POST /api/merchant/whatsapp/broadcasts/:id/send - Send broadcast
 * POST /api/merchant/whatsapp/broadcasts/:id/cancel - Cancel scheduled broadcast
 */

import { NextRequest, NextResponse } from 'next/server';
import { withVayvaAPI } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getWhatsAppBroadcastService } from '@/services/whatsapp-broadcast';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const broadcastSchema = z.object({
  name: z.string().min(1).max(200),
  segmentId: z.string().optional(),
  templateId: z.string().optional(),
  content: z.string().min(1).max(4000),
  mediaUrl: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
});

// POST /api/merchant/whatsapp/broadcasts
export const POST = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (req: NextRequest, { user }: { user: { id: string; storeId: string } }) => {
  try {
    const body = await req.json();

    const validated = broadcastSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error?.format() },
        { status: 400 }
      );
    }

    const service = getWhatsAppBroadcastService();
    const broadcast = await service.createBroadcast(user.storeId, user.id, {
      ...validated.data,
      scheduledAt: validated.data?.scheduledAt ? new Date(validated.data?.scheduledAt) : undefined,
    });

    return NextResponse.json({ success: true, broadcast });
  } catch (error) {
    logger.error('[WHATSAPP_BROADCAST_POST] Failed to create broadcast', { storeId: user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// GET /api/merchant/whatsapp/broadcasts
export const GET = withVayvaAPI(PERMISSIONS.MARKETING_VIEW, async (req: NextRequest, { user }: { user: { id: string; storeId: string } }) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | undefined;
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const service = getWhatsAppBroadcastService();
    const broadcasts = await service.listBroadcasts(user.storeId, {
      status,
      limit,
      offset,
    });

    return NextResponse.json({ broadcasts });
  } catch (error) {
    logger.error('[WHATSAPP_BROADCASTS_GET] Failed to fetch broadcasts', { storeId: user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
