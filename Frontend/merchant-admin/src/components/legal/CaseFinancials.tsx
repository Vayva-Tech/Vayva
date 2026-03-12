"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { ChartBar } from "@phosphor-icons/react";
import type { CaseFinancialsMetrics } from "@/types/legal";

interface CaseFinancialsProps {
  data?: CaseFinancialsMetrics;
}

export function CaseFinancials({ data }: CaseFinancialsProps) {
  if (!data) return null;

  return (
    <Card className="p-6 border-l-4 border-indigo-700 shadow-lg backdrop-blur-sm bg-white/90">
      <div className="flex items-center gap-2 mb-4">
        <ChartBar size={24} className="text-indigo-700" />
        <h2 className="text-xl font-bold text-text-primary">Case Financials</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-text-secondary">WIP Total</div>
          <div className="text-2xl font-bold text-text-primary">₦{(data.wipTotal / 1000).toFixed(1)}K</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Accounts Receivable</div>
          <div className="text-2xl font-bold text-amber-600">₦{(data.accountsReceivable / 1000).toFixed(1)}K</div>
        </div>
      </div>

      <div className="space-y-3 max-h-48 overflow-y-auto">
        {data.matterProfitability.slice(0, 4).map((matter, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-text-primary">{matter.clientName}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                matter.status === 'on_track' ? 'bg-green-100 text-green-800' :
                matter.status === 'at_risk' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {matter.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-xs text-text-secondary">Budget: ₦{(matter.budget || 0).toLocaleString()} | Billed: ₦{matter.billed.toLocaleString()}</div>
            <div className="text-xs text-text-secondary mt-1">Margin: {matter.margin.toFixed(0)}%</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
