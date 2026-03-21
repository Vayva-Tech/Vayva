"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { APP_URL } from "@/lib/constants";
import { Button } from "@vayva/ui";
import {
  MessageCircle,
  Brain,
  Zap,
  Sparkles,
  Headphones,
  Shield,
  CheckCircle2,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";

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
    desc: "Transcribes voice notes",
  },
];

const creditTiers = [
  {
    plan: "Free",
    credits: "₦0",
    desc: "No AI access",
    features: ["Basic storefront", "2 templates"],
  },
  {
    plan: "Starter",
    credits: "₦25K/mo",
    desc: "5K AI credits",
    features: ["5,000 credits", "1 staff seat", "Analytics"],
    highlight: true,
  },
  {
    plan: "Pro",
    credits: "₦40K/mo",
    desc: "10K AI credits",
    features: ["10,000 credits", "3 staff seats", "Priority support"],
  },
];

export function RedesignedAIAgentPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-transparent">
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
              className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-8 leading-tight"
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
              className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto"
            >
              While you sleep, AI takes orders, answers questions, and closes deals. 
              Real conversations. Zero effort.
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
          </div>
        </div>
      </section>

      {/* Capabilities - Industry page style */}
      <section className="py-20 lg:py-28 bg-transparent">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
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
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
                <div className="relative p-6 bg-white/90 backdrop-blur rounded-[28px] border-2 border-slate-900/10 shadow-[0_20px_50px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-[0_10px_25px_rgba(16,185,129,0.25)]">
                    <cap.icon className="w-6 h-6" strokeWidth={1.6} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{cap.title}</h3>
                  <p className="text-sm text-slate-600">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
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
                className="absolute -right-4 top-1/4 bg-white rounded-xl p-4 shadow-xl border border-emerald-100 hidden lg:block"
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
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
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
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {creditTiers.map((tier, i) => (
              <motion.div
                key={tier.plan}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col h-full ${i === 1 ? 'md:-mt-8' : ''}`}
              >
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
                <div className={`relative flex flex-col flex-1 p-8 bg-white/90 backdrop-blur rounded-[28px] border-2 border-slate-900/10 shadow-[0_20px_50px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all ${
                  tier.highlight ? 'ring-2 ring-emerald-500' : ''
                }`}>
                  {tier.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}
                  <div className="flex-shrink-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.plan}</h3>
                    <p className="text-sm text-slate-500 mb-6">{tier.desc}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-emerald-600">{tier.credits}</span>
                      {tier.plan !== "Free" && (
                        <span className="text-sm text-slate-500 ml-2">/month</span>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {tier.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button className={`w-full py-4 rounded-2xl font-semibold transition-all mt-auto ${
                    tier.highlight 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}>
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
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
              7-day free trial • No credit card required
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default RedesignedAIAgentPage;
