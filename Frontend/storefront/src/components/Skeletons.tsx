import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton(): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i: any) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PDPSkeleton(): React.JSX.Element {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
      <div className="space-y-8 py-4">
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i: any) => (
              <Skeleton key={i} className="h-10 w-16" />
            ))}
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-full mt-10" />
      </div>
    </div>
  );
}
