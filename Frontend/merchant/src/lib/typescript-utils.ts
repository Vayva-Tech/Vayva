/**
 * TypeScript Utilities
 * Type-safe utilities to eliminate 'as any' and improve type safety
 */

/* ------------------------------------------------------------------ */
/*  Type Guards                                                           */
/* ------------------------------------------------------------------ */

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if value is an object (not array, not null)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if object has property
 */
export function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

/* ------------------------------------------------------------------ */
/*  Safe Type Assertions                                                 */
/* ------------------------------------------------------------------ */

/**
 * Safely assert type with runtime check
 */
export function assertType<T>(value: unknown, predicate: (v: unknown) => boolean): T {
  if (!predicate(value)) {
    throw new TypeError(`Expected type ${typeof value}, got ${typeof value}`);
  }
  return value as T;
}

/**
 * Safe property access with type guard
 */
export function safeProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  defaultValue: T[K]
): T[K] {
  if (!obj || !(key in obj)) {
    return defaultValue;
  }
  return obj[key];
}

/* ------------------------------------------------------------------ */
/*  Utility Types                                                        */
/* ------------------------------------------------------------------ */

/**
 * Make all properties optional
 */
export type Optional<T> = Partial<T>;

/**
 * Make required properties non-nullable
 */
export type RequiredNonNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Extract only the keys that match a condition
 */
export type KeysMatching<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Omit properties by value type
 */
export type OmitByValue<T, V> = Pick<
  T,
  { [K in keyof T]: T[K] extends V ? never : K }[keyof T]
>;

/**
 * Deep partial - make all nested properties optional
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Deep required - make all nested properties required
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;

/* ------------------------------------------------------------------ */
/*  Function Types                                                       */
/* ------------------------------------------------------------------ */

/**
 * Function that returns a promise
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Function with typed arguments
 */
export type TypedFunction<TArgs extends any[], TReturn> = (...args: TArgs) => TReturn;

/**
 * Async function with typed arguments
 */
export type AsyncTypedFunction<TArgs extends any[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;

/* ------------------------------------------------------------------ */
/*  API Response Types                                                   */
/* ------------------------------------------------------------------ */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  status: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Safe API response parser
 */
export function parseApiResponse<T>(response: unknown): ApiResponse<T> {
  const apiResponse = response as ApiResponse<T>;
  
  return {
    ...apiResponse,
    success: apiResponse.success ?? false,
    status: apiResponse.status ?? 500,
  };
}

/* ------------------------------------------------------------------ */
/*  Event Handler Types                                                  */
/* ------------------------------------------------------------------ */

/**
 * React change event handler type
 */
export type ChangeHandler<T = HTMLInputElement> = React.ChangeEvent<T>;

/**
 * React form event handler type
 */
export type FormHandler = React.FormEvent<HTMLFormElement>;

/**
 * React mouse event handler type
 */
export type MouseHandler = React.MouseEvent<HTMLElement>;

/**
 * React keyboard event handler type
 */
export type KeyboardHandler = React.KeyboardEvent<HTMLElement>;

/**
 * Safe event handler wrapper
 */
export function withSafeEventHandler(
  handler: (event: React.SyntheticEvent) => void,
  onError?: (error: Error) => void
) {
  return (event: React.SyntheticEvent) => {
    try {
      handler(event);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        console.error('[EVENT_HANDLER_ERROR]', error);
      }
    }
  };
}

/* ------------------------------------------------------------------ */
/*  Data Transformation                                                  */
/* ------------------------------------------------------------------ */

/**
 * Safely transform array with type narrowing
 */
export function safeTransform<T, R>(
  items: unknown[],
  transformer: (item: unknown) => R | null
): R[] {
  return items.reduce<R[]>((acc, item) => {
    const result = transformer(item);
    if (result !== null) {
      acc.push(result);
    }
    return acc;
  }, []);
}

/**
 * Group array by key with type safety
 */
export function groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Filter null/undefined values from array
 */
export function filterNullish<T>(items: Array<T | null | undefined>): T[] {
  return items.filter(isDefined);
}

/* ------------------------------------------------------------------ */
/*  Type-Safe Constants Access                                           */
/* ------------------------------------------------------------------ */

/**
 * Get constant value with type safety
 */
export function getConstant<T extends object, K extends keyof T>(
  constants: T,
  key: K,
  fallback?: T[K]
): T[K] {
  if (!(key in constants)) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Constant '${String(key)}' not found`);
  }
  return constants[key];
}

/**
 * Safe enum accessor
 */
export function getEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: string | number,
  fallback?: T[keyof T]
): T[keyof T] {
  const entries = Object.entries(enumObj);
  const found = entries.find(([key, val]) => key === value || val === value);
  
  if (found) {
    return found[1] as T[keyof T];
  }
  
  if (fallback !== undefined) {
    return fallback;
  }
  
  throw new Error(`Enum value '${value}' not found`);
}
