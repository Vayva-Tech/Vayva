"use client";

import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DiscountForm } from "@/components/marketing/DiscountForm";

export default async function EditDiscountPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/dashboard/marketing/discounts" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Edit Discount
          </h1>
          <p className="text-text-tertiary text-sm">
            Update your discount rule or coupon settings.
          </p>
        </div>
      </div>

      <DiscountForm id={params.id} />
    </div>
  );
}
