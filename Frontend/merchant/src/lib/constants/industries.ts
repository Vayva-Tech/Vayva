/**
 * Industry Definitions
 * 
 * Industry slugs, names, configurations, and route mappings
 */

export type IndustrySlug = 
  | 'retail'
  | 'fashion'
  | 'grocery'
  | 'beauty'
  | 'food'
  | 'real-estate'
  | 'meal-kit'
  | 'nonprofit'
  | 'electronics'
  | 'books'
  | 'sports'
  | 'toys'
  | 'health'
  | 'automotive';

export interface IndustryDefinition {
  slug: IndustrySlug;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  metrics: string[];
  defaultRoutes: string[];
}

/**
 * Industry definitions
 */
export const INDUSTRIES: Record<IndustrySlug, IndustryDefinition> = {
  retail: {
    slug: 'retail',
    name: 'Retail',
    description: 'General retail and merchandise',
    icon: 'storefront',
    color: '#3B82F6',
    features: ['inventory', 'pos', 'analytics'],
    metrics: ['revenue', 'orders', 'customers', 'conversion'],
    defaultRoutes: ['/dashboard/overview', '/products', '/orders'],
  },
  
  fashion: {
    slug: 'fashion',
    name: 'Fashion & Apparel',
    description: 'Clothing, shoes, and accessories',
    icon: 'shirt',
    color: '#EC4899',
    features: ['size-guide', 'variants', 'lookbook'],
    metrics: ['revenue', 'orders', 'returns', 'sizing'],
    defaultRoutes: ['/dashboard/overview', '/products', '/size-guide'],
  },
  
  grocery: {
    slug: 'grocery',
    name: 'Grocery & Food',
    description: 'Fresh produce and everyday essentials',
    icon: 'shopping-basket',
    color: '#10B981',
    features: ['expiry-tracking', 'delivery-slots', 'subscriptions'],
    metrics: ['revenue', 'orders', 'waste', 'freshness'],
    defaultRoutes: ['/dashboard/overview', '/inventory', '/delivery'],
  },
  
  beauty: {
    slug: 'beauty',
    name: 'Beauty & Cosmetics',
    description: 'Skincare, makeup, and personal care',
    icon: 'sparkles',
    color: '#8B5CF6',
    features: ['appointments', 'services', 'ingredients'],
    metrics: ['revenue', 'bookings', 'services', 'retention'],
    defaultRoutes: ['/dashboard/overview', '/appointments', '/services'],
  },
  
  food: {
    slug: 'food',
    name: 'Restaurant & Food Service',
    description: 'Restaurants, cafes, and food delivery',
    icon: 'restaurant',
    color: '#F59E0B',
    features: ['kitchen-display', 'table-management', 'delivery'],
    metrics: ['revenue', 'orders', 'preparation-time', 'ratings'],
    defaultRoutes: ['/dashboard/overview', '/kitchen', '/orders'],
  },
  
  'real-estate': {
    slug: 'real-estate',
    name: 'Real Estate',
    description: 'Property sales and rentals',
    icon: 'home',
    color: '#06B6D4',
    features: ['listings', 'agent-management', 'virtual-tours'],
    metrics: ['listings', 'views', 'leads', 'conversions'],
    defaultRoutes: ['/dashboard/overview', '/listings', '/agents'],
  },
  
  'meal-kit': {
    slug: 'meal-kit',
    name: 'Meal Kit Service',
    description: 'Pre-portioned meal delivery',
    icon: 'local-dining',
    color: '#EF4444',
    features: ['subscription-boxes', 'recipe-cards', 'dietary-filters'],
    metrics: ['subscriptions', 'deliveries', 'retention', 'waste'],
    defaultRoutes: ['/dashboard/overview', '/subscriptions', '/recipes'],
  },
  
  nonprofit: {
    slug: 'nonprofit',
    name: 'Nonprofit & Charity',
    description: 'Fundraising and donations',
    icon: 'favorite',
    color: '#EC4899',
    features: ['donations', 'campaigns', 'volunteer-management'],
    metrics: ['donations', 'donors', 'campaigns', 'impact'],
    defaultRoutes: ['/dashboard/overview', '/campaigns', '/donors'],
  },
  
  electronics: {
    slug: 'electronics',
    name: 'Electronics',
    description: 'Consumer electronics and gadgets',
    icon: 'devices',
    color: '#6366F1',
    features: ['warranty-tracking', 'specs-comparison', 'reviews'],
    metrics: ['revenue', 'units-sold', 'returns', 'warranty-claims'],
    defaultRoutes: ['/dashboard/overview', '/products', '/warranty'],
  },
  
  books: {
    slug: 'books',
    name: 'Books & Media',
    description: 'Books, magazines, and digital media',
    icon: 'menu-book',
    color: '#78716C',
    features: ['isbn-tracking', 'pre-orders', 'reviews'],
    metrics: ['revenue', 'units-sold', 'pre-orders', 'bestsellers'],
    defaultRoutes: ['/dashboard/overview', '/catalog', '/pre-orders'],
  },
  
  sports: {
    slug: 'sports',
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    icon: 'sports',
    color: '#22C55E',
    features: ['equipment-rental', 'coaching', 'events'],
    metrics: ['revenue', 'rentals', 'bookings', 'events'],
    defaultRoutes: ['/dashboard/overview', '/equipment', '/events'],
  },
  
  toys: {
    slug: 'toys',
    name: 'Toys & Games',
    description: 'Children\'s toys and games',
    icon: 'toys',
    color: '#F97316',
    features: ['age-filtering', 'gift-wrapping', 'wishlists'],
    metrics: ['revenue', 'seasonal-sales', 'gift-wraps', 'wishlists'],
    defaultRoutes: ['/dashboard/overview', '/products', '/seasonal'],
  },
  
  health: {
    slug: 'health',
    name: 'Health & Wellness',
    description: 'Health products and wellness services',
    icon: 'monitor-heart-rate',
    color: '#14B8A6',
    features: ['prescriptions', 'consultations', 'health-tracking'],
    metrics: ['revenue', 'consultations', 'prescriptions', 'outcomes'],
    defaultRoutes: ['/dashboard/overview', '/consultations', '/prescriptions'],
  },
  
  automotive: {
    slug: 'automotive',
    name: 'Automotive',
    description: 'Auto parts and accessories',
    icon: 'directions-car',
    color: '#64748B',
    features: ['vehicle-finder', 'parts-catalog', 'installation'],
    metrics: ['revenue', 'parts-sold', 'installations', 'returns'],
    defaultRoutes: ['/dashboard/overview', '/parts', '/services'],
  },
};

/**
 * Get industry by slug
 */
export function getIndustry(slug: string): IndustryDefinition | null {
  return INDUSTRIES[slug as IndustrySlug] || null;
}

/**
 * Get all industries
 */
export function getAllIndustries(): IndustryDefinition[] {
  return Object.values(INDUSTRIES);
}

/**
 * Check if industry supports feature
 */
export function industrySupportsFeature(slug: IndustrySlug, feature: string): boolean {
  const industry = INDUSTRIES[slug];
  return industry?.features.includes(feature) ?? false;
}
