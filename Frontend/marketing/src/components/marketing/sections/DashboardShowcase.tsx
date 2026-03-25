"use client";

import React from "react";
import {
  IconShoppingBag as ShoppingBag,
  IconPackage as Package,
  IconCreditCard as CreditCard,
  IconUsers as Users,
  IconRobot as Bot,
} from "@tabler/icons-react";
import * as motion from "framer-motion/client";

export default function DashboardShowcase(): React.JSX.Element {
  return (
    <section className="py-8 md:py-16 px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-[1400px] mx-auto px-6"
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Everything you need.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              One dashboard.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Orders, payments, inventory, AI insights, customers, analytics — all
            managed from a single powerful interface built for Nigerian
            commerce.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative group max-w-[1200px] mx-auto">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/30 via-primary/20 to-emerald-400/25 rounded-[40px] blur-2xl opacity-60 group-hover:opacity-80 transition duration-1000" />
          
          {/* Mockup container */}
          <div className="relative surface-glass border border-border/60 rounded-[28px] shadow-2xl overflow-hidden p-4">
            {/* Dashboard mock removed */}
          </div>
        </div>

        {/* Feature Highlights Below */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              icon: ShoppingBag,
              label: "Order Management",
              desc: "Track every order from chat to delivery",
            },
            {
              icon: Bot,
              label: "AI Commerce",
              desc: "Auto-capture orders from WhatsApp & Instagram",
            },
            {
              icon: CreditCard,
              label: "Payments",
              desc: "Paystack, bank transfer, USSD — all built in",
            },
            {
              icon: Package,
              label: "Inventory",
              desc: "Real-time stock tracking with alerts",
            },
            {
              icon: Users,
              label: "Customers",
              desc: "Know your best buyers and repeat rates",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl p-5 hover:border-primary/40 hover:shadow-card transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                {f.label}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
