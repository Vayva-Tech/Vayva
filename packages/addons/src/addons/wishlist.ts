/**
 * Wishlist Add-On - Save products for later
 * 
 * Features:
 * - Save products to wishlist
 * - Share wishlist
 * - Move to cart
 * - Heart button on product cards
 */

import type { AddOnDefinition } from '../types';

export const WISHLIST_ADDON: AddOnDefinition = {
  id: 'vayva.wishlist',
  name: 'Wishlist',
  description: 'Let customers save products for later. Includes heart buttons, shareable wishlists, and easy move-to-cart.',
  tagline: 'Save favorites for later',
  version: '1.0.0',
  category: 'ecommerce',
  
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  
  icon: 'Heart',
  tags: ['wishlist', 'favorites', 'save', 'shopping'],
  
  compatibleTemplates: ['*'],
  conflictsWith: [],
  requires: [],
  
  previewImages: {
    thumbnail: '/addons/wishlist/thumbnail.png',
    screenshots: ['/addons/wishlist/screenshot-1.png'],
  },
  
  installationType: 'automatic',
  canUninstall: true,
  installTimeEstimate: 2,
  
  versionHistory: [
    {
      version: '1.0.0',
      date: new Date().toISOString(),
      changes: ['Initial release'],
    },
  ],
  
  provides: {
    pages: [
      {
        route: '/wishlist',
        title: 'My Wishlist',
        description: 'Saved products',
        layout: 'default',
      },
    ],
    components: [
      {
        mountPoint: 'product-card',
        componentName: 'WishlistButton',
        priority: 20,
        conditions: {
          pageTypes: ['home', 'category'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'product-detail',
        componentName: 'WishlistAction',
        priority: 70,
        conditions: {
          pageTypes: ['product'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'header-right',
        componentName: 'WishlistIcon',
        priority: 15,
        conditions: {
          pageTypes: ['home', 'product', 'category'],
          authState: 'any',
        },
      },
    ],
    apiRoutes: [
      {
        path: '/api/addons/wishlist/add',
        methods: ['POST'],
        description: 'Add item to wishlist',
      },
      {
        path: '/api/addons/wishlist/remove',
        methods: ['DELETE'],
        description: 'Remove item from wishlist',
      },
      {
        path: '/api/addons/wishlist',
        methods: ['GET'],
        description: 'Get wishlist items',
      },
      {
        path: '/api/addons/wishlist/move-to-cart',
        methods: ['POST'],
        description: 'Move wishlist item to cart',
      },
    ],
    databaseModels: ['Wishlist', 'WishlistItem'],
  },
  
  configSchema: {
    fields: [
      {
        key: 'requireLogin',
        label: 'Require Login',
        type: 'boolean',
        description: 'Only logged-in users can use wishlist',
        defaultValue: false,
        required: false,
      },
      {
        key: 'maxItems',
        label: 'Maximum Items',
        type: 'number',
        description: 'Maximum items per wishlist',
        defaultValue: 50,
        required: false,
        validation: { min: 10, max: 500 },
      },
      {
        key: 'allowSharing',
        label: 'Allow Sharing',
        type: 'boolean',
        description: 'Users can share wishlist via link',
        defaultValue: true,
        required: false,
      },
      {
        key: 'showInHeader',
        label: 'Show in Header',
        type: 'boolean',
        description: 'Display wishlist icon in site header',
        defaultValue: true,
        required: false,
      },
      {
        key: 'enableNotifications',
        label: 'Price Drop Alerts',
        type: 'boolean',
        description: 'Notify when wishlist items go on sale',
        defaultValue: true,
        required: false,
      },
    ],
  },
  
  defaultConfig: {
    requireLogin: false,
    maxItems: 50,
    allowSharing: true,
    showInHeader: true,
    enableNotifications: true,
  },
  
  configRequired: false,
  
  pricing: {
    type: 'free',
  },
  
  stats: {
    installCount: 0,
    rating: 0,
    reviewCount: 0,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  
  highlights: [
    'Save items to a wishlist',
    'Share wishlists via link',
    'Move items to cart',
    'Works without login',
    'Price drop alerts',
  ],
  
  docs: {
    setup: 'Wishlist buttons appear automatically on product pages. Configure login requirements and limits in settings.',
  },
};

// Prisma model extension for Wishlist
export const WISHLIST_MODEL = `
model Wishlist {
  id          String   @id @default(uuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  // User reference (nullable for guest wishlists)
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id])
  
  // Guest wishlist
  sessionId   String?  @unique
  
  // Shareable link
  shareToken  String?  @unique
  
  // Items
  items       WishlistItem[]
  
  // Settings
  isPublic    Boolean  @default(false)
  name        String?  // For named wishlists
  
  // Notifications
  priceAlertsEnabled Boolean @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, customerId])
  @@index([storeId, sessionId])
  @@map("wishlists")
}

model WishlistItem {
  id          String   @id @default(uuid())
  
  wishlistId  String
  wishlist    Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Metadata
  addedAt     DateTime @default(now())
  addedPrice  Int      // Price when added (for notifications)
  
  // Notes
  note        String?
  
  // Notifications
  notifiedAt  DateTime?
  
  @@unique([wishlistId, productId])
  @@index([wishlistId, addedAt])
  @@map("wishlist_items")
}
`;

export default WISHLIST_ADDON;
