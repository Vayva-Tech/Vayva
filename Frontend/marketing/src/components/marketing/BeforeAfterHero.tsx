"use client";

import React from "react";
import * as motion from "framer-motion/client";
import {
  IconCircleX as XCircle,
  IconCircleCheck as CheckCircle,
  IconMessageCircle as MessageSquare,
  IconPackage as Package,
  IconCurrencyDollar as DollarSign,
  IconTrendingUp as TrendingUp,
  IconAlertCircle as AlertCircle,
} from "@tabler/icons-react";
import { useMarketingOffer } from "@/context/MarketingOfferContext";

interface ComparisonPoint {
  label: string;
  before: string;
  after: string;
  icon: React.ElementType;
}

const COMPARISON_POINTS: ComparisonPoint[] = [
  { label: "Order Tracking", before: "Lost in WhatsApp chats", after: "Organized dashboard", icon: Package },
  { label: "Payments", before: "Manual confirmation delays", after: "Instant Paystack payouts", icon: DollarSign },
  { label: "Inventory", before: "Over-selling mistakes", after: "Real-time stock sync", icon: TrendingUp },
  { label: "Customer Data", before: "No records, repeat questions", after: "Saved customer profiles", icon: MessageSquare },
];

export function BeforeAfterHero(): React.JSX.Element {
  const { starterFirstMonthFree } = useMarketingOffer();

  return (
    <section className="py-14 sm:py-16 px-4 relative w-full min-w-0 overflow-x-hidden">
      <div className="max-w-[1760px] mx-auto min-w-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 px-1"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              The Problem Every Nigerian Seller Faces
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            WhatsApp is <span className="text-rose-500 line-through">Chaos</span> → Now It&apos;s{" "}
            <span className="text-primary">Cash Flow</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            <span className="md:hidden">From chaotic chats to organized sales and payouts.</span>
            <span className="hidden md:inline">
              See how Vayva transforms daily WhatsApp chaos into organized sales and automatic payouts
            </span>
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12 min-w-0">
          {/* BEFORE Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-rose-50 rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 border-2 border-rose-200 min-w-0"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-200 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <h3 className="text-xl font-black text-rose-900">Before Vayva</h3>
                <p className="text-sm text-rose-600">Selling on WhatsApp Only</p>
              </div>
            </div>

            <div className="space-y-4">
              {COMPARISON_POINTS.map((point, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/70 rounded-2xl p-4">
                  <point.icon className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">{point.label}</p>
                    <p className="text-sm text-rose-900">{point.before}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual: Stressed Seller */}
            <div className="mt-6 bg-white rounded-3xl p-4 border border-rose-200 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-bold text-sm shrink-0">
                  AO
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">Ade (Phone Seller)</p>
                  <p className="text-xs text-muted-foreground">Ikeja Computer Village</p>
                </div>
                <span className="text-xs text-rose-600 font-medium bg-rose-100 px-2 py-1 rounded-full shrink-0">
                  😰 Stressed
                </span>
              </div>
              <div className="space-y-2">
                <div className="bg-rose-50 rounded-xl p-3 text-xs text-rose-700">
                  &ldquo;How much for iPhone 14?&rdquo; — 47 unread messages
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-xs text-rose-700">
                  Customer: &ldquo;I paid 2 hours ago, where&apos;s my order?&rdquo;
                </div>
              </div>
            </div>
          </motion.div>

          {/* AFTER Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-emerald-50 rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 border-2 border-emerald-200 min-w-0"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-200 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-900">With Vayva</h3>
                <p className="text-sm text-emerald-600">Professional Dashboard</p>
              </div>
            </div>

            <div className="space-y-4">
              {COMPARISON_POINTS.map((point, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/70 rounded-2xl p-4">
                  <point.icon className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">{point.label}</p>
                    <p className="text-sm text-emerald-900">{point.after}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual: Happy Seller */}
            <div className="mt-6 bg-white rounded-3xl p-4 border border-emerald-200 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                  AO
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">Ade (Same Seller)</p>
                  <p className="text-xs text-muted-foreground">Ikeja Computer Village</p>
                </div>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded-full shrink-0">
                  😎 Organized
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 min-w-0">
                <div className="bg-emerald-50 rounded-xl p-2 text-center min-w-0">
                  <p className="text-lg font-black text-emerald-700">23</p>
                  <p className="text-[10px] text-emerald-600">Orders Today</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-2 text-center min-w-0">
                  <p className="text-lg font-black text-emerald-700">₦485k</p>
                  <p className="text-[10px] text-emerald-600">Revenue</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-2 text-center min-w-0">
                  <p className="text-lg font-black text-emerald-700">0</p>
                  <p className="text-[10px] text-emerald-600">Missed</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust Line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center px-1"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-4 text-balance">
            Join <span className="font-bold text-foreground">Nigerian merchants</span> who stopped losing sales and started
            scaling
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Lagos • Abuja • PH • Kano
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Fashion • Electronics • Food • Services
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              {starterFirstMonthFree ? "First month free (Starter)" : "7-day trial (Starter & Pro)"}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
