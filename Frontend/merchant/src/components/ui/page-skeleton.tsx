interface PageSkeletonProps {
  variant?: "table" | "cards" | "form" | "detail";
  rows?: number;
  columns?: number;
}

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl animate-pulse ${className || ""}`}
    />
  );
}

export function PageSkeleton({
  variant = "table",
  rows = 5,
  columns = 3,
}: PageSkeletonProps) {
  if (variant === "cards") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Bone className="h-8 w-48" />
          <Bone className="h-10 w-32 rounded-lg" />
        </div>
        <div
          className={`grid grid-cols-1 md:grid-cols-${Math.min(columns, 4)} gap-6`}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className="bg-white  p-6 rounded-2xl border border-gray-100 h-32 flex flex-col justify-between animate-pulse"
            >
              <Bone className="h-4 w-24" />
              <Bone className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Bone className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Bone className="h-4 w-16" />
            <Bone className="h-7 w-40" />
          </div>
        </div>
        <div className="rounded-[24px] border border-gray-100 bg-white p-6 space-y-5 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Bone className="h-4 w-20" />
                <Bone className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Bone className="h-4 w-16" />
            <Bone className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Bone className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Bone className="h-7 w-48" />
            <Bone className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 space-y-4 animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Bone className="h-4 w-24" />
                <Bone className="h-4 flex-1" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4 animate-pulse">
            <Bone className="h-5 w-24" />
            <Bone className="h-32 w-full rounded-lg" />
            <Bone className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Default: table variant
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Bone className="h-8 w-48" />
        <Bone className="h-10 w-32 rounded-lg" />
      </div>
      <div className="bg-white  rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-12 bg-white border-b border-gray-100" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-16 border-b border-gray-100 flex items-center px-6 gap-8 animate-pulse"
          >
            <Bone className="h-4 w-48" />
            <Bone className="h-4 w-24" />
            <Bone className="h-6 w-20 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
