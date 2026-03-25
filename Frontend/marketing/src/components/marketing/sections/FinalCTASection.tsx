"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  IconArrowRight as ArrowRight,
  IconStar as Star,
  IconCircleCheck as CheckCircle,
  IconPackage as Package,
  IconCreditCard as CreditCard,
} from "@tabler/icons-react";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import { getOfferCopy } from "@/config/pricing";
import { useMarketingOffer } from "@/context/MarketingOfferContext";

// Floating success notification component
function SuccessVisual(): React.JSX.Element {
  return (
    <div className="relative w-[280px] mx-auto">
      {/* Phone Frame */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl shadow-emerald-500/10"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden p-4 pt-8">
          {/* Success State */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Order Confirmed!</p>
            <p className="text-xs text-slate-500 mt-1">#VAY-8942 • ₦47,500</p>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Package className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600 flex-1">2× Ankara Dress</span>
              <span className="text-xs font-medium text-slate-900">₦35,000</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Package className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600 flex-1">1× Leather Bag</span>
              <span className="text-xs font-medium text-slate-900">₦12,500</span>
            </div>
          </motion.div>

          {/* Payment Status */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="mt-3 flex items-center justify-center gap-2 p-2 bg-emerald-50 rounded-lg"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Paid • Card ending 4582</span>
          </motion.div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-700 rounded-full" />
      </motion.div>

      {/* Floating notification badges */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
        className="absolute -left-4 top-8 bg-white rounded-lg p-2 shadow-lg border border-slate-100"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-xs">💰</span>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-900">Payment Received</p>
            <p className="text-[9px] text-slate-500">₦47,500 • Just now</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4 }}
        className="absolute -right-4 top-24 bg-white rounded-lg p-2 shadow-lg border border-slate-100"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs">📦</span>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-900">New Order</p>
            <p className="text-[9px] text-slate-500">From WhatsApp</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function FinalCTASection(): React.JSX.Element {
  const { starterFirstMonthFree } = useMarketingOffer();
  const o = getOfferCopy(starterFirstMonthFree);

  return (
    <section className="section-lg relative overflow-hidden">
      {/* Background with green gradient theme */}
      <div className="absolute inset-0 bg-slate-900">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]"
          style={{
            background: "radial-gradient(ellipse 100% 100% at 50% 0%, rgba(34, 197, 94, 0.2), transparent 70%)"
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[600px] h-[300px]"
          style={{
            background: "radial-gradient(ellipse 100% 100% at 100% 100%, rgba(59, 130, 246, 0.1), transparent 70%)"
          }}
        />
      </div>

      <div className="container-readable relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-slate-400 text-sm">
                Built for Nigerian merchants
              </span>
            </motion.div>

            {/* Headline - emotional, human */}
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
              Get your evenings back.
            </h2>

            <p className="text-xl text-slate-400 mb-8 max-w-xl">
              Set up in 5 minutes. {o.trialBadge}. {o.noCard}.
            </p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link href={`${APP_URL}/signup`}>
                <Button
                  size="lg"
                  className="rounded-full px-8 h-14 text-base font-semibold bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                >
                  Get Vayva Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Final trust note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-sm text-slate-500"
            >
              Questions? Call or WhatsApp us at{" "}
              <a href="tel:+2348000000000" className="text-emerald-400 hover:text-emerald-300">
                +234 800 000 0000
              </a>
            </motion.p>
          </motion.div>

          {/* Right: Visual */}
          <div className="hidden lg:block">
            <SuccessVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
