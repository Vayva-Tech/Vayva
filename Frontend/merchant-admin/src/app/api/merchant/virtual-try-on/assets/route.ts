/**
 * Virtual Try-On Asset API Routes
 * POST /api/merchant/virtual-try-on/assets - Create asset
 * GET /api/merchant/virtual-try-on/assets - List assets
 * PATCH /api/merchant/virtual-try-on/assets/:id - Update asset
 * DELETE /api/merchant/virtual-try-on/assets/:id - Delete asset
 */

import { NextResponse } from 'next/server';
import { withVayvaAPI } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getVirtualTryOnService } from '@/services/virtual-try-on';
import { z } from 'zod';
import { logger } from "@/lib/logger";

const assetSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(['makeup', 'eyewear', 'clothing', 'jewelry', 'hair']),
  assetUrl: z.string().min(1),
  thumbnailUrl: z.string().min(1),
  position: z.object({
    x: z.number(),
    y: z.number(),
    scale: z.number(),
    rotation: z.number(),
  }),
  colorVariants: z.array(
    z.object({
      color: z.string().min(1),
      assetUrl: z.string().min(1),
    })
  ),
  isActive: z.boolean().optional(),
});

// POST /api/merchant/virtual-try-on/assets
export const POST = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: any, context: any) => {
  try {
    const body = await req.json();

    const validated = assetSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    const service = getVirtualTryOnService();
    const asset = await service.createAsset(context.user.storeId, validated.data);

    return NextResponse.json({ success: true, asset });
  } catch (error: unknown) {
    logger.error('[VIRTUAL_TRYON_ASSET_POST] Failed to create asset', { storeId: context.user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// GET /api/merchant/virtual-try-on/assets
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: any, context: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') ?? undefined;
    const type = searchParams.get('type') as 'makeup' | 'eyewear' | 'clothing' | 'jewelry' | 'hair' | undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive =
      isActiveParam === null
        ? undefined
        : isActiveParam === 'true'
          ? true
          : isActiveParam === 'false'
            ? false
            : undefined;
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const service = getVirtualTryOnService();
    const assets = await service.listAssets(context.user.storeId, {
      productId,
      type,
      isActive,
      limit,
      offset,
    });

    return NextResponse.json({ assets });
  } catch (error: unknown) {
    logger.error('[VIRTUAL_TRYON_ASSETS_GET] Failed to fetch assets', { storeId: context.user.storeId, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
