"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { APP_URL } from "@/lib/constants";
import { Button } from "@vayva/ui";
import { AutopilotDemo } from "@/components/marketing/AutopilotDemo";

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
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
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

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                35+ ways AI grows your business{" "}
                <span className="text-violet-600">automatically</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Autopilot analyzes your business data 24/7 across inventory, pricing, 
                customers, and operations. It spots opportunities, flags risks, and 
                generates actionable recommendations—trained specifically for your industry.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link href={`${APP_URL}/signup`}>
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-xl shadow-violet-600/20">
                    Start with Autopilot
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 text-sm text-slate-500">
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
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How Autopilot works
            </h2>
            <p className="text-lg text-slate-600">
              From data analysis to actionable recommendations in seconds
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 items-stretch">
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
                className="relative text-center h-full"
              >
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[26px] border-2 border-emerald-200/60" />
                <div className="relative rounded-[24px] border-2 border-slate-900/10 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.1)] h-full flex flex-col">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-slate-900/10 shadow-[0_12px_26px_rgba(15,23,42,0.12)] mb-6 text-3xl">
                    {item.icon}
                  </div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed flex-grow">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Rules Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Intelligent rules for every business need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Autopilot includes 35+ AI rules across 7 categories. Each rule is industry-aware and context-sensitive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiRules.map((category, i) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[26px] border-2 border-emerald-200/60" />
                <div className="relative bg-white rounded-2xl border-2 border-slate-900/10 overflow-hidden shadow-[0_18px_45px_rgba(15,23,42,0.1)]">
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Covered */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-violet-950">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
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

          <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: "Fashion", example: "Identifies slow-moving SKUs by size/color" },
              { label: "Food", example: "Monitors prep times and kitchen backlog" },
              { label: "Services", example: "Suggests promos to fill empty slots" },
            ].map((item) => (
              <div key={item.label} className="relative text-left">
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border-2 border-violet-500/30" />
                <div className="relative p-4 bg-violet-900/30 rounded-xl border-2 border-violet-700/40 shadow-[0_16px_40px_rgba(15,23,42,0.2)]">
                  <p className="font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-sm text-violet-300">{item.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            AI Autopilot is included free with Pro.
          </p>

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[26px] border-2 border-violet-300/50" />
              <div className="relative p-8 bg-violet-600 rounded-2xl text-white border-2 border-violet-500/40 shadow-[0_18px_45px_rgba(76,29,149,0.4)]">
                <div className="absolute -top-3 right-6 bg-emerald-400 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-violet-200 mb-4">Autopilot included free</p>
                <p className="text-4xl font-bold mb-2">₦40,000<span className="text-lg text-violet-300 font-normal">/mo</span></p>
                <p className="text-sm text-violet-200 mb-6">No extra cost for Autopilot</p>
                <ul className="space-y-3 text-sm text-violet-100 text-left mb-8">
                  <li className="flex items-center gap-2">
                    <span>✓</span> All 35+ AI rules
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Hourly analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> WhatsApp + Email alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Unlimited everything
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✓</span> Priority recommendations
                  </li>
                </ul>
                <Link href={`${APP_URL}/signup?plan=pro`}>
                  <Button className="w-full py-5 font-semibold rounded-xl bg-white text-violet-600 hover:bg-violet-50">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Looking for Starter? <Link href="/pricing" className="text-violet-600 font-semibold hover:underline">View all pricing plans →</Link>
          </p>

          <p className="mt-4 text-sm text-slate-500">
            7-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-[1600px] mx-auto px-6">
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
                className="relative"
              >
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl border-2 border-emerald-200/60" />
                <div className="relative bg-white rounded-xl p-6 border-2 border-slate-900/10 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[32px] border-2 border-slate-900/10 bg-white/90 p-10 shadow-[0_26px_60px_rgba(15,23,42,0.12)]">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Let AI run your business growth
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Join 500+ merchants who've discovered opportunities they'd never have spotted on their own.
              </p>
              <Link href={`${APP_URL}/signup`}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-xl shadow-violet-600/20">
                  Start Your Free Trial
                </Button>
              </Link>
              <p className="mt-4 text-sm text-slate-500">
                7 days free. No credit card. Full access to all AI features.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
