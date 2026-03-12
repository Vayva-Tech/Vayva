/**
 * Build Safety Utilities
 * Use these patterns to maintain typecheck/lint compliance during development
 */

// Pattern 1: Placeholder for unimplemented functions
export function placeholder<T>(message: string): T {
  // eslint-disable-next-line no-console
  console.warn(`[PLACEHOLDER] ${message}`);
  return undefined as T;
}

// Pattern 2: Stub class for unimplemented services
export class StubService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async stubMethod(..._args: unknown[]): Promise<unknown> {
    throw new Error('Not implemented - see Phase X');
  }
}

// Pattern 3: Type-safe TODO marker
export type TODO<T = unknown> = T;

// Pattern 4: Incremental implementation interface
export interface IncrementalImplementation {
  phase1Feature: () => void;
  phase2Feature: () => void;
}

// Pattern 5: Feature flag utility
export const FEATURE_FLAGS = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Pattern 6: Safe casting utility
export function safeCast<T>(value: unknown, fallback: T): T {
  return value as T || fallback;
}

// Pattern 7: Conditional type utility
export type If<C extends boolean, T, F> = C extends true ? T : F;

// Pattern 8: Partial implementation marker
export type PartialImplementation<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R | Promise<R>
    : T[K];
};

// Pattern 9: Development-only implementation
export function devOnly<T>(implementation: T): T | undefined {
  return process.env.NODE_ENV === 'development' ? implementation : undefined;
}