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
    <div className="relative text-slate-900 bg-transparent">
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
              className="relative h-full"
            >
              {/* Green and Purple gradient background with blur orbs */}
              <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-emerald-500/20 backdrop-blur-xl overflow-hidden" />
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400/30 to-purple-400/30 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-400/30 to-emerald-400/30 blur-3xl" />
              
              <div className="relative rounded-[34px] border-2 border-slate-900/10 p-8 shadow-[0_26px_60px_rgba(15,23,42,0.12)] h-full flex flex-col">
                {plan.popular && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Most popular
                  </span>
                )}
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-slate-900">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-slate-500">/month</span>
                  )}
                </div>
                <ul className="mt-6 space-y-3 text-sm flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={resolvePlanHref(plan.href)} className="mt-8 block">
                  <Button
                    className="w-full py-6 rounded-2xl text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
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
              <h2 className="mt-4 text-3xl font-black">Compare features across plans</h2>
              <p className="mt-2 text-slate-600 max-w-2xl">Every plan includes core business tools. Upgrade anytime to unlock advanced features and scale your operations.</p>
            </div>
            <Link href="/contact" className="text-sm font-semibold text-emerald-700">
              Talk to sales →
            </Link>
          </div>
          <div className="mt-10 overflow-hidden rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-emerald-50 to-purple-50 text-slate-700">
                <tr>
                  <th className="text-left p-5 font-bold text-base">Capability</th>
                  <th className="text-left p-5 font-bold text-base">Free</th>
                  <th className="text-left p-5 font-bold text-base">Starter</th>
                  <th className="text-left p-5 font-bold text-base">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    name: "Templates",
                    free: "4 templates",
                    starter: "Full library",
                    pro: "Full library + custom",
                    desc: "Storefront design templates"
                  },
                  {
                    name: "Products",
                    free: "Basic catalog",
                    starter: "Up to 500",
                    pro: "Unlimited",
                    desc: "Maximum products in catalog"
                  },
                  {
                    name: "Automation",
                    free: "Not included",
                    starter: "WhatsApp & Instagram",
                    pro: "WhatsApp & Instagram",
                    desc: "AI-powered order capture"
                  },
                  {
                    name: "Storefront",
                    free: "Basic with branding",
                    starter: "Custom setup",
                    pro: "Custom development",
                    desc: "Professional online presence"
                  },
                  {
                    name: "API access",
                    free: "Not included",
                    starter: "Not included",
                    pro: "Full access",
                    desc: "Integrate with external systems"
                  },
                  {
                    name: "Support",
                    free: "Community",
                    starter: "Priority support",
                    pro: "Dedicated manager",
                    desc: "Get help when you need it"
                  },
                  {
                    name: "Branding",
                    free: "Vayva branding",
                    starter: "Remove branding",
                    pro: "White-label option",
                    desc: "Your brand identity"
                  },
                  {
                    name: "Multi-location",
                    free: "Not included",
                    starter: "Not included",
                    pro: "Included",
                    desc: "Manage multiple locations"
                  },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{row.desc}</div>
                    </td>
                    <td className="p-5 text-slate-600">{row.free}</td>
                    <td className="p-5 text-emerald-700 font-semibold">{row.starter}</td>
                    <td className="p-5 text-slate-900 font-medium">{row.pro}</td>
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
