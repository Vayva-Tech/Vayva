/**
 * Kitchen Display Add-On
 * 
 * Kitchen display system for restaurant order management
 */

import type { AddOnDefinition } from '../../types';

export const KITCHEN_DISPLAY_ADDON: AddOnDefinition = {
  id: 'vayva.kitchen-display',
  name: 'Kitchen Display System',
  description: 'Digital kitchen display system (KDS) for managing orders, prep times, and order status updates',
  tagline: 'Streamline your kitchen operations',
  version: '1.0.0',
  category: 'operations',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Monitor',
  tags: ['kitchen', 'restaurant', 'kds', 'operations', 'orders'],
  compatibleTemplates: ['food', 'restaurant'],
  mountPoints: [],
  previewImages: {
    thumbnail: '/addons/kitchen-display/thumbnail.png',
    screenshots: ['/addons/kitchen-display/screenshot-1.png'],
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
    installCount: 1800,
    rating: 4.8,
    reviewCount: 98,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/kitchen-display', title: 'Kitchen Display' },
      { route: '/kitchen-display/orders', title: 'Order Queue' },
    ],
    apiRoutes: [
      { path: '/api/kitchen/orders', methods: ['GET', 'PUT'] },
      { path: '/api/kitchen/status', methods: ['POST'] },
    ],
    databaseModels: ['KitchenOrder', 'KitchenStation'],
  },
  highlights: [
    'Real-time order queue',
    'Prep time tracking',
    'Course management',
    'Bumping system',
    'Multi-station support',
  ],
  installTimeEstimate: 3,
};

export const KITCHEN_DISPLAY_MODELS = `
model KitchenOrder {
  id          String   @id @default(cuid())
  orderId     String   @unique
  storeId     String
  items       Json[]
  course      CourseType
  station     String?
  priority    Int      @default(0)
  status      KitchenStatus @default(PENDING)
  prepTime    Int?     // seconds
  notes       String?
  firedAt     DateTime?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, status])
  @@index([station])
}

model KitchenStation {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  printerIp   String?
  displayId   String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId])
}

enum CourseType {
  STARTER
  MAIN
  DESSERT
  BEVERAGE
  SIDE
  ALL
}

enum KitchenStatus {
  PENDING
  FIRED
  PREPARING
  READY
  SERVED
  CANCELLED
}
`;

export default KITCHEN_DISPLAY_ADDON;
