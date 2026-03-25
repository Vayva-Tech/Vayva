"use client";
import { BackButton } from "@/components/ui/BackButton";
import { DiscountForm } from "@/components/marketing/DiscountForm";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

export default function EditDiscountPage() {
  const params = useParams();
  const rawId = params?.id;
  const id =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-sm text-muted-foreground">
        Missing discount id.
      </div>
    );
  }

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
                Watch the margin
              </div>
              <p className="text-sm text-gray-500 mt-1">
                If you’re stacking discounts, double-check profit stays healthy.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/marketing/discounts" />
          <PageHeader
            title="Edit Discount"
            subtitle="Update your discount rule or coupon settings."
          />
        </div>

        <DiscountForm id={id} />
      </PageWithInsights>
    </div>
  );
}
