"use client";

import React from "react";
import * as motion from "framer-motion/client";
import {
  ShoppingCart,
  Bot,
  Wallet,
  Package,
  Users,
  BarChart3,
} from "lucide-react";

// ============================================
// SECTION: DASHBOARD FEATURES PREVIEW
// ============================================
const features = [
  {
    icon: ShoppingCart,
    title: "Order Management",
    description:
      "Track orders from capture to delivery. Kanban boards and timeline views keep everything organized.",
    stat: "156",
    statLabel: "orders this week",
  },
  {
    icon: Bot,
    title: "AI Commerce Agent",
    description:
      "WhatsApp and Instagram conversations automatically converted into structured orders with AI.",
    stat: "847",
    statLabel: "conversations captured",
  },
  {
    icon: Wallet,
    title: "Payments & Payouts",
    description:
      "Paystack-powered cards, transfers, USSD, and mobile money. Automatic reconciliation.",
    stat: "₦2.1M",
    statLabel: "revenue this month",
  },
  {
    icon: Package,
    title: "Inventory Tracking",
    description:
      "Real-time stock levels with low-stock alerts. Multi-location warehouse support on Pro.",
    stat: "99.2%",
    statLabel: "accuracy rate",
  },
  {
    icon: Users,
    title: "Customer Insights",
    description:
      "Know your top customers, track repeat purchase rates, and send targeted campaigns.",
    stat: "1,234",
    statLabel: "active customers",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Revenue trends, conversion rates, AI performance metrics — all in real-time dashboards.",
    stat: "3.24%",
    statLabel: "conversion rate",
  },
];

export function DashboardPreviewSection(): React.JSX.Element {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-white to-emerald-50/30 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-4 block">
            Everything You Need
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto">
            Manage everything from{" "}
            <span className="text-emerald-600">one powerful dashboard</span>
          </h2>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
            Orders, payments, inventory, AI insights, customers, analytics — all
            managed from a single powerful interface.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <feature.icon size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="text-2xl font-bold text-emerald-600">
                  {feature.stat}
                </span>
                <span className="text-xs text-slate-500">
                  {feature.statLabel}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
