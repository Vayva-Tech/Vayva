import { Card, CardContent } from "@vayva/ui";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-96"></div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-100 rounded w-32 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex justify-end gap-4 mt-6 animate-pulse">
        <div className="h-10 bg-gray-100 rounded w-24"></div>
        <div className="h-10 bg-gray-100 rounded w-32"></div>
      </div>
    </div>
  );
}
