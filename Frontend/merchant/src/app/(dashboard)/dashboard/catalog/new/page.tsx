"use client";

import { BackButton } from "@/components/ui/BackButton";
import { ProductFormFactory } from "@/components/products/ProductFormFactory";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

export default function NewCatalogItemPage() {
  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tip
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Use clear titles
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Simple names + accurate prices reduce customer questions.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/catalog" label="Back to Catalog" />
          <PageHeader
            title="Add Catalog Item"
            subtitle="Create a new item in your catalog."
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ProductFormFactory />
        </div>
      </PageWithInsights>
    </div>
  );
}

