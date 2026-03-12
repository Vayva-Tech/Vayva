"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  TrendUp as Users,
  CurrencyDollar as ArrowRight,
  Lightning as Zap,
  Percent,
  CreditCard,
  ShieldWarning as ShieldAlert,
} from "@phosphor-icons/react/ssr";

export const MarketplaceMetrics = () => {
  return (
    <div className="bg-white/40 border border-border/40 rounded-xl p-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Marketplace</h3>
          <p className="text-sm text-text-secondary mt-1">
            Manage your marketplace listings, vendors, and commissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export const OpsActionCards = ({
  onAction,
}: {
  onAction: (route: string) => void;
}) => {
  const actions = [
    {
      title: "Vendor Management",
      description: "Approve, suspend, or invite new branch vendors.",
      icon: "Users",
      route: "/dashboard/ops-console/vendors",
      color: "bg-blue-600",
    },
    {
      title: "Commission Logs",
      description: "Track platform revenue from every vendor sale.",
      icon: "Percent",
      route: "/dashboard/ops-console/commissions",
      color: "bg-green-600",
    },
    {
      title: "Payout Terminal",
      description: "Manage settlements and bank transfers to partners.",
      icon: "CreditCard",
      route: "/dashboard/finance/payouts",
      color: "bg-purple-600",
    },
    {
      title: "Compliance & Safety",
      description: "Review flagged products or suspicious activity.",
      icon: "ShieldAlert",
      route: "/dashboard/ops-console/safety",
      color: "bg-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {actions.map((action, i) => (
        <Card
          key={i}
          className="group hover:border-black transition-all cursor-pointer overflow-hidden border-border/40"
          onClick={() => onAction(action.route)}
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-xl ${action.color} text-white shadow-lg shadow-black/10`}
              >
                {action.icon === "Users" && <Users size={20} />}
                {action.icon === "Percent" && <Percent size={20} />}
                {action.icon === "CreditCard" && <CreditCard size={20} />}
                {action.icon === "ShieldAlert" && <ShieldAlert size={20} />}
              </div>
              <h3 className="font-black text-text-primary">{action.title}</h3>
            </div>
            <p className="text-sm text-text-tertiary mb-6 flex-1">
              {action.description}
            </p>
            <div className="flex items-center text-xs font-bold text-text-tertiary group-hover:text-black transition-colors uppercase tracking-widest gap-2">
              Manage Center <ArrowRight size={14} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
