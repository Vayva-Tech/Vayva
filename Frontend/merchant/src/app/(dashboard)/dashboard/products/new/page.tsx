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
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Product
          </h1>
          <p className="text-gray-500 text-sm">
            Fill in the details for your new item.
          </p>
        </div>
      </div>

      <div className="bg-white  rounded-xl shadow-sm border border-gray-100 p-6">
        <ProductFormFactory />
      </div>
    </div>
  );
}
