"use client";

import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DiscountForm } from "@/components/marketing/DiscountForm";

export default function NewDiscountPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/dashboard/marketing/discounts" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Create Discount
          </h1>
          <p className="text-text-tertiary text-sm">
            Configure a new discount rule or coupon code.
          </p>
        </div>
      </div>

      <DiscountForm />
    </div>
  );
}
