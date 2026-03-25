"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { APP_URL } from "@/lib/constants";
import { PLANS, formatNGN, getOfferCopy } from "@/config/pricing";
import { useMarketingOffer } from "@/context/MarketingOfferContext";
import { Button } from "@vayva/ui";
import {
  MessageCircle,
  Brain,
  Zap,
  Sparkles,
  Headphones,
  CheckCircle2,
  CheckCircle,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

const capabilities = [
  {
    icon: MessageCircle,
    title: "Automated Support",
    desc: "24/7 instant responses",
  },
  {
    icon: Brain,
    title: "Custom Personality",
    desc: "Your brand's tone",
  },
  {
    icon: Sparkles,
    title: "Brand Knowledge",
    desc: "Trained on your products",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    desc: "Sales & support modes",
  },
  {
    icon: ImageIcon,
    title: "Image Analysis",
    desc: "Understands product photos",
  },
  {
    icon: Headphones,
    title: "Voice Processing",
    desc: "Transcribes voice notes (Pro+)",
  },
];

export function RedesignedAIAgentPage(): React.JSX.Element {
  const { starterFirstMonthFree } = useMarketingOffer();
  const offerCopy = getOfferCopy(starterFirstMonthFree);

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-transparent">
      {/* Hero Section - Clean & Minimal */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-8"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Sales Agent
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 sm:mb-8 leading-tight px-1"
            >
              Your best salesperson,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                working 24/7
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-xl text-slate-600 mb-10 sm:mb-12 max-w-2xl mx-auto px-1"
            >
              <span className="md:hidden">Orders, answers, and payment links while you&apos;re offline.</span>
              <span className="hidden md:inline">
                While you sleep, AI takes orders, answers questions, and closes deals. Real conversations. Zero effort.
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href={`${APP_URL}/signup`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-emerald-500/30">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="border-2 border-emerald-300 text-slate-700 hover:bg-white/80 px-8 py-4 rounded-xl text-lg font-semibold">
                  View Pricing
                </Button>
              </Link>
            </motion.div>
            <p className="mt-8 text-xs text-slate-500 max-w-xl mx-auto px-2 leading-relaxed">
              Channel connections, message limits, and advanced agent features depend on your plan and account setup.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities - Industry page style */}
      <section className="py-20 lg:py-28 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.35em] mb-4 block">
              What It Can Do
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Simple but powerful features
            </h2>
            <p className="text-sm text-slate-500 sm:hidden -mt-2">Swipe to explore capabilities.</p>
          </motion.div>

          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-[0_10px_25px_rgba(16,185,129,0.25)]">
                    <cap.icon className="w-6 h-6" strokeWidth={1.6} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{cap.title}</h3>
                  <p className="text-sm text-slate-600">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="sm:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="AI agent capabilities"
              hint="Swipe for each capability"
              showDots
              dotCount={capabilities.length}
            >
              {capabilities.map((cap) => (
                <MarketingSnapItem key={cap.title}>
                  <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm h-full">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-[0_10px_25px_rgba(16,185,129,0.25)]">
                      <cap.icon className="w-6 h-6" strokeWidth={1.6} />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{cap.title}</h3>
                    <p className="text-sm text-slate-600">{cap.desc}</p>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      {/* Plan limits */}
      <section className="py-20 lg:py-28 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.35em] mb-4 block">
              AI Usage Packages
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Clear limits. No surprises.
            </h2>
            <p className="text-slate-600">
              AI usage is measured in <span className="font-semibold">AI messages</span>. One
              AI reply typically uses 1 message. Some heavy features cost more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Starter</h3>
              <p className="text-sm text-slate-600 mb-4">
                Built for daily sales chats.
              </p>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>AI messages: <span className="font-semibold">600 / month</span></li>
                <li>Autopilot: <span className="font-semibold">Not included</span></li>
                <li>Voice notes: <span className="font-semibold">Not included</span></li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pro</h3>
              <p className="text-sm text-slate-600 mb-4">
                More volume + Autopilot insights.
              </p>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>AI messages: <span className="font-semibold">800 / month</span></li>
                <li>Autopilot: <span className="font-semibold">20 runs / month</span></li>
                <li>Autopilot cost: <span className="font-semibold">10 AI messages</span> per run</li>
                <li>Voice notes: <span className="font-semibold">Not included</span></li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pro+</h3>
              <p className="text-sm text-slate-600 mb-4">
                Everything unlocked (with caps).
              </p>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>AI messages: <span className="font-semibold">1,200 / month</span></li>
                <li>Autopilot: <span className="font-semibold">60 runs / month</span></li>
                <li>Autopilot cost: <span className="font-semibold">10 AI messages</span> per run</li>
                <li>Voice notes: <span className="font-semibold">Enabled</span> (max 60s each)</li>
                <li>Voice cost: <span className="font-semibold">5 AI messages</span> per voice note</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/pricing">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-emerald-500/30">
                See pricing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Demo - Phone Mockup */}
      <section className="py-20 lg:py-28 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-4 block">
                Real Conversations
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
                Closes deals while you sleep
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                See how AI handles real customer inquiries, takes orders, and sends payment links—all automatically.
              </p>

              <div className="space-y-4">
                {[
                  "Responds in seconds",
                  "Takes orders 24/7",
                  "Sends payment links",
                  "Books deliveries",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative max-w-sm mx-auto"
            >
              <div className="bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden h-[600px]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xl">🤖</span>
                      </div>
                      <div>
                        <p className="text-white font-bold">Vayva AI</p>
                        <p className="text-white/80 text-xs">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="p-4 space-y-4 h-[450px] overflow-y-auto bg-slate-50">
                    {[
                      { role: 'customer', text: 'Red dress in size M?' },
                      { role: 'ai', text: 'Yes! ₦12,500. Order?' },
                      { role: 'customer', text: 'Yes! Deliver to Lekki' },
                      { role: 'ai', text: 'Total: ₦14,000. Payment link: vayva.pay/abc123' },
                    ].map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className={`flex ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          msg.role === 'customer'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-slate-900 shadow-md'
                        }`}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-3 bg-white border-t border-slate-200">
                    <div className="bg-slate-100 rounded-full px-4 py-3 text-sm text-slate-400">
                      Type a message...
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute -right-4 top-1/4 bg-white rounded-xl p-4 shadow-lg border border-slate-200/80 hidden lg:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Order Closed</p>
                    <p className="text-xs text-slate-500">₦14,000</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing - Industry page style */}
      <section className="py-20 lg:py-28 bg-transparent">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.35em] mb-4 block">
              Simple Pricing
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Choose your plan
            </h2>
            <p className="text-sm text-slate-500 md:hidden">Swipe to compare plans.</p>
          </motion.div>

          <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((tier, i) => (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col h-full ${tier.featured ? 'md:-mt-8' : ''}`}
              >
                <div className={`relative flex flex-col flex-1 p-8 bg-white rounded-[28px] border border-slate-200/80 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                  tier.featured ? 'ring-2 ring-emerald-500' : ''
                }`}>
                  {tier.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}
                  <div className="flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                    <p className="text-sm text-slate-500 mb-6">{tier.tagline}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-emerald-600">{formatNGN(tier.monthlyAmount)}</span>
                      <span className="text-sm text-slate-500 ml-2">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {tier.bullets.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={tier.checkoutHref} className={`w-full py-4 rounded-2xl font-semibold transition-all mt-auto text-center ${
                    tier.featured 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}>
                    {tier.ctaLabel}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="md:hidden -mx-1 max-w-5xl mx-auto">
            <MarketingSnapRow
              ariaLabel="Pricing plans"
              hint="Swipe to compare plans"
              showDots
              dotCount={PLANS.length}
            >
              {PLANS.map((tier) => (
                <MarketingSnapItem key={tier.key}>
                  <div
                    className={`relative flex flex-col flex-1 p-6 bg-white rounded-[28px] border border-slate-200/80 shadow-sm h-full ${
                      tier.featured ? 'ring-2 ring-emerald-500' : ''
                    }`}
                  >
                    {tier.featured && (
                      <div className="mb-3 text-center">
                        <span className="inline-block bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{tier.tagline}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-emerald-600">{formatNGN(tier.monthlyAmount)}</span>
                      <span className="text-sm text-slate-500 ml-2">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      {tier.bullets.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.checkoutHref}
                      className={`w-full py-3 rounded-2xl font-semibold transition-all mt-auto text-center block ${
                        tier.featured
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {tier.ctaLabel}
                    </Link>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-transparent">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-slate-900 mb-6"
          >
            Ready to automate sales?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 mb-10"
          >
            Set up in 5 minutes. Start closing deals 24/7.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-xl text-lg font-bold shadow-xl shadow-emerald-500/30">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-slate-500 mt-6">
              {offerCopy.trialBadge} • {starterFirstMonthFree ? "No Paystack for monthly Starter signup" : offerCopy.noCard}
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default RedesignedAIAgentPage;
