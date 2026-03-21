import React from "react";
import type { PreviewStore, PreviewProduct } from "@/lib/preview/preview-data";
import { formatCurrency } from "@vayva/shared";
import { Button } from "@vayva/ui";

export function DemoCollection({
  demo,
  activeCategory,
}: {
  demo: PreviewStore;
  activeCategory: string;
}) {
  const items = demo.products.filter((p: PreviewProduct) => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xl font-semibold text-gray-900">
          {activeCategory}
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {items.length} items (demo)
        </div>

        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p: PreviewProduct) => (
            <div key={p.id} className="rounded-xl border p-4 bg-white">
              <div className="overflow-hidden rounded-lg border bg-white/40">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-36 w-full object-cover"
                />
              </div>
              <div className="mt-3 text-sm font-medium text-gray-900">
                {p.name}
              </div>
              <div className="mt-1 text-xs text-gray-400">
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
