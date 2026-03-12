import React from "react";
import type { DemoProduct } from "@/lib/preview/demo-data";
import { Button } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";

export function DemoProductView({ product }: { product: DemoProduct }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 rounded-2xl border bg-background p-6 shadow-sm lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-white/40">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <div className="text-2xl font-semibold text-text-primary">
            {product.name}
          </div>
          <div className="mt-2 text-sm text-text-tertiary">
            {product.category}
          </div>

          <div className="mt-4 text-xl font-semibold text-text-primary">
            {formatCurrency(product.price)}
          </div>
          <div className="mt-3 text-sm text-text-tertiary">
            {product.description}
          </div>

          <div className="mt-6 flex gap-2">
            <Button className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 h-auto">
              Add to cart (preview)
            </Button>
            <Button
              variant="outline"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-white/40 h-auto"
            >
              Buy now (preview)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
