"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { APP_URL } from "@/lib/constants";
import { Button } from "@vayva/ui";
import { AutopilotDemo } from "@/components/marketing/AutopilotDemo";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";
import { formatNGN, getOfferCopy, PLANS } from "@/config/pricing";
import { useMarketingOffer } from "@/context/MarketingOfferContext";

const aiRules = [
  {
    category: "Inventory",
    icon: "📦",
    color: "blue",
    rules: [
      { name: "Dead Stock Detection", desc: "Flags products with 0 sales in 30+ days" },
      { name: "Low Stock Alerts", desc: "Predicts stockouts based on velocity" },
      { name: "Overstock Warnings", desc: "Identifies excess inventory vs sales rate" },
      { name: "Slow Mover Analysis", desc: "Spots declining sales trends" },
    ],
  },
  {
    category: "Pricing",
    icon: "💰",
    color: "emerald",
    rules: [
      { name: "Dynamic Pricing", desc: "Recommends price changes based on demand" },
      { name: "Flash Sale Opportunities", desc: "Identifies products for time-limited sales" },
      { name: "Margin Analysis", desc: "Highlights products with low margins" },
      { name: "Competitor Benchmark", desc: "Compares your prices to market" },
    ],
  },
  {
    category: "Marketing",
    icon: "🎯",
    color: "amber",
    rules: [
      { name: "Product Description AI", desc: "Generates SEO-friendly descriptions" },
      { name: "Social Content Ideas", desc: "Creates posts based on top sellers" },
      { name: "Abandoned Cart Recovery", desc: "Drafts follow-up messages" },
      { name: "SEO Optimization", desc: "Suggests meta titles and keywords" },
    ],
  },
  {
    category: "Engagement",
    icon: "👥",
    color: "violet",
    rules: [
      { name: "VIP Customer Detection", desc: "Identifies top 10% spenders" },
      { name: "Dormant Re-engagement", desc: "Flags 60+ day inactive customers" },
      { name: "Review Requests", desc: "Times review asks perfectly" },
      { name: "Loyalty Rewards", desc: "Suggests personalized perks" },
    ],
  },
  {
    category: "Operations",
    icon: "⚙️",
    color: "orange",
    rules: [
      { name: "Prep Time Optimization", desc: "Alerts when kitchen slows down" },
      { name: "No-Show Management", desc: "Tracks and follows up on no-shows" },
      { name: "Slot Filling", desc: "Suggests promos for empty bookings" },
      { name: "Staff Optimization", desc: "Recommends staffing based on demand" },
    ],
  },
  {
    category: "Content",
    icon: "✍️",
    color: "pink",
    rules: [
      { name: "Blog Freshness", desc: "Reminds when content goes stale" },
      { name: "Portfolio Updates", desc: "Prompts for new project additions" },
      { name: "Image Optimization", desc: "Flags products needing better photos" },
      { name: "Trending Topics", desc: "Suggests content based on trends" },
    ],
  },
];

const industriesCovered = [
  "Retail", "Fashion", "Electronics", "Beauty", "Grocery",
  "Food & Restaurant", "Services", "Automotive", "Real Estate",
  "Events", "Education", "Travel", "Nonprofit", "B2B"
];

export default function AutopilotPage(): React.JSX.Element {
  const { starterFirstMonthFree } = useMarketingOffer();
  const offerCopy = getOfferCopy(starterFirstMonthFree);
  const proPlan = PLANS.find((p) => p.key === "pro");
  const proPriceLabel = proPlan != null ? formatNGN(proPlan.monthlyAmount) : "₦35,000";

  return (
    <div className="relative w-full min-w-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-6">
                <span className="text-2xl">✨</span>
                <span className="text-sm font-semibold text-violet-800">Vayva Autopilot</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                35+ ways AI grows your business{" "}
                <span className="text-violet-600">automatically</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                <span className="sm:hidden">
                  24/7 analysis across inventory, pricing, and ops—tailored to your vertical.
                </span>
                <span className="hidden sm:inline">
                  Autopilot analyzes your business data 24/7 across inventory, pricing,
                  customers, and operations. It spots opportunities, flags risks, and generates
                  actionable recommendations—trained specifically for your industry.
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link href={`${APP_URL}/signup`}>
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-xl shadow-violet-600/20">
                    Start with Autopilot
                  </Button>
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur px-5 py-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900 mb-1">Autopilot usage limits</p>
                <p className="text-slate-600">
                  Autopilot is capped so you always know what you’re getting:
                </p>
                <ul className="mt-2 space-y-1 text-slate-700">
                  <li>
                    <span className="font-semibold">Pro:</span> 20 runs/month · 10 AI messages per run
                  </li>
                  <li>
                    <span className="font-semibold">Pro+:</span> 60 runs/month · 10 AI messages per run
                  </li>
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  Limits help keep costs predictable and performance fast.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>24/7 monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>19 industries</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Zero setup required</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="lg:h-[500px] flex items-center"
            >
              <AutopilotDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How Autopilot works
            </h2>
            <p className="text-lg text-slate-600">
              <span className="sm:hidden">Swipe the three steps below.</span>
              <span className="hidden sm:inline">From data analysis to actionable recommendations in seconds</span>
            </p>
          </div>

          <div className="hidden sm:grid sm:grid-cols-3 gap-8 items-stretch">
            {[
              { 
                step: "1", 
                title: "Analyze", 
                desc: "AI continuously monitors your inventory, sales, customers, and operations",
                icon: "🔍"
              },
              { 
                step: "2", 
                title: "Detect", 
                desc: "35+ intelligent rules identify opportunities, risks, and patterns",
                icon: "⚡"
              },
              { 
                step: "3", 
                title: "Recommend", 
                desc: "Context-aware suggestions appear in your dashboard for approval",
                icon: "💡"
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center h-full rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col"
              >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6 text-3xl">
                    {item.icon}
                  </div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed flex-grow">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="sm:hidden -mx-1">
            <MarketingSnapRow ariaLabel="How Autopilot works" hint="Swipe each step" showDots dotCount={3}>
              {[
                { step: "1", title: "Analyze", desc: "AI continuously monitors your inventory, sales, customers, and operations", icon: "🔍" },
                { step: "2", title: "Detect", desc: "35+ intelligent rules identify opportunities, risks, and patterns", icon: "⚡" },
                { step: "3", title: "Recommend", desc: "Context-aware suggestions appear in your dashboard for approval", icon: "💡" },
              ].map((item) => (
                <MarketingSnapItem key={item.step}>
                  <div className="text-center h-full rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6 text-3xl mx-auto">
                      {item.icon}
                    </div>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm mb-4 mx-auto">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      {/* AI Rules Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Intelligent rules for every business need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto px-2">
              <span className="md:hidden">Swipe through rule categories—35+ industry-aware checks.</span>
              <span className="hidden md:inline">
                Autopilot includes 35+ AI rules across 7 categories. Each rule is industry-aware and context-sensitive.
              </span>
            </p>
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiRules.map((category, i) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm"
              >
                  <div className={`px-6 py-4 bg-${category.color}-50 border-b border-${category.color}-100`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="font-bold text-slate-900">{category.category}</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {category.rules.map((rule) => (
                      <div key={rule.name} className="flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${category.color}-500 mt-2`} />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{rule.name}</p>
                          <p className="text-xs text-slate-500">{rule.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
              </motion.div>
            ))}
          </div>
          <div className="md:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="Autopilot rule categories"
              hint="Swipe rule categories"
              showDots
              dotCount={aiRules.length}
            >
              {aiRules.map((category) => (
                <MarketingSnapItem key={category.category}>
                  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm h-full">
                    <div className={`px-6 py-4 bg-${category.color}-50 border-b border-${category.color}-100`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="font-bold text-slate-900">{category.category}</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {category.rules.map((rule) => (
                        <div key={rule.name} className="flex items-start gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${category.color}-500 mt-2 shrink-0`} />
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{rule.name}</p>
                            <p className="text-xs text-slate-500">{rule.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      {/* Industries Covered */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-violet-950">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trained for your industry
          </h2>
          <p className="text-lg text-violet-200 mb-12 max-w-2xl mx-auto">
            Autopilot's recommendations are tailored to the specific dynamics of your business vertical
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {industriesCovered.map((industry) => (
              <span
                key={industry}
                className="px-4 py-2 bg-violet-900/50 border border-violet-800 rounded-full text-violet-100 text-sm font-medium"
              >
                {industry}
              </span>
            ))}
          </div>

          <div className="mt-12 hidden sm:grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: "Fashion", example: "Identifies slow-moving SKUs by size/color" },
              { label: "Food", example: "Monitors prep times and kitchen backlog" },
              { label: "Services", example: "Suggests promos to fill empty slots" },
            ].map((item) => (
              <div
                key={item.label}
                className="text-left p-4 bg-violet-900/30 rounded-xl border border-violet-700/50 shadow-sm"
              >
                  <p className="font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-sm text-violet-300">{item.example}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 sm:hidden -mx-1 max-w-3xl mx-auto">
            <MarketingSnapRow ariaLabel="Industry examples" hint="Swipe for examples" showDots dotCount={3}>
              {[
                { label: "Fashion", example: "Identifies slow-moving SKUs by size/color" },
                { label: "Food", example: "Monitors prep times and kitchen backlog" },
                { label: "Services", example: "Suggests promos to fill empty slots" },
              ].map((item) => (
                <MarketingSnapItem key={item.label}>
                  <div className="text-left p-4 bg-violet-900/30 rounded-xl border border-violet-700/50 shadow-sm h-full">
                    <p className="font-semibold text-white mb-1">{item.label}</p>
                    <p className="text-sm text-violet-300">{item.example}</p>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            AI Autopilot is included on Pro and Pro+ at no extra charge.
          </p>

          <div className="max-w-xl mx-auto">
              <div className="relative p-8 bg-violet-600 rounded-2xl text-white border border-violet-500/50 shadow-lg">
                <div className="absolute -top-3 right-6 bg-emerald-400 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-violet-200 mb-4">Autopilot included</p>
                <p className="text-4xl font-bold mb-2">
                  {proPriceLabel}
                  <span className="text-lg text-violet-300 font-normal">/mo</span>
                </p>
                <p className="text-sm text-violet-200 mb-6">Matches public pricing; see /pricing for trials and offers</p>
                <ul className="space-y-3 text-sm text-violet-100 text-left mb-8">
                  <li className="flex items-center gap-2">
                    <span>✓</span> Full Autopilot rule set (as enabled for your account)
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Ongoing analysis of your store data
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> WhatsApp + Email alerts (where configured)
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Catalog limits by plan (100 / 300 / 500 SKUs)
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Actionable recommendations in-dashboard
                  </li>
                </ul>
                <Link href={`${APP_URL}/signup?plan=pro`}>
                  <Button className="w-full py-5 font-semibold rounded-xl bg-white text-violet-600 hover:bg-violet-50">
                    Get Started
                  </Button>
                </Link>
              </div>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Looking for Starter? <Link href="/pricing" className="text-violet-600 font-semibold hover:underline">View all pricing plans →</Link>
          </p>

          <p className="mt-4 text-sm text-slate-500">
            {offerCopy.trialBadge}. Paid plans at checkout. {offerCopy.cancelAnytime}.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "How does Autopilot learn about my business?",
                a: "Autopilot analyzes your sales data, inventory levels, customer behavior, and operational metrics automatically. No manual configuration needed—it starts generating insights within 24 hours of connection."
              },
              {
                q: "Can I customize which recommendations I receive?",
                a: "Yes! You can enable or disable specific rule categories in your settings. You can also set thresholds (e.g., only alert when stock is below 10 units)."
              },
              {
                q: "Is my data safe with AI analysis?",
                a: "Absolutely. All data processing happens in secure, encrypted environments. We never train models on your data or share insights with third parties."
              },
              {
                q: "What industries does Autopilot support?",
                a: "Autopilot covers 19+ industries including retail, fashion, food & restaurant, services, automotive, real estate, events, education, and more. Each industry has specialized rules."
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm"
              >
                  <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-10 shadow-sm">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Let AI run your business growth
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Join merchants who've discovered opportunities they&apos;d never have spotted on their own.
              </p>
              <Link href={`${APP_URL}/signup`}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-xl shadow-violet-600/20">
                  Start Your Free Trial
                </Button>
              </Link>
              <p className="mt-4 text-sm text-slate-500">
                {offerCopy.trialBadge} via signup. Full AI access on eligible plans.
              </p>
          </div>
        </div>
      </section>
    </div>
  );
}
