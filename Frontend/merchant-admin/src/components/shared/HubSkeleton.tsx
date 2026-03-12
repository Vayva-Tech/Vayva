"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface HubCardSkeletonProps {
  count?: number;
}

export function HubCardSkeleton({ count = 4 }: HubCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={20} height={20} />
          </div>
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="80%" />
        </Card>
      ))}
    </div>
  );
}

interface StatCardSkeletonProps {
  count?: number;
}

export function StatCardSkeleton({ count = 4 }: StatCardSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton variant="text" width={80} className="mb-1" />
              <Skeleton variant="text" width={40} height={28} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

interface SettingsCardSkeletonProps {
  count?: number;
}

export function SettingsCardSkeleton({ count = 6 }: SettingsCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton variant="text" width="50%" className="mb-1" />
              <Skeleton variant="text" width="80%" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
