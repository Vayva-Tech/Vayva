import { KitchenBoard } from "@/components/kitchen/KitchenBoard";

export default function KitchenPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kitchen Display</h2>
          <p className="text-muted-foreground">
            Live incoming orders. Auto-refreshes every 15s.
          </p>
        </div>
      </div>

      <KitchenBoard />
    </div>
  );
}
