"use client";

import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductFormFactory } from "@/components/products/ProductFormFactory";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/dashboard/products" label="Back to Products" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Add New Product
          </h1>
          <p className="text-text-tertiary text-sm">
            Fill in the details for your new item.
          </p>
        </div>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border/40 p-6">
        <ProductFormFactory />
      </div>
    </div>
  );
}
