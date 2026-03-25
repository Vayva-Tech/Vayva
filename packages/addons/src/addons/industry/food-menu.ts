/**
 * Food Menu Add-On
 * 
 * Restaurant menu display with categories, dietary filters, and pricing
 */

import type { AddOnDefinition } from '../../types';

export const FOOD_MENU_ADDON: AddOnDefinition = {
  id: 'vayva.food-menu',
  name: 'Food Menu',
  description: 'Beautiful restaurant menu with categories, dietary filters, ingredients, allergen info, and online ordering integration',
  tagline: 'Digital menu that makes mouths water',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'UtensilsCrossed',
  tags: ['menu', 'restaurant', 'food', 'dining', 'categories'],
  compatibleTemplates: ['food', 'restaurant', 'nightlife'],
  mountPoints: ['page-sidebar', 'below-fold', 'hero-section'],
  previewImages: {
    thumbnail: '/addons/food-menu/thumbnail.png',
    screenshots: ['/addons/food-menu/screenshot-1.png'],
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
    installCount: 3400,
    rating: 4.7,
    reviewCount: 156,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/menu', title: 'Menu' },
      { route: '/menu/category/[slug]', title: 'Menu Category' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'FeaturedMenuItems' },
      { mountPoint: 'page-sidebar', componentName: 'MenuCategories' },
    ],
    apiRoutes: [
      { path: '/api/menu', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/menu/categories', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
    databaseModels: ['MenuCategory', 'MenuItem', 'MenuItemOption'],
  },
  highlights: [
    'Digital menu categories',
    'Dietary & allergen filters',
    'Ingredient lists',
    'Price variations',
    'QR code menu',
  ],
  installTimeEstimate: 2,
};

export const FOOD_MENU_MODELS = `
model MenuCategory {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  description String?
  image       String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  items       MenuItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isActive])
}

model MenuItem {
  id           String   @id @default(cuid())
  categoryId   String
  category     MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name         String
  description  String?
  price        Decimal  @db.Decimal(10, 2)
  comparePrice Decimal? @db.Decimal(10, 2)
  image        String?
  images       String[]
  ingredients  String[]
  allergens    String[]
  dietary      DietaryType[]
  spiceLevel   Int?     @default(0)
  isFeatured   Boolean  @default(false)
  isActive     Boolean  @default(true)
  options      MenuItemOption[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([categoryId])
  @@index([isFeatured])
}

model MenuItemOption {
  id          String   @id @default(cuid())
  menuItemId  String
  menuItem    MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  name        String
  type        OptionType
  required    Boolean  @default(false)
  minSelect   Int?     @default(0)
  maxSelect   Int?
  choices     Json[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([menuItemId])
}

enum DietaryType {
  VEGAN
  VEGETARIAN
  GLUTEN_FREE
  DAIRY_FREE
  NUT_FREE
  HALAL
  KOSHER
  KETO
  SPICY
}

enum OptionType {
  SINGLE
  MULTIPLE
  QUANTITY
  TEXT
}
`;

export default FOOD_MENU_ADDON;
