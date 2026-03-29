/**
 * Types Module
 * 
 * Common and domain type definitions
 */

// Common types
export {
  type ApiResponse,
  type PaginatedResponse,
  type PaginationQuery,
  type FilterConfig,
  type FilterOperator,
  type SortConfig,
  type DateRange,
  type Money,
  type Address,
  type FileUpload,
  type ImageFile,
  type Status,
  type ApprovalStatus,
  type PublishStatus,
  type Result,
  type Nullable,
  type Optional,
  type Nullish,
  type DeepPartial,
  type DeepReadonly,
  type ValueOf,
  type KeysByType,
  type Mutable,
  type RequireKeys,
  type OmitMultiple,
} from './common';

// Domain types
export {
  type User,
  type UserSession,
  type Merchant,
  type ExtendedMerchant,
  type Store,
  type Product,
  type ProductCategory,
  type ProductVariant,
  type VariantOption,
  type Order,
  type OrderItem,
  type OrderStatus,
  type PaymentStatus,
  type FulfillmentStatus,
  type Customer,
  type InventoryItem,
  type DashboardMetrics,
  type MetricWithTrend,
  type AnalyticsDataPoint,
  type Notification,
  type NotificationType,
} from './domain';
