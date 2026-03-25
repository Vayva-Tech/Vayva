/**
 * Client Logos Add-On
 * 
 * Showcase of trusted client and partner logos
 */

import type { AddOnDefinition } from '../../types';

export const CLIENT_LOGOS_ADDON: AddOnDefinition = {
  id: 'vayva.client-logos',
  name: 'Client Logos',
  description: 'Elegant client and partner logo showcase with hover effects, categories, and social proof enhancement',
  tagline: 'Trusted by the best',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Users',
  tags: ['creative', 'clients', 'logos', 'social-proof', 'partners'],
  compatibleTemplates: ['creative', 'portfolio', 'designer', 'agency', 'freelancer'],
  mountPoints: ['hero-section', 'footer-section'],
  previewImages: {
    thumbnail: '/addons/client-logos/thumbnail.png',
    screenshots: ['/addons/client-logos/screenshot-1.png'],
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
    installCount: 680,
    rating: 4.5,
    reviewCount: 58,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/clients', title: 'Clients' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'ClientLogoGrid' },
      { mountPoint: 'footer-section', componentName: 'TrustedByStrip' },
    ],
    apiRoutes: [
      { path: '/api/clients', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
    databaseModels: ['ClientLogo', 'ClientCategory'],
  },
  highlights: [
    'Logo gallery',
    'Hover effects',
    'Category filtering',
    'Grayscale to color',
    'Click analytics',
  ],
  installTimeEstimate: 2,
};

export const CLIENT_LOGOS_MODELS = `
model ClientLogo {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  slug        String
  logoUrl     String
  logoWhiteUrl String? // for dark backgrounds
  website     String?
  categoryId  String?
  description String?
  testimonialId String?
  industry    String?
  location    String?
  isFeatured  Boolean  @default(false)
  isPublished Boolean  @default(false)
  sortOrder   Int      @default(0)
  clickCount  Int      @default(0)
  projectCount Int     @default(0)
  partnershipStart DateTime?
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
  @@index([storeId, isPublished, isFeatured])
  @@index([categoryId, sortOrder])
}

model ClientCategory {
  id          String   @id @default(cuid())
  storeId     String
  slug        String
  name        String
  description String?
  icon        String?
  color       String?
  sortOrder   Int      @default(0)
  clientCount Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
}
`;

export default CLIENT_LOGOS_ADDON;
