"use client";
import { DiscountList } from "@/components/marketing/DiscountList";
import { Button } from "@vayva/ui";
import { Tag, Percent, Receipt, TrendUp, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/dashboard/marketing/discounts/new"
                  className="inline-flex items-center justify-between rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  <span>Create discount</span>
                  <Plus size={18} />
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>Analytics</span>
                  <span className="text-xs text-gray-400">30d</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Insight
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Improve conversions
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use 1–2 focused offers. Too many codes reduce purchase confidence.
              </p>
            </div>
          </>
        }
      >
        <PageHeader
          title="Discounts"
          subtitle="Manage automatic discounts and coupon codes"
          actions={
            <Link href="/dashboard/marketing/discounts/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
                <Plus size={18} className="mr-2" />
                Create Discount
              </Button>
            </Link>
          }
        />

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<Tag size={18} />}
          label="Total Discounts"
          value="TBD"
          trend="active"
          positive
        />
        <SummaryWidget
          icon={<Percent size={18} />}
          label="Coupon Codes"
          value="TBD"
          trend="created"
          positive
        />
        <SummaryWidget
          icon={<Receipt size={18} />}
          label="Auto Discounts"
          value="TBD"
          trend="rules"
          positive
        />
        <SummaryWidget
          icon={<TrendUp size={18} />}
          label="Redemptions"
          value="TBD"
          trend="usage"
          positive
        />
      </div>

      {/* Discount List Component */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <DiscountList />
      </div>
      </PageWithInsights>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
