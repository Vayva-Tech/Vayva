"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { APP_URL } from "@/lib/constants";
import { Button } from "@vayva/ui";

const capabilities = [
  { icon: "💬", title: "24/7 Responses", desc: "Never miss a customer inquiry, even at 2 AM" },
  { icon: "🛒", title: "Takes Orders", desc: "Customers browse catalog and place orders via chat" },
  { icon: "💳", title: "Processes Payments", desc: "Sends payment links and confirms receipts" },
  { icon: "📦", title: "Tracks Orders", desc: "Real-time order status and delivery updates" },
  { icon: "📅", title: "Books Appointments", desc: "Calendar integration for scheduling" },
  { icon: "❓", title: "Answers Questions", desc: "Product info, pricing, availability" },
];

const workflow = [
  { step: "1", title: "Customer Messages", desc: "On WhatsApp or your storefront" },
  { step: "2", title: "AI Understands", desc: "Natural language processing" },
  { step: "3", title: "Takes Action", desc: "Order, booking, or answer" },
  { step: "4", title: "You Approve", desc: "Review before fulfillment" },
];

export default function AIAgentPage(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="relative inline-flex mb-6">
                <span className="absolute inset-0 translate-x-2 translate-y-2 rounded-full border-2 border-emerald-200/60" />
                <span className="relative inline-flex px-4 py-2 bg-white/90 border-2 border-slate-900/10 rounded-full text-sm font-semibold text-green-700 shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
                  WhatsApp Commerce
                </span>
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Your AI Sales Agent
                <br />
                <span className="text-green-600">on WhatsApp</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                A smart assistant that handles customer conversations, 
                takes orders, and processes payments—automatically.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`${APP_URL}/signup`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base font-semibold rounded-xl">
                    Try AI Agent Free
                  </Button>
                </Link>
                <Link href="/autopilot">
                  <Button variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl">
                    See Autopilot AI
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Chat Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto relative"
          >
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
            <div className="relative bg-[#075E54] rounded-3xl p-6 shadow-[0_26px_60px_rgba(15,23,42,0.2)] border-2 border-slate-900/10">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                  VY
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Vayva Assistant</p>
                  <p className="text-green-400 text-xs">online</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-[85%] text-sm text-slate-700">
                  Hi! I would like to order the red dress in size M
                </div>
                <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 max-w-[85%] text-sm text-slate-700 ml-auto">
                  Great choice! The Red Floral Dress is ₦12,500. Would you like to add anything else?
                </div>
                <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-[85%] text-sm text-slate-700">
                  No, just that. Can I pay now?
                </div>
                <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 max-w-[85%] text-sm text-slate-700 ml-auto">
                  Absolutely! Here's your payment link: vayva.ng/pay/x8k2m
                  <br />
                  <span className="text-green-700 font-medium">Total: ₦12,500</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              What your AI agent can do
            </h2>
            <p className="text-lg text-slate-600">
              Handle the entire customer journey—from inquiry to payment
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border-2 border-emerald-200/60" />
                <div className="relative p-6 bg-white/90 rounded-2xl border-2 border-slate-900/10 shadow-[0_16px_40px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl mb-4 shadow-[0_10px_22px_rgba(15,23,42,0.1)]">
                    {c.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{c.title}</h3>
                  <p className="text-sm text-slate-600">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600">
              Simple workflow from message to fulfillment
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((w, i) => (
              <motion.div
                key={w.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[22px] border-2 border-emerald-200/60" />
                <div className="relative p-6 rounded-[20px] border-2 border-slate-900/10 bg-white/90 shadow-[0_16px_38px_rgba(15,23,42,0.1)]">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {w.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{w.title}</h3>
                  <p className="text-sm text-slate-600">{w.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Included in all plans
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            AI WhatsApp Agent is available on Starter, Growth, and Pro plans. 
            No extra fees for AI conversations.
          </p>
          <div className="relative inline-block">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[26px] border-2 border-emerald-200/60" />
            <Link href="/pricing" className="relative inline-block">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 text-lg font-semibold rounded-xl border-2 border-slate-900/10 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[32px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[30px] border-2 border-slate-900/10 bg-white/90 p-10 shadow-[0_24px_55px_rgba(15,23,42,0.12)]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Ready to automate your sales?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Set up your AI agent in 5 minutes. Start handling orders 24/7.
              </p>
              <Link href={`${APP_URL}/signup`}>
                <Button className="bg-green-600 hover:bg-green-700 text-white px-10 py-6 text-lg font-semibold rounded-xl border-2 border-green-700/30 shadow-[0_18px_45px_rgba(16,185,129,0.3)]">
                  Get Started Free
                </Button>
              </Link>
              <p className="mt-4 text-sm text-slate-500">
                7-day free trial • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
