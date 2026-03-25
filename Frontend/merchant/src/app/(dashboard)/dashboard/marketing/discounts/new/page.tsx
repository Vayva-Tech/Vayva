"use client";

import { BackButton } from "@/components/ui/BackButton";
import { DiscountForm } from "@/components/marketing/DiscountForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

export default function NewDiscountPage() {
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
                Keep it clear
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use simple names like “WELCOME10” so customers remember it.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/marketing/discounts" />
          <PageHeader
            title="Create Discount"
            subtitle="Configure a new discount rule or coupon code."
          />
        </div>

        <DiscountForm />
      </PageWithInsights>
    </div>
  );
}
