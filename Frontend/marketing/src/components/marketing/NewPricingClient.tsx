"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import { pricingFaqs, pricingPlans } from "@/data/marketing-content";

function formatPrice(naira: number): string {
  if (naira === 0) return "Free";
  return `₦${(naira / 1000).toFixed(1)}k`;
}

function resolvePlanHref(href: string): string {
  if (href.startsWith("/signup")) {
    return `${APP_URL}${href}`;
  }

  return href;
}

export function NewPricingClient(): React.JSX.Element {
  return (
    <div className="relative text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-6 -top-8 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="relative max-w-[1600px] mx-auto px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900/10 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            Transparent pricing
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
          >
            Choose the plan that matches your growth stage
            <span className="relative ml-2 inline-flex text-emerald-600">
              with confidence
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 4 150 4 198 8" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            .
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-slate-600"
          >
            Start free, then scale as your orders increase. Every plan includes Autopilot insights and local payment support.
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1600px] mx-auto px-6 grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
              <div
                className={`relative rounded-[34px] border-2 p-8 shadow-[0_26px_60px_rgba(15,23,42,0.12)] ${
                  plan.popular
                    ? "border-emerald-500/40 bg-slate-900 text-white"
                    : "border-slate-900/10 bg-white/90"
                }`}
              >
                {plan.popular && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Most popular
                  </span>
                )}
                <h3 className={`mt-4 text-xl font-semibold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`mt-2 text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                  {plan.description}
                </p>
                <div className="mt-6 flex items-end gap-2">
                  <span className={`text-4xl font-semibold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>/month</span>
                  )}
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className={`mt-1 h-2 w-2 rounded-full ${plan.popular ? "bg-emerald-400" : "bg-emerald-500"}`} />
                      <span className={plan.popular ? "text-slate-200" : "text-slate-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={resolvePlanHref(plan.href)} className="mt-8 block">
                  <Button
                    className={`w-full py-6 rounded-2xl text-base font-semibold ${
                      plan.popular
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 font-semibold">Plan comparison</p>
              <h2 className="mt-4 text-3xl font-black">Everything you need to scale in one stack.</h2>
            </div>
            <Link href="/contact" className="text-sm font-semibold text-emerald-700">
              Talk to sales →
            </Link>
          </div>
          <div className="mt-10 overflow-hidden rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <table className="w-full text-sm">
              <thead className="bg-white/70 text-slate-600">
                <tr>
                  <th className="text-left p-4 font-semibold">Capability</th>
                  <th className="text-left p-4 font-semibold">Free</th>
                  <th className="text-left p-4 font-semibold">Starter</th>
                  <th className="text-left p-4 font-semibold">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Monthly orders", free: "50", starter: "Unlimited", pro: "Unlimited" },
                  { name: "Autopilot insights", free: "Limited", starter: "Full", pro: "Full" },
                  { name: "Team members", free: "1", starter: "3", pro: "Unlimited" },
                  { name: "Storefront", free: "Basic", starter: "Branded", pro: "Custom" },
                  { name: "API access", free: "—", starter: "—", pro: "✓" },
                ].map((row) => (
                  <tr key={row.name}>
                    <td className="p-4 text-slate-700">{row.name}</td>
                    <td className="p-4 text-slate-500">{row.free}</td>
                    <td className="p-4 text-emerald-600 font-medium">{row.starter}</td>
                    <td className="p-4 text-slate-700">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <h2 className="text-2xl font-black text-center">Frequently asked questions</h2>
          <div className="mt-10 grid gap-6">
            {pricingFaqs.map((faq) => (
              <div key={faq.question} className="relative">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
                <div className="relative rounded-[34px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-6 shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
                  <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6 text-center text-slate-900">
          <h2 className="text-3xl md:text-4xl font-black">Let’s build your commerce engine.</h2>
          <p className="mt-4 text-lg text-slate-600">
            Start free, or talk to the team about a custom rollout for multiple brands.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-6 rounded-2xl text-base font-semibold shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
                Start free
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-2 border-slate-900/15 text-slate-700 hover:bg-white/60 px-7 py-6 rounded-2xl text-base font-semibold">
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
