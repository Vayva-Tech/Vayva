/**
 * WhatsApp Template Individual API Routes
 * GET /api/merchant/whatsapp/templates/[id] - Get template
 * PATCH /api/merchant/whatsapp/templates/[id] - Update template
 * DELETE /api/merchant/whatsapp/templates/[id] - Delete template
 */

import { NextResponse } from 'next/server';
import { withVayvaAPI, APIContext } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getWhatsAppBroadcastService } from '@/services/whatsapp-broadcast';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(['marketing', 'transactional', 'utility']).optional(),
  content: z.string().min(1).max(4000).optional(),
  variables: z.array(z.string()).optional(),
  mediaUrl: z.string().url().optional(),
});

// GET /api/merchant/whatsapp/templates/[id]
export const GET = withVayvaAPI(PERMISSIONS.MARKETING_VIEW, async (req: any, context: APIContext) => {
  try {
    const params = await context.params;
    const { id } = params;
    const service = getWhatsAppBroadcastService();
    const template = await service.getTemplate(id, context.user.storeId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    const params = await context.params;
    logger.error('[WHATSAPP_TEMPLATE_GET] Failed to fetch template', { storeId: context.user.storeId, id: params.id, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// PATCH /api/merchant/whatsapp/templates/[id]
export const PATCH = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (req: any, context: APIContext) => {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();

    const validated = updateTemplateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    const service = getWhatsAppBroadcastService();
    const template = await service.updateTemplate(id, context.user.storeId, validated.data);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    const params = await context.params;
    logger.error('[WHATSAPP_TEMPLATE_PATCH] Failed to update template', { storeId: context.user.storeId, id: params.id, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// DELETE /api/merchant/whatsapp/templates/[id]
export const DELETE = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (req: any, context: APIContext) => {
  try {
    const params = await context.params;
    const { id } = params;
    const service = getWhatsAppBroadcastService();
    const deleted = await service.deleteTemplate(id, context.user.storeId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const params = await context.params;
    logger.error('[WHATSAPP_TEMPLATE_DELETE] Failed to delete template', { storeId: context.user.storeId, id: params.id, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
