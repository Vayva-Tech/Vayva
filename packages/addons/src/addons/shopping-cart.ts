/**
 * Shopping Cart Add-On
 * 
 * Universal shopping cart functionality for all templates
 */

import { AddOnDefinition } from '../../types';

export const SHOPPING_CART_ADDON: AddOnDefinition = {
  id: 'vayva.shopping-cart',
  name: 'Shopping Cart',
  description: 'A full-featured shopping cart with mini-cart, quantity controls, and persistent storage across sessions',
  tagline: 'Seamless cart experience that converts',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'ShoppingCart',
  tags: ['cart', 'ecommerce', 'checkout', 'conversion'],
  compatibleTemplates: ['*'],
  mountPoints: ['header-right', 'floating-button', 'product-card'],
  configSchema: {
    type: 'object',
    properties: {
      miniCartEnabled: { type: 'boolean', default: true },
      persistentCart: { type: 'boolean', default: true },
      showCartCount: { type: 'boolean', default: true },
      animationStyle: { type: 'string', enum: ['slide', 'fade', 'none'], default: 'slide' },
      freeShippingThreshold: { type: 'number', default: 0 },
      crossSellsEnabled: { type: 'boolean', default: true },
      savedForLater: { type: 'boolean', default: false },
    },
  },
  defaultConfig: {
    miniCartEnabled: true,
    persistentCart: true,
    showCartCount: true,
    animationStyle: 'slide',
    freeShippingThreshold: 0,
    crossSellsEnabled: true,
    savedForLater: false,
  },
  previewImages: {
    thumbnail: '/addons/shopping-cart/thumbnail.jpg',
    screenshots: [
      '/addons/shopping-cart/screenshot-1.jpg',
      '/addons/shopping-cart/screenshot-2.jpg',
    ],
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
    installCount: 15420,
    rating: 4.8,
    reviewCount: 892,
    lastUpdated: '2024-01-15',
    createdAt: '2023-06-01',
  },
  provides: {
    components: [
      { componentName: 'CartIcon', mountPoint: 'header-right' },
      { componentName: 'MiniCart', mountPoint: 'floating-button' },
      { componentName: 'AddToCartButton', mountPoint: 'product-card' },
    ],
    apiRoutes: [
      { path: '/api/cart', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/cart/items', methods: ['POST', 'PUT', 'DELETE'] },
      { path: '/api/cart/merge', methods: ['POST'] },
    ],
    databaseModels: ['Cart', 'CartItem'],
  },
  highlights: [
    'Persistent cart across sessions',
    'Mini-cart with quick view',
    'Cross-sell recommendations',
    'Guest checkout support',
  ],
  installTimeEstimate: 2,
};

// Prisma model extensions
export const SHOPPING_CART_MODELS = `
model Cart {
  id        String   @id @default(cuid())
  storeId   String
  customerId String?
  sessionId String?
  status    CartStatus @default(ACTIVE)
  items     CartItem[]
  subtotal  Decimal  @default(0) @db.Decimal(10, 2)
  tax       Decimal  @default(0) @db.Decimal(10, 2)
  shipping  Decimal  @default(0) @db.Decimal(10, 2)
  discount  Decimal  @default(0) @db.Decimal(10, 2)
  total     Decimal  @default(0) @db.Decimal(10, 2)
  currency  String   @default("NGN")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([storeId, customerId])
  @@index([sessionId])
  @@index([status])
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  variantId String?
  quantity  Int      @default(1)
  price     Decimal  @db.Decimal(10, 2)
  name      String
  image     String?
  metadata  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([cartId, productId, variantId])
  @@index([cartId])
}

enum CartStatus {
  ACTIVE
  CONVERTED
  ABANDONED
  EXPIRED
}
`;

export default SHOPPING_CART_ADDON;
