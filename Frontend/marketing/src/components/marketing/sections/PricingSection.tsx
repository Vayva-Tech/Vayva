"use client";

import React, { useMemo } from "react";
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
import {
  PLANS as PRICING_PLANS,
  formatNGN,
  getOfferCopy,
  getStarterPlanPresentation,
} from "@/config/pricing";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";
import { useMarketingOffer } from "@/context/MarketingOfferContext";

const ICONS: Record<string, React.ElementType> = {
  free: Zap,
  starter: Sparkles,
  pro: Crown,
  pro_plus: Crown,
};

type DisplayPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  promoBadge?: string;
  checkoutHref: string;
  icon: React.ElementType;
};

function tierCardClassName(plan: DisplayPlan): string {
  return `relative rounded-3xl p-6 sm:p-8 h-full ${
    plan.popular
      ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md z-10"
      : "bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
  }`;
}

function PricingTierCardBody({ plan }: { plan: DisplayPlan }): React.JSX.Element {
  const Icon = plan.icon;
  return (
    <>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 text-amber-900 text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4" />
            Most popular
          </span>
        </div>
      )}

      {plan.promoBadge && !plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500 text-white text-sm font-semibold shadow-sm">
            <Zap className="w-4 h-4" />
            {plan.promoBadge}
          </span>
        </div>
      )}

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
          plan.popular ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>

      <div className="mb-6">
        <h3 className={`text-xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
          {plan.name}
        </h3>
        <p className={`mt-1 text-sm ${plan.popular ? "text-emerald-100" : "text-slate-500"}`}>
          {plan.description}
        </p>
        {plan.promoBadge ? (
          <p
            className={`mt-2 text-xs font-bold uppercase tracking-wide ${
              plan.popular ? "text-amber-200" : "text-emerald-700"
            }`}
          >
            {plan.promoBadge}
            {plan.popular ? " · monthly via signup" : ""}
          </p>
        ) : null}
      </div>

      <div className="mb-8">
        <span className={`text-4xl sm:text-5xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
          {plan.price}
        </span>
        <span className={`text-lg ${plan.popular ? "text-emerald-200" : "text-slate-500"}`}>
          {plan.period}
        </span>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                plan.popular ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <Check className="w-3 h-3" />
            </div>
            <span className={`text-sm ${plan.popular ? "text-emerald-50" : "text-slate-600"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link href={plan.checkoutHref} className="block">
        <Button
          className={`w-full rounded-xl h-12 font-semibold transition-all ${
            plan.popular
              ? "bg-white hover:bg-emerald-50 text-emerald-700 shadow-sm"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md"
          }`}
        >
          {plan.cta}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </Link>
    </>
  );
}

export function PricingSection(): React.JSX.Element {
  const { starterFirstMonthFree } = useMarketingOffer();
  const offerCopy = getOfferCopy(starterFirstMonthFree);
  const starterPres = getStarterPlanPresentation(starterFirstMonthFree);

  const plans: DisplayPlan[] = useMemo(
    () =>
      PRICING_PLANS.map((plan) => {
        const icon = ICONS[plan.key] ?? Sparkles;
        const isFree = plan.monthlyAmount === 0;
        const starterExtras =
          plan.key === "starter"
            ? { cta: starterPres.ctaLabel, promoBadge: starterPres.promoBadge }
            : { cta: plan.ctaLabel, promoBadge: plan.promoBadge };
        return {
          name: plan.name,
          price: isFree ? "Free" : formatNGN(plan.monthlyAmount),
          period: isFree ? "forever" : "/month",
          description: plan.tagline,
          features: plan.bullets,
          cta: starterExtras.cta,
          popular: Boolean(plan.featured),
          promoBadge: starterExtras.promoBadge,
          checkoutHref: plan.checkoutHref,
          icon,
        };
      }),
    [starterFirstMonthFree],
  );

  return (
    <section className="py-20 sm:py-24 w-full min-w-0 overflow-x-hidden bg-gradient-to-b from-white to-emerald-50/30 relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container-wide relative z-10 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 px-1"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
            Three plans for every growth stage
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 max-w-2xl mx-auto px-1">
            <span className="md:hidden">{offerCopy.trialBadge}. Pro+ paid at checkout.</span>
            <span className="hidden md:inline">{offerCopy.trialFootnote}</span>
          </p>
        </motion.div>

        <p className="text-center text-sm text-slate-600 md:hidden mb-2">Swipe to compare plans</p>
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={tierCardClassName(plan)}
            >
              <PricingTierCardBody plan={plan} />
            </motion.div>
          ))}
        </div>

        <div className="md:hidden -mx-1 pb-2">
          <MarketingSnapRow ariaLabel="Pricing plans" hint="Swipe to compare plans" showDots dotCount={plans.length}>
            {plans.map((plan) => (
              <MarketingSnapItem key={plan.name} className="!w-[min(100%,calc(100vw-2rem))] !max-w-md">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4 }}
                  className={tierCardClassName(plan)}
                >
                  <PricingTierCardBody plan={plan} />
                </motion.div>
              </MarketingSnapItem>
            ))}
          </MarketingSnapRow>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 sm:mt-16 text-center px-2"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-2xl sm:rounded-full bg-white shadow-sm border border-emerald-100 max-w-full mx-auto min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-sm text-slate-600 text-left sm:text-center min-w-0 max-w-2xl">
              {offerCopy.trialFootnote}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
