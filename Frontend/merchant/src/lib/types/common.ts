/**
 * Common TypeScript Types
 * 
 * Shared type definitions used across the application
 */

/**
 * API Response Types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  correlationId?: string;
  requestId?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * Pagination Query Parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cursor?: string;
}

/**
 * Filter Configuration
 */
export interface FilterConfig<T = unknown> {
  field: keyof T;
  operator: FilterOperator;
  value: unknown;
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

/**
 * Sort Configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Date Range Type
 */
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Money/Currency Type
 */
export interface Money {
  amount: number;
  currency: string;
}

/**
 * Address Type
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * File/Media Types
 */
export interface FileUpload {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface ImageFile extends FileUpload {
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Status Types
 */
export type Status = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PublishStatus = 'draft' | 'published' | 'archived';

/**
 * Result Types for Operations
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Nullable and Optional Utilities
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Nullish<T> = T | null | undefined;

/**
 * Deep Partial Type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep Readonly Type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * ValueOf Utility - Get union of all values in an object type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Extract keys by value type
 */
export type KeysByType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Mutable version of readonly type
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Require some keys
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Omit multiple keys
 */
export type OmitMultiple<T, K extends readonly (keyof T)[]> = Omit<T, K[number]>;
