"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  IconCheck as Check,
  IconArrowRight as ArrowRight,
  IconSparkles as Sparkles,
  IconBolt as Zap,
  IconCrown as Crown,
} from "@tabler/icons-react";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import { PLANS as PRICING_PLANS, formatNGN } from "@/config/pricing";

const ICONS: Record<string, React.ElementType> = {
  free: Zap,
  starter: Sparkles,
  pro: Crown,
};

export function PricingSection(): React.JSX.Element {
  const plans = PRICING_PLANS.map((plan) => {
    const icon = ICONS[plan.key] ?? Sparkles;
    const isFree = plan.monthlyAmount === 0;
    return {
      name: plan.name,
      price: isFree ? "Free" : formatNGN(plan.monthlyAmount),
      period: isFree ? "forever" : "/month",
      description: plan.tagline,
      features: plan.bullets,
      cta: plan.ctaLabel,
      popular: Boolean(plan.featured),
      icon,
      color: "emerald",
    };
  });

  return (
    <section className="py-24 bg-gradient-to-b from-white to-emerald-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />

      <div className="container-wide relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            One plan fits your stage
          </h2>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-2xl shadow-emerald-200 scale-105 md:scale-110 z-10"
                    : "bg-white border border-emerald-100 shadow-xl shadow-emerald-100/50 hover:shadow-emerald-200/50 transition-shadow"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 text-amber-900 text-sm font-semibold shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Most popular
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.popular
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-600"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Plan name & description */}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${
                    plan.popular ? "text-white" : "text-slate-900"
                  }`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    plan.popular ? "text-emerald-100" : "text-slate-500"
                  }`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span className={`text-5xl font-bold ${
                    plan.popular ? "text-white" : "text-slate-900"
                  }`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${
                    plan.popular ? "text-emerald-200" : "text-slate-500"
                  }`}>
                    {plan.period}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-600"
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={`text-sm ${
                        plan.popular ? "text-emerald-50" : "text-slate-600"
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={`${APP_URL}/signup`} className="block">
                  <Button
                    className={`w-full rounded-xl h-12 font-semibold transition-all ${
                      plan.popular
                        ? "bg-white hover:bg-emerald-50 text-emerald-700 shadow-lg"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-lg border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm text-slate-600">
              <span className="font-medium text-emerald-700">7-day free trial</span> on paid plans. 
              Cancel anytime. No credit card required.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
