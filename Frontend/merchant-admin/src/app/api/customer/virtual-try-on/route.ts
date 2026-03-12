/**
 * Customer Virtual Try-On API Route
 * POST /api/customer/virtual-try-on/generate - Generate try-on image
 * GET /api/customer/virtual-try-on/sessions - Get customer try-on history
 */

import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { getVirtualTryOnService } from '@/services/virtual-try-on';
import { z } from 'zod';

const generateSchema = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  assetType: z.enum(['makeup', 'eyewear', 'clothing', 'jewelry', 'hair']),
  snapshotUrl: z.string().min(1),
});

// POST /api/customer/virtual-try-on/generate
export const POST = withVayvaAPI(null, async (req: any, context: any) => {
  try {
    const body = await req.json();

    const validated = generateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    const service = getVirtualTryOnService();
    const session = await service.generateTryOn(context.user.storeId, {
      customerId: context.user.id,
      ...validated.data,
    });

    return NextResponse.json({ success: true, session });
  } catch (error: unknown) {
    logger.error('[CUSTOMER_TRYON_GENERATE] Failed to generate try-on', { storeId: context.user.storeId, error });
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
});

// GET /api/customer/virtual-try-on/sessions
export const GET = withVayvaAPI(null, async (req: any, context: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const service = getVirtualTryOnService();
    const sessions = await service.getCustomerSessions(
      context.user.storeId,
      context.user.id,
      { limit, offset }
    );

    return NextResponse.json({ sessions });
  } catch (error: unknown) {
    logger.error('[CUSTOMER_TRYON_SESSIONS_GET] Failed to fetch sessions', { storeId: context.user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
