export default function Loading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-border rounded animate-pulse" />
          <div className="h-4 w-64 bg-background/30 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-border rounded animate-pulse" />
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="h-12 bg-background/30 border-b border-border/40 flex items-center px-6 gap-4">
          <div className="h-4 w-4 bg-border rounded animate-pulse" />
          <div className="h-4 w-24 bg-background/30 rounded animate-pulse" />
          <div className="h-4 w-32 bg-background/30 rounded animate-pulse" />
          <div className="h-4 w-16 bg-background/30 rounded animate-pulse ml-auto" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 border-b border-border/40 flex items-center px-6 gap-4"
          >
            <div className="h-10 w-10 bg-background/30 rounded-full animate-pulse" />
            <div className="h-4 w-32 bg-background/30 rounded animate-pulse" />
            <div className="h-4 w-48 bg-background/30 rounded animate-pulse" />
            <div className="h-6 w-20 bg-background/30 rounded-full animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
