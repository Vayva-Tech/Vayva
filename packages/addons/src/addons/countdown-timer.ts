/**
 * Countdown Timer Add-On
 * 
 * Urgency-building countdown for sales and events
 */

import { AddOnDefinition } from '../../types';

export const COUNTDOWN_TIMER_ADDON: AddOnDefinition = {
  id: 'vayva.countdown-timer',
  name: 'Countdown Timer',
  description: 'Create urgency with beautiful countdown timers for flash sales, product launches, and limited-time offers',
  tagline: 'Boost conversions with urgency timers',
  version: '1.0.0',
  category: 'marketing',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Timer',
  tags: ['timer', 'countdown', 'urgency', 'sales', 'flash-sale', 'marketing'],
  compatibleTemplates: ['*'],
  mountPoints: ['hero-section', 'product-detail', 'floating-button', 'below-fold'],
  previewImages: {
    thumbnail: '/addons/countdown-timer/thumbnail.png',
    screenshots: ['/addons/countdown-timer/screenshot-1.png'],
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
    installCount: 6700,
    rating: 4.6,
    reviewCount: 289,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    components: [
      { mountPoint: 'hero-section', componentName: 'CountdownBanner' },
      { mountPoint: 'product-detail', componentName: 'FlashSaleTimer' },
      { mountPoint: 'floating-button', componentName: 'StickyTimer' },
    ],
    apiRoutes: [
      { path: '/api/countdown', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
    databaseModels: ['CountdownCampaign'],
  },
  highlights: [
    'Multiple timer styles',
    'Flash sale campaigns',
    'Product launch timers',
    'Evergreen urgency',
    'Mobile-optimized',
  ],
  installTimeEstimate: 2,
};

export const COUNTDOWN_TIMER_MODELS = `
model CountdownCampaign {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  type        CountdownType
  endDate     DateTime
  timezone    String   @default("Africa/Lagos")
  style       String   @default("modern")
  message     String?
  buttonText  String?
  buttonLink  String?
  targetProducts String[]
  targetCollections String[]
  discountCode String?
  isActive    Boolean  @default(true)
  showDays    Boolean  @default(true)
  showHours   Boolean  @default(true)
  showMinutes Boolean  @default(true)
  showSeconds Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isActive])
  @@index([endDate])
}

enum CountdownType {
  FLASH_SALE
  PRODUCT_LAUNCH
  LIMITED_OFFER
  EVENT
  CUSTOM
}
`;

export default COUNTDOWN_TIMER_ADDON;
