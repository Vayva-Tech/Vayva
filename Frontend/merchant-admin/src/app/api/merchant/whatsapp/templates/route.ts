/**
 * WhatsApp Template API Routes
 * POST /api/merchant/whatsapp/templates - Create template
 * GET /api/merchant/whatsapp/templates - List templates
 * PATCH /api/merchant/whatsapp/templates/:id - Update template
 * DELETE /api/merchant/whatsapp/templates/:id - Delete template
 */

import { NextRequest, NextResponse } from 'next/server';
import { withVayvaAPI } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getWhatsAppBroadcastService } from '@/services/whatsapp-broadcast';
import { z } from 'zod';
import { logger } from "@/lib/logger";

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['marketing', 'transactional', 'utility']),
  content: z.string().min(1).max(4000),
  variables: z.array(z.string()).optional(),
  mediaUrl: z.string().url().optional(),
});

// POST /api/merchant/whatsapp/templates
export const POST = withVayvaAPI(PERMISSIONS.MARKETING_MANAGE, async (req: NextRequest, { user }: { user: { id: string; storeId: string } }) => {
  try {
    const body = await req.json();

    const validated = templateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error?.format() },
        { status: 400 }
      );
    }

    const service = getWhatsAppBroadcastService();
    const template = await service.createTemplate(user.storeId, validated.data);

    return NextResponse.json({ success: true, template });
  } catch (error: unknown) {
    logger.error('[WHATSAPP_TEMPLATE_POST] Failed to create template', { storeId: user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// GET /api/merchant/whatsapp/templates
export const GET = withVayvaAPI(PERMISSIONS.MARKETING_VIEW, async (req: NextRequest, { user }: { user: { id: string; storeId: string } }) => {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as 'marketing' | 'transactional' | 'utility' | undefined;
    const isApproved = searchParams.get('isApproved');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const service = getWhatsAppBroadcastService();
    const templates = await service.listTemplates(user.storeId, {
      category,
      isApproved: isApproved === 'true' ? true : isApproved === 'false' ? false : undefined,
      limit,
      offset,
    });

    return NextResponse.json({ templates });
  } catch (error: unknown) {
    logger.error('[WHATSAPP_TEMPLATES_GET] Failed to fetch templates', { storeId: user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
