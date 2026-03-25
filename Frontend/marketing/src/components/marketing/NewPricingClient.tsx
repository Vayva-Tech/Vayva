"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import { pricingFaqs } from "@/data/marketing-content";
import {
  PLANS,
  formatNGN,
  getOfferCopy,
  getPricingPrimaryFaq,
  getStarterPlanPresentation,
  QUARTERLY_DISCOUNT_PERCENT,
  type Plan,
} from "@/config/pricing";
import { PlanComparisonMobile } from "@/components/pricing/PlanComparisonMobile";
import { cn } from "@/lib/utils";
import { useMarketingOffer } from "@/context/MarketingOfferContext";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

const MOBILE_BULLET_CAP = 3;
const MOBILE_FAQ_INITIAL = 3;

function resolvePlanHref(href: string): string {
  if (href.startsWith("/signup")) {
    return `${APP_URL}${href}`;
  }

  return href;
}

function PricingTierCard({
  plan,
  bulletLimit,
  motionProps,
  inGroup = false,
}: {
  plan: Plan;
  bulletLimit?: number;
  motionProps?: {
    initial?: { opacity: number; y: number };
    whileInView?: { opacity: number; y: number };
    viewport?: { once: boolean };
    transition?: { delay: number };
  };
  inGroup?: boolean;
}): React.JSX.Element {
  const bullets =
    bulletLimit != null ? plan.bullets.slice(0, bulletLimit) : plan.bullets;
  const hasMore =
    bulletLimit != null && plan.bullets.length > bulletLimit;

  const aiAllowance = (() => {
    if (plan.key === "starter") return "600 AI messages / month";
    if (plan.key === "pro") return "800 AI messages / month + Autopilot";
    return "1,200 AI messages / month + Autopilot + Voice";
  })();

  const inner = (
    <>
      {!inGroup ? (
        <>
          <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-emerald-500/20 backdrop-blur-xl overflow-hidden" />
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400/30 to-purple-400/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-400/30 to-emerald-400/30 blur-3xl" />
        </>
      ) : null}

      <div
        className={cn(
          "relative p-6 sm:p-8 h-full flex flex-col bg-white/95",
          inGroup
            ? "rounded-none border-0 shadow-none"
            : "rounded-[34px] border border-slate-200/80 shadow-sm",
        )}
      >
        {plan.featured && (
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700">
            Most popular
          </span>
        )}
        <h3 className="mt-4 text-xl font-semibold text-slate-900">
          {plan.name}
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-snug">{plan.tagline}</p>
        {plan.promoBadge ? (
          <p className="mt-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">{plan.promoBadge}</p>
        ) : null}
        <div className="mt-6 flex items-end gap-2">
          <span className="text-3xl sm:text-4xl font-semibold text-slate-900 tabular-nums">
            {formatNGN(plan.monthlyAmount)}
          </span>
          <span className="text-sm text-slate-500 pb-1">/month</span>
        </div>
        <div className="mt-3 inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {aiAllowance}
        </div>
        <ul className="mt-6 space-y-2.5 text-sm flex-grow">
          {bullets.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-700 leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <p className="mt-3 text-xs text-slate-500">
            +{plan.bullets.length - bulletLimit!} more in full comparison below
          </p>
        )}
        <div className="mt-8 flex flex-col gap-2">
          <Link href={resolvePlanHref(plan.checkoutHref)} className="block">
            <Button className="w-full py-5 sm:py-6 rounded-2xl text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
              {plan.ctaLabel}
            </Button>
          </Link>
          <a
            href="#plan-comparison"
            className="text-center text-sm font-semibold text-slate-600 hover:text-emerald-700"
          >
            Compare plans →
          </a>
        </div>
      </div>
    </>
  );

  if (motionProps) {
    return (
      <motion.div
        className="relative h-full min-w-0 overflow-hidden"
        initial={motionProps.initial}
        whileInView={motionProps.whileInView}
        viewport={motionProps.viewport}
        transition={motionProps.transition}
      >
        {inner}
      </motion.div>
    );
  }

  return <div className="relative h-full min-w-0 overflow-hidden">{inner}</div>;
}

export function NewPricingClient(): React.JSX.Element {
  const [faqExpanded, setFaqExpanded] = useState(false);
  const { starterFirstMonthFree } = useMarketingOffer();
  const offerCopy = getOfferCopy(starterFirstMonthFree);
  const displayPlans = useMemo(
    () =>
      PLANS.map((p) =>
        p.key === "starter"
          ? { ...p, ...getStarterPlanPresentation(starterFirstMonthFree) }
          : p,
      ),
    [starterFirstMonthFree],
  );

  const resolvedPricingFaqs = useMemo(() => {
    const primary = getPricingPrimaryFaq(starterFirstMonthFree);
    return [
      { question: primary.question, answer: primary.answer },
      ...pricingFaqs.slice(1),
    ];
  }, [starterFirstMonthFree]);

  return (
    <div className="relative text-slate-900 bg-transparent w-full min-w-0">
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-slate-700 shadow-sm">
            Transparent pricing
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 sm:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-balance"
          >
            Choose the plan that fits your stage
            <span className="relative ml-1 sm:ml-2 inline-flex text-emerald-600">
              with confidence
              <svg
                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full hidden sm:block"
                viewBox="0 0 200 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 8C50 4 150 4 198 8"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto text-pretty"
          >
            AI automation and local payments on every plan.
            <span className="hidden md:inline">
              {" "}
              At checkout, quarterly billing saves {QUARTERLY_DISCOUNT_PERCENT}%
              vs three monthly payments.
            </span>
          </motion.p>
        </div>
      </section>

      {/* Desktop: 3-column grid */}
      <section className="py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 hidden md:block">
          <div className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-slate-200/70">
          {displayPlans.map((plan, index) => (
            <PricingTierCard
              key={plan.key}
              plan={plan}
              inGroup
              motionProps={{
                initial: { opacity: 0, y: 30 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { delay: index * 0.1 },
              }}
            />
          ))}
            </div>
          </div>
        </div>

        {/* Mobile: horizontal snap carousel */}
        <div className="md:hidden w-full min-w-0">
          <MarketingSnapRow
            ariaLabel="Pricing plans"
            hint="Swipe to compare plans"
            hintSub="One card at a time · snap to each tier"
            showDots
            dotCount={displayPlans.length}
            trackClassName="pb-4"
          >
            {displayPlans.map((plan) => (
              <MarketingSnapItem key={plan.key} className="!max-w-[380px]">
                <PricingTierCard plan={plan} bulletLimit={MOBILE_BULLET_CAP} />
              </MarketingSnapItem>
            ))}
          </MarketingSnapRow>
          <div className="mt-6 flex justify-center px-4">
            <a
              href="#plan-comparison"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Jump to full comparison →
            </a>
          </div>
        </div>
      </section>

      <section id="plan-comparison" className="py-12 sm:py-20 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 font-semibold">
                Plan comparison
              </p>
              <h2 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-black text-balance">
                Compare features across plans
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                <span className="md:hidden">
                  Pick a plan above, then tap through capabilities — or open the
                  full table on a larger screen.
                </span>
                <span className="hidden md:inline">
                  Every plan includes core business tools. Upgrade anytime to
                  unlock advanced features and scale your operations.
                </span>
              </p>
            </div>
            <Link
              href="/contact"
              className="text-sm font-semibold text-emerald-700 shrink-0"
            >
              Talk to sales →
            </Link>
          </div>

          <div className="mt-8 md:hidden">
            <PlanComparisonMobile plans={displayPlans} />
          </div>

          <div className="mt-10 hidden md:block overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full text-sm min-w-0">
              <thead className="bg-gradient-to-r from-emerald-50 to-purple-50 text-slate-700">
                <tr>
                  <th className="text-left p-5 font-bold text-base">
                    Capability
                  </th>
                  <th className="text-left p-5 font-bold text-base">Starter</th>
                  <th className="text-left p-5 font-bold text-base">Pro</th>
                  <th className="text-left p-5 font-bold text-base">Pro+</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    name: "Staff seats",
                    starter: "1",
                    pro: "3",
                    proPlus: "5",
                    desc: "Teammates on your account",
                  },
                  {
                    name: "Templates",
                    starter: "1 included",
                    pro: "2 included",
                    proPlus: "5 included",
                    desc: "Storefront templates (more from library)",
                  },
                  {
                    name: "Products",
                    starter: "Up to 100",
                    pro: "Up to 300",
                    proPlus: "Up to 500",
                    desc: "Catalog size",
                  },
                  {
                    name: "Automation",
                    starter: "WhatsApp & Instagram",
                    pro: "WhatsApp & Instagram",
                    proPlus: "WhatsApp & Instagram",
                    desc: "AI order capture",
                  },
                  {
                    name: "Industry dashboards",
                    starter: "Not included",
                    pro: "Included",
                    proPlus: "Included + merged view",
                    desc: "Industry-specific operations",
                  },
                  {
                    name: "Workflow builder",
                    starter: "Not included",
                    pro: "Not included",
                    proPlus: "Visual builder",
                    desc: "Drag-and-drop automation",
                  },
                  {
                    name: "API access",
                    starter: "Not included",
                    pro: "Included",
                    proPlus: "Included",
                    desc: "Integrations",
                  },
                  {
                    name: "Support",
                    starter: "Standard",
                    pro: "Dedicated manager",
                    proPlus: "Priority support",
                    desc: "How we help you grow",
                  },
                ].map((row) => (
                  <tr
                    key={row.name}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-5">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {row.desc}
                      </div>
                    </td>
                    <td className="p-5 text-emerald-700 font-semibold">
                      {row.starter}
                    </td>
                    <td className="p-5 text-slate-900 font-medium">{row.pro}</td>
                    <td className="p-5 text-purple-700 font-semibold">
                      {row.proPlus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-black text-center text-balance">
            Frequently asked questions
          </h2>
          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6">
            {resolvedPricingFaqs.map((faq, index) => (
              <div
                key={faq.question}
                className={cn(
                  "rounded-2xl sm:rounded-[34px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm",
                  !faqExpanded &&
                    index >= MOBILE_FAQ_INITIAL &&
                    "hidden md:block",
                )}
              >
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  {faq.question}
                </h3>
                <p className="mt-2 sm:mt-3 text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          {resolvedPricingFaqs.length > MOBILE_FAQ_INITIAL && (
            <div className="mt-6 flex justify-center md:hidden">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFaqExpanded((e) => !e)}
                className="text-sm font-semibold text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50/50 h-auto hover:bg-emerald-50"
              >
                {faqExpanded
                  ? "Show fewer questions"
                  : `Show all ${resolvedPricingFaqs.length} questions`}
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 text-center text-slate-900">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-balance">
            Let’s build your commerce engine.
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            {offerCopy.trialFootnote}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 sm:px-7 py-5 sm:py-6 rounded-2xl text-base font-semibold shadow-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-2 border-slate-900/15 text-slate-700 hover:bg-white/60 px-6 sm:px-7 py-5 sm:py-6 rounded-2xl text-base font-semibold"
              >
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
