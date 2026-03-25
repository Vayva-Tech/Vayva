/**
 * Virtual Tour Add-On
 * 
 * 3D property tours for real estate
 */

import type { AddOnDefinition } from '../../types';

export const VIRTUAL_TOUR_ADDON: AddOnDefinition = {
  id: 'vayva.virtual-tour',
  name: 'Virtual Tour',
  description: 'Interactive 3D property tours using Matterport-style technology for immersive property viewing',
  tagline: 'Walk through properties from anywhere',
  version: '1.0.0',
  category: 'storefront',
  price: 5000,
  isFree: false,
  developer: 'Vayva',
  icon: 'View',
  tags: ['real-estate', '3d', 'virtual', 'tour', 'property'],
  compatibleTemplates: ['realestate', 'property', 'rentals'],
  mountPoints: ['hero-section', 'product-detail'],
  previewImages: {
    thumbnail: '/addons/virtual-tour/thumbnail.png',
    screenshots: ['/addons/virtual-tour/screenshot-1.png'],
  },
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  pricing: {
    type: 'one-time',
    amount: 5000,
  },
  stats: {
    installCount: 450,
    rating: 4.8,
    reviewCount: 23,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    components: [
      { mountPoint: 'hero-section', componentName: 'VirtualTourHero' },
      { mountPoint: 'product-detail', componentName: 'TourEmbed' },
    ],
    apiRoutes: [
      { path: '/api/virtual-tour/embed', methods: ['GET'] },
      { path: '/api/virtual-tour/analytics', methods: ['POST'] },
    ],
    databaseModels: ['VirtualTour', 'TourAnalytics'],
  },
  highlights: [
    '3D walkthroughs',
    'Matterport integration',
    'Tour analytics',
    'Mobile-friendly',
    'VR headset support',
  ],
  installTimeEstimate: 5,
};

export const VIRTUAL_TOUR_MODELS = `
model VirtualTour {
  id          String   @id @default(cuid())
  storeId     String
  propertyId  String
  provider    String   @default("matterport")
  embedUrl    String
  thumbnail   String?
  isActive    Boolean  @default(true)
  analytics   TourAnalytics[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, propertyId])
  @@index([isActive])
}

model TourAnalytics {
  id          String   @id @default(cuid())
  tourId      String
  tour        VirtualTour @relation(fields: [tourId], references: [id], onDelete: Cascade)
  sessionId   String
  customerId  String?
  startTime   DateTime @default(now())
  endTime     DateTime?
  duration    Int?     // seconds
  hotspots    String[] // IDs of hotspots visited
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  @@index([tourId, createdAt])
  @@index([customerId])
}
`;

export default VIRTUAL_TOUR_ADDON;
