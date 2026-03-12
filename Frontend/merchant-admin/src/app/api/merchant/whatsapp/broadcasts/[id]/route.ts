/**
 * WhatsApp Broadcast Individual API Routes
 * GET /api/merchant/whatsapp/broadcasts/[id] - Get broadcast
 * PATCH /api/merchant/whatsapp/broadcasts/[id] - Update broadcast
 * DELETE /api/merchant/whatsapp/broadcasts/[id] - Delete broadcast
 */

import { NextResponse } from 'next/server';
import { withVayvaAPI, APIContext } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getWhatsAppBroadcastService } from '@/services/whatsapp-broadcast';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const updateBroadcastSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  segmentId: z.string().optional(),
  templateId: z.string().optional(),
  content: z.string().min(1).max(4000).optional(),
  mediaUrl: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
});

// GET /api/merchant/whatsapp/broadcasts/[id]
export const GET = withVayvaAPI(PERMISSIONS.MARKETING_VIEW, async (req: any, context: APIContext) => {
  try {
    const params = await context.params;
    const { id } = params;
    const service = getWhatsAppBroadcastService();
    const broadcast = await service.getBroadcast(id, context.user.storeId);

    if (!broadcast) {
      return NextResponse.json(
        { error: 'Broadcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ broadcast });
  } catch (error: unknown) {
    const params = await context.params;
    logger.error('[WHATSAPP_BROADCAST_GET] Failed to fetch broadcast', { storeId: context.user.storeId, broadcastId: params.id, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// PATCH /api/merchant/whatsapp/broadcasts/[id]
export const PATCH = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (req: any, context: APIContext) => {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();

    const validated = updateBroadcastSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    const service = getWhatsAppBroadcastService();
    const broadcast = await service.updateBroadcast(
      id,
      context.user.storeId,
      {
        ...validated.data,
        scheduledAt: validated.data.scheduledAt ? new Date(validated.data.scheduledAt) : undefined,
      }
    );

    if (!broadcast) {
      return NextResponse.json(
        { error: 'Broadcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, broadcast });
  } catch (error) {
    const params = await context.params;
    logger.error('[WHATSAPP_BROADCAST_PATCH] Failed to update broadcast', { storeId: context.user.storeId, id: params.id, error });
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
});

// DELETE /api/merchant/whatsapp/broadcasts/[id]
export const DELETE = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (req: any, context: APIContext) => {
  try {
    const params = await context.params;
    const { id } = params;
    const service = getWhatsAppBroadcastService();
    const deleted = await service.deleteBroadcast(id, context.user.storeId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Broadcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const params = await context.params;
    logger.error('[WHATSAPP_BROADCAST_DELETE] Failed to delete broadcast', { storeId: context.user.storeId, id: params.id, error });
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
});
