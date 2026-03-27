/**
 * Lazy Loading Utilities
 * Performance optimizations for heavy components
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@vayva/ui';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
export interface LazyLoadOptions {
  fallback?: React.ReactNode;
  skeletonHeight?: string;
  skipSuspense?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Default Fallback Loader                                             */
/* ------------------------------------------------------------------ */
export function DefaultLoader({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`w-full ${height} flex items-center justify-center`}>
      <Skeleton className="w-full h-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lazy Load Component with Fallback                                   */
/* ------------------------------------------------------------------ */
export function lazyLoad<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadOptions = {}
) {
  const {
    fallback,
    skeletonHeight = 'h-96',
    skipSuspense = false,
  } = options;

  const Component = lazy(importFn);

  const LazyComponent = (props: T) => {
    const fallbackElement = fallback || <DefaultLoader height={skeletonHeight} />;

    if (skipSuspense) {
      return <Component {...props} />;
    }

    return (
      <Suspense fallback={fallbackElement}>
        <Component {...props} />
      </Suspense>
    );
  };

  return LazyComponent;
}

/* ------------------------------------------------------------------ */
/*  Image Lazy Loader with Blur Placeholder                            */
/* ------------------------------------------------------------------ */
interface ImageLazyProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderColor?: string;
}

export function ImageLazy({ 
  src, 
  alt, 
  placeholderColor = '#f3f4f6',
  className = '',
  ...props 
}: ImageLazyProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`bg-gray-100 animate-pulse ${className}`}
      style={{ backgroundColor: placeholderColor }}
      loading="lazy"
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Chart Lazy Loader (for heavy chart components)                      */
/* ------------------------------------------------------------------ */
export function ChartLazyLoader() {
  return (
    <div className="w-full h-80 p-6 border rounded-xl bg-white">
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table Lazy Loader (for large data tables)                           */
/* ------------------------------------------------------------------ */
export function TableLazyLoader({ rows = 10 }: { rows?: number }) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card Grid Lazy Loader (for product/customer cards)                  */
/* ------------------------------------------------------------------ */
export function CardGridLazyLoader({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-xl p-4 space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Intersection Observer Hook for Lazy Loading                         */
/* ------------------------------------------------------------------ */
export { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
