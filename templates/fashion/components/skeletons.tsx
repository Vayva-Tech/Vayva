import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-stone-200 rounded-2xl mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-none" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-stone-200 rounded-2xl relative mb-6">
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
          <Skeleton className="h-4 w-12 rounded-full ml-2" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-32 rounded-none" />
        </div>
      </div>
    </div>
  );
}

export function FilterSidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <Skeleton className="h-5 w-20 rounded-full mb-4" />
        <Skeleton className="h-10 w-full rounded-none" />
      </div>
      <div>
        <Skeleton className="h-5 w-24 rounded-full mb-4" />
        <Skeleton className="h-10 w-full rounded-none" />
      </div>
      <div>
        <Skeleton className="h-5 w-28 rounded-full mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-3/4 rounded-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-20 rounded-full mb-4" />
        <Skeleton className="h-10 w-full rounded-none" />
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="animate-pulse border-b border-stone-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-full" />
          <div className="hidden md:flex items-center gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 rounded-full" />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse bg-stone-100">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Skeleton className="h-5 w-48 rounded-full mx-auto" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-full" />
            <Skeleton className="h-16 w-4/5 rounded-full mx-auto" />
          </div>
          <Skeleton className="h-5 w-80 rounded-full mx-auto" />
          <div className="pt-4">
            <Skeleton className="h-12 w-48 rounded-none mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}