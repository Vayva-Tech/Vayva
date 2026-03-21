// @ts-nocheck
"use client";

import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DiscountForm } from "@/components/marketing/DiscountForm";
import { useParams } from "next/navigation";

export default function EditDiscountPage() {
  const params = useParams();
  const id = params.id as string;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/dashboard/marketing/discounts" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Discount
          </h1>
          <p className="text-gray-500 text-sm">
            Update your discount rule or coupon settings.
          </p>
        </div>
      </div>

      <DiscountForm id={id} />
    </div>
  );
}
