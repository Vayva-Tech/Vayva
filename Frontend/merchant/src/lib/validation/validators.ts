/**
 * Validation Utility Functions
 * 
 * Helper functions for working with Zod schemas
 */

import { z, ZodSchema, ZodError } from 'zod';

/**
 * Safe parse result type
 */
export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError<T> };

/**
 * Validate data against a schema safely
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): SafeParseResult<T> {
  const result = schema.safeParse(data);
  return result as SafeParseResult<T>;
}

/**
 * Validate and throw on error
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = validate(schema, data);
  
  if (!result.success) {
    throw result.error;
  }
  
  return result.data;
}

/**
 * Get formatted error messages from Zod error
 */
export function getValidationErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    if (err.path.length > 0) {
      const field = err.path.join('.');
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(err.message);
    }
  });
  
  return errors;
}

/**
 * Get first error message for each field
 */
export function getFirstValidationError(error: ZodError): Record<string, string> {
  const errors = getValidationErrors(error);
  const firstErrors: Record<string, string> = {};
  
  Object.entries(errors).forEach(([field, messages]) => {
    firstErrors[field] = messages[0];
  });
  
  return firstErrors;
}

/**
 * Create a validation wrapper for async functions
 */
export function withValidation<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  fn: (data: TInput) => Promise<TOutput>
): (data: unknown) => Promise<TOutput> {
  return async (data: unknown) => {
    const validated = validateOrThrow(schema, data);
    return fn(validated);
  };
}

/**
 * Compose multiple schemas into one
 */
export function composeSchemas<T extends Record<string, ZodSchema>>(
  schemas: T
): z.ZodObject<T> {
  return z.object(schemas);
}

/**
 * Create optional version of schema
 */
export function optionalSchema<T>(schema: ZodSchema<T>): z.ZodOptional<ZodSchema<T>> {
  return schema.optional();
}

/**
 * Create nullable version of schema
 */
export function nullableSchema<T>(schema: ZodSchema<T>): z.ZodNullable<ZodSchema<T>> {
  return schema.nullable();
}

/**
 * Create array schema
 */
export function arraySchema<T>(schema: ZodSchema<T>): z.ZodArray<ZodSchema<T>> {
  return z.array(schema);
}

/**
 * Transform empty strings to undefined
 */
export function emptyStringToUndefined<T extends string>(value: T): T | undefined {
  return value.trim() === '' ? undefined : (value as T | undefined);
}

/**
 * Trim string values
 */
export function trimString(value: string): string {
  return value.trim();
}

/**
 * Create a schema that trims strings automatically
 */
export function trimmedStringSchema(): z.ZodEffects<z.ZodString, string, string> {
  return z.string().transform(trimString);
}
