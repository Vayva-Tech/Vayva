"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { Users } from "@phosphor-icons/react";
import type { ClientMattersMetrics } from "@/types/legal";

interface ClientMattersProps {
  data?: ClientMattersMetrics;
}

export function ClientMatters({ data }: ClientMattersProps) {
  if (!data) return null;

  return (
    <Card className="p-6 border-l-4 border-cyan-700 shadow-lg  bg-white/90">
      <div className="flex items-center gap-2 mb-4">
        <Users size={24} className="text-cyan-700" />
        <h2 className="text-xl font-bold text-gray-900">Client Matters</h2>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {data.activeMatters.slice(0, 5).map((matter, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{matter.clientName}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                matter.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-amber-800'
              }`}>
                {matter.status}
              </span>
            </div>
            <div className="text-xs text-gray-500">{matter.caseNumber} • {matter.practiceArea}</div>
            {matter.retainerBalance !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                Retainer Balance: ₦{matter.retainerBalance.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {(data.lowRetainerAlerts > 0 || data.overdueInvoices > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          {data.lowRetainerAlerts > 0 && (
            <div className="text-xs text-amber-800 bg-orange-50 p-2 rounded">
              ⚠️ {data.lowRetainerAlerts} low retainer alerts
            </div>
          )}
          {data.overdueInvoices > 0 && (
            <div className="text-xs text-red-800 bg-red-50 p-2 rounded">
              ⚠️ {data.overdueInvoices} overdue invoices
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
