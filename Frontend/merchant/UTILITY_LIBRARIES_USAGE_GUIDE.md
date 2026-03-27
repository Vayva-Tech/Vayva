# Utility Libraries Usage Guide

This guide provides comprehensive examples for using the new utility libraries introduced to improve code quality, consistency, and developer experience across the Vayva Merchant application.

---

## Table of Contents

1. [Structured Logging with Logger](#structured-logging-with-logger)
2. [Form Validation with Zod](#form-validation-with-zod)
3. [API Caching with SWR](#api-caching-with-swr)
4. [API Caching with React Query](#api-caching-with-react-query)
5. [Error Handling](#error-handling)

---

## Structured Logging with Logger

### Why Use Logger?

Replace `console.log/warn/error` calls with structured logging that:
- Provides consistent error tracking
- Supports production error monitoring (Sentry)
- Includes context and categorization
- Environment-aware output

### Basic Usage

```typescript
import { logger, ErrorCategory } from '@/lib/logger';

// ✅ ERROR LOGGING
try {
  await riskyOperation();
} catch (error) {
  logger.error(
    '[FEATURE_NAME] Operation failed',
    error instanceof Error ? error : new Error(String(error)),
    { feature: 'feature_name', step: 'operation' }
  );
}

// ✅ WARNING LOGGING
logger.warn('[FEATURE_NAME] Deprecated API used', 'unknown', {
  feature: 'feature_name',
  deprecatedMethod: 'oldMethod'
});

// ✅ INFO LOGGING
logger.info('[FEATURE_NAME] User action completed', {
  userId: '123',
  action: 'purchase_completed'
});

// ✅ DEBUG LOGGING (development only)
logger.debug('[ANALYTICS_EVENT]', {
  event: 'button_click',
  elementId: 'submit-btn'
});
```

### Migration Examples

#### ❌ Before (Console)
```typescript
console.error('Failed to load user:', error);
console.warn('Browser does not support notifications');
```

#### ✅ After (Logger)
```typescript
logger.error(
  '[USER_LOAD_ERROR]',
  error instanceof Error ? error : new Error(String(error)),
  { feature: 'user_management', userId: user.id }
);

logger.warn('[PUSH_NOTIFICATIONS] Browser not supported', {
  feature: 'push_notifications',
  reason: 'browser_unsupported'
});
```

### Best Practices

1. **Always include context**: Add feature name and relevant data
2. **Use appropriate categories**: `ErrorCategory.AUTH`, `ErrorCategory.API`, etc.
3. **Wrap errors properly**: Convert unknown errors to Error instances
4. **Avoid sensitive data**: Don't log passwords, tokens, or PII

---

## Form Validation with Zod

### Why Use Zod?

- Type-safe schema validation
- Reusable validation rules
- Automatic type inference
- User-friendly error messages

### Campaign Validation Example

```typescript
import { 
  validateCampaignData,
  campaignNameSchema,
  budgetAmountSchema 
} from '@/lib/campaign-validation';

// ✅ FULL FORM VALIDATION
const handleSubmit = async (formData: unknown) => {
  const result = validateCampaignData(formData);
  
  if (!result.success) {
    const firstError = result.errors?.errors[0];
    toast.error(`Validation Error: ${firstError?.message}`);
    return;
  }
  
  // Data is validated and typed!
  await createCampaign(result.data);
};

// ✅ FIELD-LEVEL VALIDATION
const nameValidation = campaignNameSchema.safeParse(formData.name);
const nameError = formData.name && !nameValidation.success 
  ? nameValidation.error.errors[0]?.message 
  : null;

// ✅ REUSABLE SCHEMAS
import { z } from 'zod';

const customSchema = z.object({
  name: campaignNameSchema,
  budget: budgetAmountSchema,
  email: z.string().email(),
});
```

### Creating Custom Schemas

```typescript
// lib/my-validation.ts
import { z } from 'zod';

export const phoneNumberSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^\d+$/, 'Phone number must contain only digits');

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
});

export type AddressType = z.infer<typeof addressSchema>;
```

### Form Integration Pattern

```tsx
import { useState } from 'react';
import { campaignNameSchema } from '@/lib/campaign-validation';

function MyForm() {
  const [formData, setFormData] = useState({ name: '' });
  
  // Real-time validation
  const nameValidation = campaignNameSchema.safeParse(formData.name);
  const nameError = formData.name && !nameValidation.success 
    ? nameValidation.error.errors[0]?.message 
    : null;
  
  return (
    <div>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        aria-invalid={!!nameError}
        aria-describedby={nameError ? "name-error" : undefined}
      />
      {nameError && (
        <p id="name-error" className="text-red-600">
          ⚠️ {nameError}
        </p>
      )}
    </div>
  );
}
```

---

## API Caching with SWR

### Why Use SWR?

- Automatic caching and revalidation
- Deduping duplicate requests
- Real-time data synchronization
- Minimal boilerplate

### Setup

```typescript
import useSWR from 'swr';
import { swrFetcher, cacheKeys, analyticsConfig } from '@/lib/swr-cache-config';

// ✅ BASIC USAGE
function AnalyticsOverview({ businessId }: { businessId: string }) {
  const { data, error, isLoading } = useSWR(
    cacheKeys.analytics.overview(businessId),
    swrFetcher,
    analyticsConfig
  );
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  
  return <div>{/* Render data */}</div>;
}

// ✅ SHARED CACHE ACROSS COMPONENTS
// Component A and B automatically share cache!
function ComponentA() {
  const { data } = useSWR(cacheKeys.analytics.overview('biz_123'), swrFetcher);
  // ...
}

function ComponentB() {
  const { data } = useSWR(cacheKeys.analytics.overview('biz_123'), swrFetcher);
  // Same data, no duplicate request!
}
```

### Cache Invalidation

```typescript
import { invalidateCache, clearCache } from '@/lib/swr-cache-config';

// Invalidate specific cache
await invalidateCache('/api/analytics/overview');

// Invalidate multiple patterns
await invalidateCache(['/api/campaigns', '/api/orders']);

// Clear entire cache
await clearCache();
```

### Common Patterns

```typescript
// ✅ POLLING - Real-time updates
const { data } = useSWR(
  cacheKeys.orders.list(storeId),
  swrFetcher,
  { refreshInterval: 10000 } // 10 seconds
);

// ✅ DEPENDENT QUERIES - Fetch after first query succeeds
const { data: user } = useSWR(userKey, fetcher);
const { data: orders } = useSWR(
  user ? ordersKey : null, // null disables query
  fetcher
);

// ✅ MANUAL REVALIDATION
const { data, mutate } = useSWR(key, fetcher);

const handleRefresh = async () => {
  await mutate(); // Manually trigger revalidation
};
```

---

## API Caching with React Query

### Why Use React Query?

- More advanced caching features
- Mutation support with optimistic updates
- Infinite queries
- Devtools integration

### Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query-config';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Basic Usage

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query-config';

function AnalyticsOverview({ businessId }: { businessId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.analytics.overview(businessId),
    queryFn: async () => {
      const res = await fetch(`/api/analytics/overview?businessId=${businessId}`);
      return res.json();
    },
  });
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  
  return <div>{/* Render data */}</div>;
}
```

### Mutations with Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateCampaign() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data: CampaignCreateInput) => {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    
    // Optimistic update
    onMutate: async (newCampaign) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.campaigns.all });
      
      // Snapshot previous value
      const previousCampaigns = queryClient.getQueryData(queryKeys.campaigns.all);
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.campaigns.all, (old: any) => ({
        campaigns: [...(old?.campaigns || []), newCampaign],
      }));
      
      return { previousCampaigns };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKeys.campaigns.all, context?.previousCampaigns);
    },
    
    // Invalidate and refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });
  
  return <button onClick={() => mutation.mutate(data)}>Create</button>;
}
```

---

## Error Handling

### Structured Error Handling Pattern

```typescript
import { logger, ErrorCategory } from '@/lib/logger';

async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  context: { feature: string; step: string }
): Promise<{ success: boolean; data?: T; error?: Error }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    logger.error(
      `[${context.feature.toUpperCase()}] ${context.step} failed`,
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

// Usage
const result = await safeAsyncOperation(
  () => fetchCampaign(id),
  { feature: 'campaigns', step: 'fetch_campaign_by_id' }
);

if (!result.success) {
  toast.error('Failed to load campaign');
  return;
}

// Use result.data safely
```

---

## Summary

### Quick Reference

| Task | Utility | Import |
|------|---------|--------|
| Structured logging | `logger` | `@/lib/logger` |
| Form validation | `zod schemas` | `@/lib/campaign-validation` |
| API caching (simple) | `SWR` | `@/lib/swr-cache-config` |
| API caching (advanced) | `React Query` | `@/lib/react-query-config` |
| Error handling | `safeAsyncOperation` | Custom pattern |

### Key Benefits

✅ **Consistency**: All developers use the same patterns  
✅ **Type Safety**: Full TypeScript support  
✅ **Production Ready**: Error tracking integration  
✅ **Performance**: Intelligent caching  
✅ **Maintainability**: Self-documenting code  

### Next Steps

1. Replace remaining `console.*` calls with `logger`
2. Adopt zod validation for all forms
3. Migrate duplicate API calls to shared SWR/React Query caches
4. Document additional patterns as they emerge

---

**Last Updated:** March 26, 2026  
**Maintained By:** Engineering Team
