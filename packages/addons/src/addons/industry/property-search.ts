/**
 * Real Estate Property Search Add-On
 * 
 * Advanced property search with filters, map view, and saved searches
 */

import { AddOnDefinition } from '../../types';

export const PROPERTY_SEARCH_ADDON: AddOnDefinition = {
  id: 'vayva.property-search',
  name: 'Property Search',
  description: 'Advanced real estate search with filters, map integration, saved searches, and property alerts',
  tagline: 'Find the perfect property',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Building2',
  tags: ['real-estate', 'property', 'search', 'listings', 'filters'],
  compatibleTemplates: ['realestate', 'property', 'rentals'],
  mountPoints: ['hero-section', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/property-search/thumbnail.png',
    screenshots: ['/addons/property-search/screenshot-1.png'],
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
    installCount: 1200,
    rating: 4.6,
    reviewCount: 67,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/properties', title: 'Property Listings' },
      { route: '/properties/search', title: 'Search Properties' },
      { route: '/properties/map', title: 'Map View' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'PropertySearchHero' },
      { mountPoint: 'page-sidebar', componentName: 'PropertyFilters' },
    ],
    apiRoutes: [
      { path: '/api/properties', methods: ['GET', 'POST'] },
      { path: '/api/properties/search', methods: ['GET', 'POST'] },
      { path: '/api/properties/filters', methods: ['GET'] },
    ],
    databaseModels: ['PropertySearch', 'SavedSearch', 'PropertyAlert'],
  },
  highlights: [
    'Advanced filters',
    'Map integration',
    'Saved searches',
    'Email alerts',
    'Price tracking',
  ],
  installTimeEstimate: 3,
};

export const PROPERTY_SEARCH_MODELS = `
model PropertySearch {
  id          String   @id @default(cuid())
  storeId     String
  visitorId   String?
  customerId  String?
  query       String?
  filters     Json?
  location    String?
  minPrice    Decimal? @db.Decimal(12, 2)
  maxPrice    Decimal? @db.Decimal(12, 2)
  propertyType  String[]
  bedrooms    Int?
  bathrooms   Int?
  results     Int      @default(0)
  createdAt   DateTime @default(now())
  
  @@index([storeId, createdAt])
}

model SavedSearch {
  id          String   @id @default(cuid())
  customerId  String
  name        String
  filters     Json
  location    String?
  emailAlerts Boolean  @default(true)
  frequency   String   @default("daily")
  lastRun     DateTime?
  lastMatchCount Int @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([customerId])
}

model PropertyAlert {
  id            String   @id @default(cuid())
  customerId    String
  searchId      String?
  propertyId    String
  alertType     AlertType
  isRead        Boolean  @default(false)
  emailSent     Boolean  @default(false)
  smsSent       Boolean  @default(false)
  createdAt     DateTime @default(now())
  
  @@index([customerId, isRead])
  @@index([propertyId])
}

enum AlertType {
  PRICE_DROP
  NEW_LISTING
  STATUS_CHANGE
  BACK_ON_MARKET
  OPEN_HOUSE
}
`;

export default PROPERTY_SEARCH_ADDON;
