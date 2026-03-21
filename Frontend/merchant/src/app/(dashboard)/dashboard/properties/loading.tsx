export default function Loading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-border rounded animate-pulse" />
          <div className="h-4 w-64 bg-white rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-white rounded animate-pulse" />
          <div className="h-10 w-32 bg-border rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white  rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-white" />
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white rounded" />
                <div className="h-5 w-3/4 bg-border rounded" />
                <div className="h-4 w-full bg-white rounded" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-8 bg-white rounded" />
                <div className="h-4 w-8 bg-white rounded" />
                <div className="h-4 w-8 bg-white rounded" />
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="h-6 w-24 bg-border rounded" />
                <div className="h-8 w-8 bg-white rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
