"use client";

import { formatCurrency, formatDate } from "@vayva/shared";
import { Icon } from "@vayva/ui";

interface Transaction {
  id: string;
  reference: string;
  type: "CHARGE" | "REFUND" | "PAYOUT";
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  date: string;
  provider: string;
}

interface MobileTransactionCardProps {
  transaction: Transaction;
  onClick: () => void;
}

const TypeBadge = ({ type }: { type: string }) => {
  const config = {
    CHARGE: {
      icon: "ArrowDownLeft" as const,
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Sale",
    },
    PAYOUT: {
      icon: "ArrowUpRight" as const,
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Payout",
    },
    REFUND: {
      icon: "RefreshCcw" as const,
      bg: "bg-orange-100",
      text: "text-orange-700",
      label: "Refund",
    },
  };
  const { icon, bg, text, label } =
    config[type as keyof typeof config] || config.CHARGE;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${bg}`}
    >
      <Icon name={icon} className={`h-3 w-3 ${text}`} />
      <span className={`text-xs font-medium ${text}`}>{label}</span>
    </div>
  );
};

export function MobileTransactionCard({
  transaction,
  onClick,
}: MobileTransactionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-background border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => (e.key === "Enter" || e.key === " ") && onClick()}
      aria-label={`View transaction ${transaction.reference}`}
    >
      {/* Header: Amount and Status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(transaction.amount, transaction.currency)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDate(transaction.date)}
          </p>
        </div>
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            transaction.status === "SUCCESS"
              ? "bg-emerald-100 text-emerald-700"
              : transaction.status === "FAILED"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
          }`}
        >
          {transaction.status}
        </span>
      </div>

      {/* Type Badge */}
      <div className="mb-3">
        <TypeBadge type={transaction.type} />
      </div>

      {/* Reference and Provider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Reference</span>
          <span className="font-mono text-slate-700">
            {transaction.reference.slice(0, 16)}...
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Provider</span>
          <span className="text-slate-700">{transaction.provider}</span>
        </div>
      </div>

      {/* Tap indicator */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center">
        <span className="text-xs text-slate-400">Tap for details</span>
        <Icon name="ChevronRight" className="h-3 w-3 text-slate-400 ml-1" />
      </div>
    </div>
  );
}
