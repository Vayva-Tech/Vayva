import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      <PageSkeleton variant="cards" columns={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PageSkeleton variant="table" rows={5} />
        </div>
        <div className="rounded-2xl border border-border/40 bg-background/70 p-6 space-y-4 animate-pulse">
          <div className="h-5 w-24 bg-background/30 rounded-xl" />
          <div className="h-48 w-full bg-background/30 rounded-lg" />
          <div className="h-4 w-3/4 bg-background/30 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
