"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { Wallet, AlertTriangle } from "@phosphor-icons/react";
import type { TrustAccountMetrics } from "@/types/legal";

interface TrustAccountProps {
  data?: TrustAccountMetrics;
}

export function TrustAccount({ data }: TrustAccountProps) {
  if (!data) return null;

  return (
    <Card className="p-6 border-l-4 border-emerald-600 shadow-lg backdrop-blur-sm bg-white/90">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={24} className="text-emerald-600" />
          <h2 className="text-xl font-bold text-text-primary">Trust Account</h2>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          data.reconciliationStatus === 'current' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {data.reconciliationStatus === 'current' ? '✓ Reconciled' : '⚠ Overdue'}
        </span>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-text-primary font-serif">
          ₦{data.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-text-secondary">Total Trust Balance</div>
      </div>

      {/* Client Balances */}
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {data.clientBalances.slice(0, 5).map((client, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{client.clientName}</span>
            <span className="font-medium text-text-primary">₦{client.balance.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(data.disbursementsPending > 0 || data.negativeBalanceAlerts > 0) && (
        <div className="space-y-2 pt-4 border-t border-gray-200">
          {data.disbursementsPending > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded">
              <AlertTriangle size={14} />
              <span>{data.disbursementsPending} disbursements pending approval</span>
            </div>
          )}
          {data.negativeBalanceAlerts > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 p-2 rounded">
              <AlertTriangle size={14} />
              <span>{data.negativeBalanceAlerts} negative balance alerts</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
