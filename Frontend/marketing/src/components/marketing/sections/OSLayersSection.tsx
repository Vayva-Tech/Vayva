"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, CreditCard, Package, Truck, BarChart3, Users } from "lucide-react";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

const layers = [
  {
    icon: MessageCircle,
    title: "Order Management",
    description: "WhatsApp & Instagram messages become organized orders",
    color: "bg-blue-500",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description: "Cards, transfers, USSD—all payment methods work seamlessly",
    color: "bg-emerald-500",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: Package,
    title: "Inventory Intelligence",
    description: "Track stock, get alerts, know what to reorder",
    color: "bg-purple-500",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Truck,
    title: "Delivery Operations",
    description: "Live tracking, customer updates, proof of delivery",
    color: "bg-orange-500",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Users,
    title: "Customer Intelligence",
    description: "Know your customers, their preferences, purchase history",
    color: "bg-indigo-500",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description: "Revenue trends, product insights, forecasting",
    color: "bg-rose-500",
    gradient: "from-rose-500 to-pink-500",
  },
];

function LayerCard({
  layer,
  index,
}: {
  layer: (typeof layers)[number];
  index: number;
}): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group h-full"
    >
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm h-full group-hover:-translate-y-1 group-hover:shadow-md transition-all">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${layer.gradient} flex items-center justify-center text-white mb-4`}
        >
          <layer.icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{layer.title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{layer.description}</p>
      </div>
    </motion.div>
  );
}

export function OSLayersSection(): React.JSX.Element {
  return (
    <section className="py-24 px-4 sm:px-6 w-full min-w-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto min-w-0">
        <div className="text-center mb-16 px-1">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold mb-4">
            Why "operating system" matters
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Not just tools.<span className="text-emerald-600"> Infrastructure.</span>
          </h2>
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto">
            <span className="md:hidden">
              One system for messages, payments, stock, and delivery—swipe the layers.
            </span>
            <span className="hidden md:inline">
              Like Windows runs your laptop, Vayva runs your business—coordinating every message,
              payment, product, and delivery in one unified system.
            </span>
          </p>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layers.map((layer, index) => (
            <LayerCard key={layer.title} layer={layer} index={index} />
          ))}
        </div>
        <div className="md:hidden -mx-1">
          <MarketingSnapRow
            ariaLabel="Operating system layers"
            hint="Swipe through each layer"
            showDots
            dotCount={layers.length}
          >
            {layers.map((layer, index) => (
              <MarketingSnapItem key={layer.title}>
                <LayerCard layer={layer} index={index} />
              </MarketingSnapItem>
            ))}
          </MarketingSnapRow>
        </div>
      </div>
    </section>
  );
}
