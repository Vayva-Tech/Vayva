/**
 * Recently Viewed Add-On
 * 
 * Display products customers have recently viewed
 */

import { AddOnDefinition } from '../../types';

export const RECENTLY_VIEWED_ADDON: AddOnDefinition = {
  id: 'vayva.recently-viewed',
  name: 'Recently Viewed',
  description: 'Show customers products they recently viewed to help them return and complete purchases',
  tagline: 'Pick up where you left off',
  version: '1.0.0',
  category: 'marketing',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'History',
  tags: ['retention', 'conversion', 'personalization', 'browsing'],
  compatibleTemplates: ['retail', 'fashion', 'electronics', 'marketplace'],
  mountPoints: ['page-footer', 'product-detail'],
  previewImages: {
    thumbnail: '/addons/recently-viewed/thumbnail.png',
    screenshots: ['/addons/recently-viewed/screenshot-1.png'],
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
    installCount: 4200,
    rating: 4.6,
    reviewCount: 112,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    components: [
      { mountPoint: 'page-footer', componentName: 'RecentlyViewedStrip' },
      { mountPoint: 'product-detail', componentName: 'BrowsingHistory' },
    ],
    apiRoutes: [
      { path: '/api/products/recently-viewed', methods: ['GET', 'POST'] },
    ],
    databaseModels: ['ProductView'],
  },
  highlights: [
    'Session history',
    'Cross-device sync',
    'Smart recommendations',
    'Customizable display',
    'Privacy controls',
  ],
  installTimeEstimate: 2,
};

export const RECENTLY_VIEWED_MODELS = `
model ProductView {
  id          String   @id @default(cuid())
  storeId     String
  productId   String
  customerId  String?
  sessionId   String?
  viewedAt    DateTime @default(now())
  source      String?  // search, category, recommendation, direct
  
  @@index([storeId, customerId, viewedAt])
  @@index([storeId, sessionId, viewedAt])
  @@index([productId])
}
`;

export default RECENTLY_VIEWED_ADDON;
