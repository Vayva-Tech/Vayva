import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { Card, CardContent } from "@vayva/ui";

export default function Loading() {
  return (
    <DashboardPageShell
      title="Rescue Operations"
      description="Loading..."
    >
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white  p-4 rounded-xl border border-gray-100 animate-pulse">
            <div className="h-2 bg-gray-100 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-100 rounded w-12"></div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-100 rounded w-32"></div>
                <div className="h-3 bg-gray-100 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardPageShell>
  );
}
