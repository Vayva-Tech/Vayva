/**
 * Domain Types
 * 
 * Business domain type definitions: User, Merchant, Store, Product, Order, etc.
 */

import type { IndustrySlug } from '@/lib/constants/industries';
import type { PlanType } from '@/lib/constants/plans';
import type { Address, Money, Status } from './common';

/**
 * User Types
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  user: User;
  storeId: string;
  token: string;
  expiresAt: string;
}

/**
 * Merchant Types
 */
export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  industrySlug: IndustrySlug;
  onboardingCompleted: boolean;
  onboardingStatus?: string;
  planType: PlanType;
  planExpiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  stores?: Store[];
}

export interface ExtendedMerchant extends Merchant {
  currentStore?: Store;
}

/**
 * Store Types
 */
export interface Store {
  id: string;
  merchantId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
  currency: string;
  timezone: string;
  language: string;
  
  // Contact
  address?: Address;
  phone?: string;
  email?: string;
  
  // Social
  websiteUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  // Settings
  allowPreOrders?: boolean;
  allowBackOrders?: boolean;
  lowStockThreshold?: number;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Product Types
 */
export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  
  // Pricing
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  currency: string;
  
  // Inventory
  sku?: string;
  barcode?: string;
  quantity: number;
  trackInventory: boolean;
  allowBackOrder: boolean;
  
  // Media
  images: ImageFile[];
  primaryImageId?: string;
  
  // Categorization
  categoryId?: string;
  category?: ProductCategory;
  tags?: string[];
  
  // Variants
  hasVariants: boolean;
  variants?: ProductVariant[];
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Status
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent?: ProductCategory;
  children?: ProductCategory[];
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g., "Small / Red"
  options: VariantOption[];
  price?: number;
  compareAtPrice?: number;
  sku?: string;
  quantity: number;
  image?: ImageFile;
}

export interface VariantOption {
  optionId: string;
  optionName: string; // e.g., "Size"
  valueId: string;
  valueName: string; // e.g., "Small"
}

/**
 * Order Types
 */
export interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  status: OrderStatus;
  
  // Customer
  customerId?: string;
  customer?: Customer;
  guestEmail?: string;
  
  // Items
  items: OrderItem[];
  itemCount: number;
  
  // Pricing
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paidAt?: string;
  
  // Fulfillment
  fulfillmentStatus: FulfillmentStatus;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  
  // Shipping
  shippingAddress?: Address;
  billingAddress?: Address;
  
  // Notes
  notes?: string;
  internalNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  
  name: string;
  sku?: string;
  
  quantity: number;
  price: number;
  total: number;
  
  tax?: number;
  discount?: number;
  
  image?: ImageFile;
}

/**
 * Customer Types
 */
export interface Customer {
  id: string;
  storeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  
  // Addresses
  addresses?: Address[];
  defaultAddressId?: string;
  
  // Stats
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  
  // Marketing
  acceptsMarketing: boolean;
  tags?: string[];
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Inventory Types
 */
export interface InventoryItem {
  id: string;
  storeId: string;
  productId: string;
  variantId?: string;
  
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  
  lowStockThreshold?: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  
  location?: string;
  lastCountedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Analytics Types
 */
export interface DashboardMetrics {
  revenue: MetricWithTrend;
  orders: MetricWithTrend;
  customers: MetricWithTrend;
  conversionRate: MetricWithTrend;
  averageOrderValue: MetricWithTrend;
}

export interface MetricWithTrend {
  value: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
}

/**
 * Notification Types
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type NotificationType = 'order' | 'product' | 'customer' | 'system' | 'marketing';

/**
 * Image File Type (referenced from common)
 */
interface ImageFile {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}
