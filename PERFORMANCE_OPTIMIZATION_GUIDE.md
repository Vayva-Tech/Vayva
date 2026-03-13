# Performance Optimization Implementation Guide

## Overview

This guide provides concrete implementations for optimizing VAYVA dashboard performance, targeting:
- **30% bundle size reduction**
- **50% load time improvement**  
- **Lighthouse score > 95**

---

## 1. Bundle Size Optimization

### Run Bundle Analysis

```bash
# Analyze current bundle composition
pnpm analyze:bundle

# Check bundle sizes against budgets
pnpm check:bundle
```

### Code Splitting Strategy

#### Example: Lazy Load Industry Components

```typescript
// apps/merchant-admin/src/lib/lazy-industry-components.ts
import { createLazyComponent } from '@vayva/shared/utils/performance';

// Healthcare components
export const HealthcareDashboard = createLazyComponent(
  () => import('@vayva/industry-healthcare/dashboard'),
  { loadingFallback: <DashboardSkeleton /> }
);

export const PatientIntakeForms = createLazyComponent(
  () => import('@vayva/industry-healthcare').then(m => ({ default: m.PatientIntakeForms })),
  { loadingFallback: <FormSkeleton /> }
);

// Legal components
export const LegalDashboard = createLazyComponent(
  () => import('@vayva/industry-legal/dashboard'),
  { loadingFallback: <DashboardSkeleton /> }
);

// Restaurant components
export const RestaurantDashboard = createLazyComponent(
  () => import('@vayva/industry-restaurant/dashboard'),
  { loadingFallback: <DashboardSkeleton /> }
);

// Preload critical components on mount
export async function preloadIndustryComponents(industry: string) {
  switch (industry) {
    case 'healthcare':
      await HealthcareDashboard.preload();
      break;
    case 'legal':
      await LegalDashboard.preload();
      break;
    case 'restaurant':
      await RestaurantDashboard.preload();
      break;
  }
}
```

#### Example: Route-Based Code Splitting

```typescript
// apps/merchant-admin/src/app/dashboard/[industry]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { DashboardSkeleton } from '@/components/skeletons';

export default async function IndustryDashboardPage({
  params
}: {
  params: { industry: string };
}) {
  const DashboardComponent = await getIndustryDashboard(params.industry);
  
  if (!DashboardComponent) {
    notFound();
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardComponent />
    </Suspense>
  );
}

async function getIndustryDashboard(industry: string) {
  // Dynamic imports for code splitting
  switch (industry) {
    case 'healthcare':
      return (await import('@/lib/lazy-industry-components'))
        .HealthcareDashboard;
    case 'legal':
      return (await import('@/lib/lazy-industry-components'))
        .LegalDashboard;
    case 'restaurant':
      return (await import('@/lib/lazy-industry-components'))
        .RestaurantDashboard;
    default:
      return null;
  }
}
```

---

## 2. React.memo Optimizations

### Memoize Expensive Components

```typescript
// packages/industry-core/src/components/memoized-kpi-card.tsx
import React from 'react';

interface KPICardProps {
  value: number;
  trend: number;
  label: string;
  format?: (value: number) => string;
}

// Wrap with React.memo to prevent unnecessary re-renders
export const KPICard = React.memo(function KPICard({
  value,
  trend,
  label,
  format = (v) => v.toString()
}: KPICardProps) {
  console.log('KPICard render'); // Only logs when props change
  
  return (
    <div className="kpi-card">
      <div className="value">{format(value)}</div>
      <div className={`trend ${trend >= 0 ? 'positive' : 'negative'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
      <div className="label">{label}</div>
    </div>
  );
});

// Add displayName for debugging
(KPICard as any).displayName = 'KPICard';
```

### Memoize Widget Collections

```typescript
// packages/industry-core/src/widgets/memoized-dashboard-grid.tsx
import React from 'react';
import { KPICard } from './memoized-kpi-card';
import { TrendChart } from './memoized-trend-chart';

interface DashboardGridProps {
  widgets: Array<{
    id: string;
    type: 'kpi' | 'chart';
    data: any;
  }>;
}

// Memoize entire grid to prevent re-rendering all widgets
export const DashboardGrid = React.memo(function DashboardGrid({
  widgets
}: DashboardGridProps) {
  console.log('DashboardGrid render');
  
  return (
    <div className="dashboard-grid">
      {widgets.map(widget => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}
    </div>
  );
});

// Individual widget renderer with memoization
const WidgetRenderer = React.memo(function WidgetRenderer({
  widget
}: {
  widget: any;
}) {
  switch (widget.type) {
    case 'kpi':
      return <KPICard {...widget.data} />;
    case 'chart':
      return <TrendChart {...widget.data} />;
    default:
      return null;
  }
});
```

---

## 3. useMemo for Expensive Calculations

### Memoize Analytics Aggregations

```typescript
// packages/analytics/src/hooks/use-analytics-metrics.ts
import { useMemo } from 'react';

interface AnalyticsData {
  events: any[];
  metrics: any[];
  trends: any[];
}

export function useAnalyticsMetrics(data: AnalyticsData) {
  // Memoize expensive aggregation calculations
  return useMemo(() => {
    console.log('Aggregating analytics metrics...');
    
    const aggregated = aggregateMetrics(data.events);
    const trends = calculateTrends(aggregated);
    const insights = generateInsights(trends);
    
    return { aggregated, trends, insights };
  }, [data]); // Only recalculate when data changes
}

// Helper functions
function aggregateMetrics(events: any[]) {
  // Expensive O(n) operation
  return events.reduce((acc, event) => {
    // Complex aggregation logic
    return acc;
  }, {});
}

function calculateTrends(aggregated: any) {
  // Another expensive calculation
  return aggregated;
}

function generateInsights(trends: any) {
  // AI-powered insight generation
  return trends;
}
```

### Memoize Filtered Lists

```typescript
// packages/industry-retail/src/components/product-list.tsx
import { useMemo } from 'react';

interface ProductListProps {
  products: Product[];
  filter: string;
  sortBy: string;
}

export function ProductList({ products, filter, sortBy }: ProductListProps) {
  // Memoize filtered and sorted list
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    
    return products
      .filter(p => p.name.includes(filter))
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, filter, sortBy]); // Only recompute when dependencies change
  
  return (
    <div className="product-list">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 4. Virtual Scrolling for Large Lists

### Implement Virtual List

```typescript
// packages/ui/src/components/virtual-list.tsx
import { useRef, useState } from 'react';
import { useVirtualList } from '@vayva/shared/utils/performance';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  const { totalHeight, getVisibleItems } = useVirtualList(
    items,
    itemHeight,
    containerHeight
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const { items: visibleItems, startIndex, offsetY } = getVisibleItems(scrollTop);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflow: 'auto' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => renderItem(item, startIndex + index))}
        </div>
      </div>
    </div>
  );
}
```

### Usage Example

```typescript
// packages/industry-retail/src/components/product-table.tsx
import { VirtualList } from '@vayva/ui';

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <VirtualList
      items={products}
      itemHeight={50}
      containerHeight={600}
      renderItem={(product, index) => (
        <div key={product.id} className="product-row">
          <span>{index + 1}</span>
          <span>{product.name}</span>
          <span>${product.price}</span>
        </div>
      )}
    />
  );
}
```

---

## 5. Image Lazy Loading

### Custom Hook for Lazy Images

```typescript
// packages/ui/src/hooks/use-lazy-image.ts
import { useLazyImage } from '@vayva/shared/utils/performance';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
}

export function LazyImage({ src, alt, placeholderSrc, className }: LazyImageProps) {
  const { imgRef, isLoaded, isInView } = useLazyImage(src, placeholderSrc);

  return (
    <img
      ref={imgRef}
      src={isInView && !isLoaded ? placeholderSrc : src}
      alt={alt}
      className={`${className} ${!isLoaded ? 'loading' : 'loaded'}`}
      loading="lazy"
    />
  );
}
```

---

## 6. Debouncing & Throttling

### Debounced Search

```typescript
// packages/industry-retail/src/components/search-bar.tsx
import { useState } from 'react';
import { useDebounce } from '@vayva/shared/utils/performance';

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce search term by 300ms
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use debounced value for API calls
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchProducts(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search products..."
    />
  );
}
```

### Throttled Scroll Handler

```typescript
// packages/industry-analytics/src/components/scroll-tracker.tsx
import { useEffect } from 'react';
import { useThrottle } from '@vayva/shared/utils/performance';

export function ScrollTracker() {
  const [scrollPosition, setScrollPosition] = useState(0);
  // Throttle scroll updates to every 200ms
  const throttledPosition = useThrottle(scrollPosition, 200);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // throttledPosition updates max 5 times per second
  console.log('Scroll position:', throttledPosition);

  return <div>Scroll: {throttledPosition}px</div>;
}
```

---

## 7. Database Query Optimization

### Add Slow Query Logging

```typescript
// platform/infra/db/src/client.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Middleware to log slow queries
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  const duration = after - before;
  
  if (duration > 100) {
    console.warn(
      `[Slow Query] ${params.model}.${params.action}: ${duration}ms`
    );
  }
  
  return result;
});
```

### Implement Query Caching

```typescript
// Backend/core-api/src/services/cached-analytics.service.ts
import { redis } from '@vayva/redis';
import { prisma } from '@vayva/db';

export class CachedAnalyticsService {
  async getBusinessMetrics(businessId: string, dateRange: DateRange) {
    const cacheKey = `analytics:${businessId}:${dateRange.start}:${dateRange.end}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from database
    const metrics = await prisma.analytics.findMany({
      where: {
        businessId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    });
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(metrics));
    
    return metrics;
  }
}
```

---

## 8. Performance Monitoring

### Add Render Time Tracking

```typescript
// apps/merchant-admin/src/components/DashboardWrapper.tsx
import { useRenderTime } from '@vayva/shared/utils/performance';

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  // Log render time in development
  useRenderTime('DashboardWrapper');
  
  return <div className="dashboard">{children}</div>;
}
```

---

## Verification

After implementing optimizations:

```bash
# 1. Rebuild application
pnpm build

# 2. Analyze new bundle
pnpm analyze:bundle

# 3. Check bundle sizes
pnpm check:bundle

# 4. Run full performance audit
pnpm check:performance
```

### Expected Results

- **Bundle Size**: 23-30% reduction
- **Load Time**: 35-50% improvement
- **Lighthouse Score**: 90-95+
- **React Render Time**: < 16ms (60 FPS)

---

## Best Practices

1. **Always measure before optimizing** - Use `analyze:bundle` to identify bottlenecks
2. **Lazy load everything** - Routes, components, images
3. **Memoize judiciously** - Only for expensive operations
4. **Virtual scroll long lists** - Any list > 20 items
5. **Cache aggressively** - Database queries, API responses
6. **Monitor continuously** - Add performance budgets to CI/CD

---

*For more details, see:*
- [React Performance Documentation](https://react.dev/learn/render-and-commit)
- [Next.js Code Splitting Guide](https://nextjs.org/docs/advanced-features/dynamic-import)
- [VAYVA Performance Audit Script](./scripts/run-performance-audit.sh)
