import React from "react";
import type { DemoStore } from "@/lib/preview/demo-data";
import { formatCurrency } from "@vayva/shared";
import { Button } from "@vayva/ui";

export function DemoCollection({
  demo,
  activeCategory,
}: {
  demo: DemoStore;
  activeCategory: string;
}) {
  const items = demo.products.filter((p) => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="text-xl font-semibold text-text-primary">
          {activeCategory}
        </div>
        <div className="mt-2 text-sm text-text-tertiary">
          {items.length} items (demo)
        </div>

        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-xl border p-4 bg-background">
              <div className="overflow-hidden rounded-lg border bg-white/40">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-36 w-full object-cover"
                />
              </div>
              <div className="mt-3 text-sm font-medium text-text-primary">
                {p.name}
              </div>
              <div className="mt-1 text-xs text-text-tertiary">
                {formatCurrency(p.price)}
              </div>
              <Button
                type="button"
                className="mt-3 w-full rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 h-auto"
              >
                View (preview)
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
