export default function Loading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-border rounded animate-pulse" />
          <div className="h-4 w-64 bg-white rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-border rounded animate-pulse" />
      </div>

      <div className="bg-white  rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-12 bg-white border-b border-gray-100 flex items-center px-6 gap-4">
          <div className="h-4 w-4 bg-border rounded animate-pulse" />
          <div className="h-4 w-24 bg-white rounded animate-pulse" />
          <div className="h-4 w-32 bg-white rounded animate-pulse" />
          <div className="h-4 w-16 bg-white rounded animate-pulse ml-auto" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 border-b border-gray-100 flex items-center px-6 gap-4"
          >
            <div className="h-4 w-4 bg-white rounded animate-pulse" />
            <div className="h-4 w-24 bg-white rounded animate-pulse" />
            <div className="h-4 w-48 bg-white rounded animate-pulse" />
            <div className="h-6 w-20 bg-white rounded-full animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
