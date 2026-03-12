/**
 * Virtual Try-On Service
 * Implementation Plan 3: Customer Experience & Marketing
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@vayva/db';
import type {
  VirtualTryOnAsset,
  TryOnSession,
  TryOnAnalytics,
  AssetType,
  CreateTryOnAssetInput,
  UpdateTryOnAssetInput,
  GenerateTryOnInput,
} from '@/types/virtual-try-on';

type VirtualTryOnAssetDb = Prisma.VirtualTryOnAssetGetPayload<Record<string, never>>;
type TryOnSessionDb = Prisma.TryOnSessionGetPayload<Record<string, never>>;

export class VirtualTryOnService {
  // ==================== ASSET MANAGEMENT ====================

  async createAsset(
    storeId: string,
    data: CreateTryOnAssetInput
  ): Promise<VirtualTryOnAsset> {
    const asset = await prisma.virtualTryOnAsset.create({
      data: {
        storeId,
        productId: data.productId,
        type: data.type,
        assetUrl: data.assetUrl,
        thumbnailUrl: data.thumbnailUrl,
        position: data.position as unknown as Prisma.InputJsonValue,
        colorVariants: data.colorVariants as unknown as Prisma.InputJsonValue,
        isActive: data.isActive ?? true,
        usageCount: 0,
      },
    });

    return this.mapAsset(asset);
  }

  async updateAsset(
    assetId: string,
    storeId: string,
    data: UpdateTryOnAssetInput
  ): Promise<VirtualTryOnAsset | null> {
    const existing = await prisma.virtualTryOnAsset.findFirst({
      where: { id: assetId, storeId },
    });

    if (!existing) return null;

    const asset = await prisma.virtualTryOnAsset.update({
      where: { id: assetId },
      data: {
        ...(data.assetUrl !== undefined && { assetUrl: data.assetUrl }),
        ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
        ...(data.position !== undefined &&
          ({ position: data.position as unknown as Prisma.InputJsonValue } as const)),
        ...(data.colorVariants !== undefined &&
          ({ colorVariants: data.colorVariants as unknown as Prisma.InputJsonValue } as const)),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return this.mapAsset(asset);
  }

  async deleteAsset(assetId: string, storeId: string): Promise<boolean> {
    const existing = await prisma.virtualTryOnAsset.findFirst({
      where: { id: assetId, storeId },
    });

    if (!existing) return false;

    await prisma.virtualTryOnAsset.delete({
      where: { id: assetId },
    });

    return true;
  }

  async getAsset(
    assetId: string,
    storeId: string
  ): Promise<VirtualTryOnAsset | null> {
    const asset = await prisma.virtualTryOnAsset.findFirst({
      where: { id: assetId, storeId },
    });

    if (!asset) return null;
    return this.mapAsset(asset);
  }

  async listAssets(
    storeId: string,
    options?: {
      productId?: string;
      type?: AssetType;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<VirtualTryOnAsset[]> {
    const assets = await prisma.virtualTryOnAsset.findMany({
      where: {
        storeId,
        ...(options?.productId && { productId: options.productId }),
        ...(options?.type && { type: options.type }),
        ...(options?.isActive !== undefined && { isActive: options.isActive }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });

    return assets.map((a) => this.mapAsset(a));
  }

  // ==================== TRY-ON SESSIONS ====================

  async getSessionBySessionId(sessionId: string): Promise<TryOnSession | null> {
    const session = await prisma.tryOnSession.findUnique({
      where: { sessionId },
    });
    if (!session) return null;
    return this.mapSession(session);
  }

  async getCustomerSessions(
    storeId: string,
    customerId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<TryOnSession[]> {
    const productIds = await this.getStoreProductIds(storeId);
    if (productIds.length === 0) return [];

    const sessions = await prisma.tryOnSession.findMany({
      where: {
        customerId,
        productId: { in: productIds },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });

    return sessions.map((s) => this.mapSession(s));
  }

  // ==================== TRY-ON GENERATION ====================

  async generateTryOn(
    storeId: string,
    data: GenerateTryOnInput
  ): Promise<TryOnSession> {
    const asset = await prisma.virtualTryOnAsset.findFirst({
      where: {
        storeId,
        productId: data.productId,
        type: data.assetType,
        isActive: true,
      },
    });

    if (!asset) {
      throw new Error('Virtual try-on asset not found for product/type');
    }

    // Upsert session by unique sessionId
    const existing = await prisma.tryOnSession.findUnique({
      where: { sessionId: data.sessionId },
    });

    const session = existing
      ? await prisma.tryOnSession.update({
          where: { sessionId: data.sessionId },
          data: {
            customerId: data.customerId ?? existing.customerId,
            productId: data.productId,
            assetType: data.assetType,
            snapshots: { push: data.snapshotUrl },
          },
        })
      : await prisma.tryOnSession.create({
          data: {
            customerId: data.customerId ?? null,
            sessionId: data.sessionId,
            productId: data.productId,
            assetType: data.assetType,
            snapshots: [data.snapshotUrl],
            shared: false,
            purchased: false,
          },
        });

    // Increment usage count for the asset
    await prisma.virtualTryOnAsset.update({
      where: { id: asset.id },
      data: { usageCount: { increment: 1 } },
    });

    return this.mapSession(session);
  }

  // ==================== ANALYTICS ====================

  async getTryOnAnalytics(
    storeId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<TryOnAnalytics> {
    const productIds = await this.getStoreProductIds(storeId);
    if (productIds.length === 0) {
      return {
        totalSessions: 0,
        purchasedSessions: 0,
        conversionRate: 0,
        topProducts: [],
        recentSessions: [],
      };
    }

    const createdAtFilter = options?.startDate || options?.endDate
      ? {
          createdAt: {
            ...(options?.startDate ? { gte: options.startDate } : {}),
            ...(options?.endDate ? { lte: options.endDate } : {}),
          },
        }
      : {};

    const [
      totalSessions,
      purchasedSessions,
      topProducts,
      recentSessions,
    ] = await Promise.all([
      // Total sessions
      prisma.tryOnSession.count({
        where: {
          productId: { in: productIds },
          ...createdAtFilter,
        },
      }),

      // Purchased sessions
      prisma.tryOnSession.count({
        where: {
          productId: { in: productIds },
          purchased: true,
          ...createdAtFilter,
        },
      }),

      // Top products with try-ons
      prisma.tryOnSession.groupBy({
        by: ['productId'],
        where: {
          productId: { in: productIds },
          ...createdAtFilter,
        },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
      }),

      // Recent completed sessions
      prisma.tryOnSession.findMany({
        where: {
          productId: { in: productIds },
          ...createdAtFilter,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const conversionRate =
      totalSessions > 0 ? (purchasedSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      purchasedSessions,
      conversionRate,
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        count: p._count.productId,
      })),
      recentSessions: recentSessions.map((s) => this.mapSession(s)),
    };
  }

  private async getStoreProductIds(storeId: string): Promise<string[]> {
    const rows = await prisma.virtualTryOnAsset.findMany({
      where: { storeId },
      select: { productId: true },
      distinct: ['productId'],
    });

    return rows.map((r) => r.productId);
  }

  // ==================== PRIVATE HELPERS ====================

  private mapAsset(asset: VirtualTryOnAssetDb): VirtualTryOnAsset {
    return {
      id: asset.id,
      storeId: asset.storeId,
      productId: asset.productId,
      type: asset.type as AssetType,
      assetUrl: asset.assetUrl,
      thumbnailUrl: asset.thumbnailUrl,
      position: asset.position as unknown as VirtualTryOnAsset['position'],
      colorVariants: asset.colorVariants as unknown as VirtualTryOnAsset['colorVariants'],
      isActive: asset.isActive,
      usageCount: asset.usageCount,
      createdAt: asset.createdAt,
    };
  }

  private mapSession(session: TryOnSessionDb): TryOnSession {
    return {
      id: session.id,
      customerId: session.customerId,
      sessionId: session.sessionId,
      productId: session.productId,
      assetType: session.assetType as AssetType,
      snapshots: session.snapshots,
      shared: session.shared,
      purchased: session.purchased,
      createdAt: session.createdAt,
    };
  }
}

// Singleton instance
let tryOnService: VirtualTryOnService | null = null;

export function getVirtualTryOnService(): VirtualTryOnService {
  if (!tryOnService) {
    tryOnService = new VirtualTryOnService();
  }
  return tryOnService;
}
