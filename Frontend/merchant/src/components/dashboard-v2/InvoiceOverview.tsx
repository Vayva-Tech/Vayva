"use client";

import { formatCurrency } from "@vayva/shared";

export function InvoiceOverview({
  rows,
  currency,
}: {
  rows: {
    key: string;
    label: string;
    count: number;
    amount: number;
    color: string;
  }[];
  currency: string;
}) {
  const maxCount = Math.max(1, ...rows.map((r) => r.count || 0));

  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const pct = Math.round(
          (Math.min(maxCount, r.count || 0) / maxCount) * 100,
        );
        return (
          <div key={r.key} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-900">
                {r.label}
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                <span className="font-semibold text-gray-900">
                  {r.count}
                </span>
                <span className="px-1">|</span>
                {formatCurrency(Number(r.amount || 0), currency)}
              </div>
            </div>
            <div className="h-3 rounded-full bg-white overflow-hidden">
              <div
                className="h-3 rounded-full"
                style={{ width: `${pct}%`, backgroundColor: r.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
