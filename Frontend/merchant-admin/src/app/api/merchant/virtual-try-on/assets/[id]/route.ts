/**
 * Virtual Try-On Asset Individual API Routes
 * GET /api/merchant/virtual-try-on/assets/[id] - Get asset
 * PATCH /api/merchant/virtual-try-on/assets/[id] - Update asset
 * DELETE /api/merchant/virtual-try-on/assets/[id] - Delete asset
 */

import { NextResponse } from 'next/server';
import { withVayvaAPI } from '@/lib/api-handler';
import { PERMISSIONS } from '@/lib/team/permissions';
import { getVirtualTryOnService } from '@/services/virtual-try-on';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const updateAssetSchema = z.object({
  assetUrl: z.string().min(1).optional(),
  thumbnailUrl: z.string().min(1).optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
      scale: z.number(),
      rotation: z.number(),
    })
    .optional(),
  colorVariants: z
    .array(
      z.object({
        color: z.string().min(1),
        assetUrl: z.string().min(1),
      })
    )
    .optional(),
  isActive: z.boolean().optional(),
});

// GET /api/merchant/virtual-try-on/assets/[id]
export const GET = withVayvaAPI(PERMISSIONS.PRODUCTS_VIEW, async (req: any, context: any) => {
  try {
    const params = await context.params;
    const { id } = params;
    const service = getVirtualTryOnService();
    const asset = await service.getAsset(id, context.user.storeId);

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ asset });
  } catch (error) {
    const params = await context.params;
    logger.error('[VIRTUAL_TRYON_ASSET_GET] Failed to fetch asset', { storeId: context.user.storeId, id: params.id, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// PATCH /api/merchant/virtual-try-on/assets/[id]
export const PATCH = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: any, context: any) => {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();

    const validated = updateAssetSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    const service = getVirtualTryOnService();
    const asset = await service.updateAsset(id, context.user.storeId, validated.data);

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    const params = await context.params;
    logger.error('[VIRTUAL_TRYON_ASSET_PATCH] Failed to update asset', { storeId: context.user.storeId, id: params.id, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// DELETE /api/merchant/virtual-try-on/assets/[id]
export const DELETE = withVayvaAPI(PERMISSIONS.PRODUCTS_MANAGE, async (req: any, context: any) => {
  try {
    const params = await context.params;
    const { id } = params;
    const service = getVirtualTryOnService();
    const deleted = await service.deleteAsset(id, context.user.storeId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const params = await context.params;
    logger.error('[VIRTUAL_TRYON_ASSET_DELETE] Failed to delete asset', { storeId: context.user.storeId, id: params.id, error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
