/**
 * Inventory Counter Add-On
 * 
 * Real-time stock counter display for urgency
 */

import { AddOnDefinition } from '../../types';

export const INVENTORY_COUNTER_ADDON: AddOnDefinition = {
  id: 'vayva.inventory-counter',
  name: 'Inventory Counter',
  description: 'Display real-time stock levels with urgency messaging to drive faster purchase decisions',
  tagline: 'Only 3 left!',
  version: '1.0.0',
  category: 'ecommerce',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Package',
  tags: ['inventory', 'urgency', 'scarcity', 'stock', 'conversion'],
  compatibleTemplates: ['retail', 'fashion', 'electronics', 'marketplace'],
  mountPoints: ['product-detail', 'product-card', 'checkout-summary'],
  previewImages: {
    thumbnail: '/addons/inventory-counter/thumbnail.png',
    screenshots: ['/addons/inventory-counter/screenshot-1.png'],
  },
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  pricing: {
    type: 'free',
  },
  stats: {
    installCount: 3500,
    rating: 4.5,
    reviewCount: 89,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    components: [
      { mountPoint: 'product-detail', componentName: 'StockCounter' },
      { mountPoint: 'product-card', componentName: 'LowStockBadge' },
      { mountPoint: 'checkout-summary', componentName: 'StockWarning' },
    ],
    apiRoutes: [
      { path: '/api/inventory/stock', methods: ['GET'] },
      { path: '/api/inventory/reserve', methods: ['POST'] },
    ],
    databaseModels: ['StockReservation'],
  },
  highlights: [
    'Real-time counts',
    'Low stock alerts',
    'Reserve at checkout',
    'Urgency messaging',
    'Inventory sync',
  ],
  installTimeEstimate: 2,
};

export const INVENTORY_COUNTER_MODELS = `
model StockReservation {
  id          String   @id @default(cuid())
  storeId     String
  productId   String
  variantId   String?
  quantity    Int
  sessionId   String?
  customerId  String?
  cartId      String?
  expiresAt   DateTime
  status      ReservationStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  
  @@index([storeId, productId, variantId])
  @@index([sessionId, status])
  @@index([customerId, status])
  @@index([expiresAt])
}

enum ReservationStatus {
  ACTIVE
  CONVERTED
  EXPIRED
  CANCELLED
}
`;

export default INVENTORY_COUNTER_ADDON;
