/**
 * Virtual Try-On Types (Fashion/Beauty)
 * Implementation Plan 3: Customer Experience & Marketing
 */

export type AssetType = 'makeup' | 'eyewear' | 'clothing' | 'jewelry' | 'hair';

export type OverlayPosition = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type ColorVariant = {
  color: string;
  assetUrl: string;
};

export interface VirtualTryOnAsset {
  id: string;
  storeId: string;
  productId: string;
  type: AssetType;
  assetUrl: string;
  thumbnailUrl: string;
  position: OverlayPosition;
  colorVariants: ColorVariant[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface TryOnSession {
  id: string;
  customerId: string | null;
  sessionId: string;
  productId: string;
  assetType: AssetType;
  snapshots: string[];
  shared: boolean;
  purchased: boolean;
  createdAt: Date;
}

export interface TryOnAnalytics {
  totalSessions: number;
  purchasedSessions: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    count: number;
  }>;
  recentSessions: TryOnSession[];
}

export interface CreateTryOnAssetInput {
  productId: string;
  type: AssetType;
  assetUrl: string;
  thumbnailUrl: string;
  position: OverlayPosition;
  colorVariants: ColorVariant[];
  isActive?: boolean;
}

export interface UpdateTryOnAssetInput {
  assetUrl?: string;
  thumbnailUrl?: string;
  position?: OverlayPosition;
  colorVariants?: ColorVariant[];
  isActive?: boolean;
}

export interface GenerateTryOnInput {
  customerId?: string;
  sessionId: string;
  productId: string;
  assetType: AssetType;
  snapshotUrl: string;
}
