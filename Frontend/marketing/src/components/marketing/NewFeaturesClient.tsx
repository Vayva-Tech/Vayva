"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { APP_URL } from "@/lib/constants";
import { Button } from "@vayva/ui";
import {
  featureInfrastructure,
  featureShowcase,
  featureWorkflowSteps,
} from "@/data/marketing-content";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

// Device frame wrapper — declared outside component to prevent recreation on each render
function DeviceFrame({ children, type }: { children: React.ReactNode; type: "phone" | "desktop" }) {
  return (
    <div className="relative">
      {type === "phone" ? (
        <div className="relative mx-auto w-[280px] bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
          {/* Screen */}
          <div className="bg-white rounded-[2rem] overflow-hidden">
            {children}
          </div>
          {/* Home indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-700 rounded-full" />
        </div>
      ) : (
        <div className="relative mx-auto max-w-md bg-slate-800 rounded-xl p-2 shadow-2xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-t-lg">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-slate-600 rounded px-3 py-1 text-xs text-slate-400 text-center">
                merchant.vayva.ng
              </div>
            </div>
          </div>
          {/* Screen */}
          <div className="bg-white rounded-b-lg overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// Interactive feature demo component
function FeatureDemo({ type }: { type: string }): React.JSX.Element {
  const [activeStep, setActiveStep] = useState(0);

  const demos: Record<string, React.JSX.Element> = {
    orders: (
      <DeviceFrame type="phone">
        <div className="bg-emerald-50 min-h-[400px]">
          {/* WhatsApp Header */}
          <div className="bg-emerald-600 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20" />
            <div>
              <p className="text-white font-medium text-sm">Vayva AI</p>
              <p className="text-white/70 text-xs">online</p>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="p-4 space-y-3">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-lg p-3 shadow-sm max-w-[85%]"
                >
                  <p className="text-sm text-slate-700">Hi! I want to order 2 Ankara dresses and 1 leather bag please</p>
                  <p className="text-[10px] text-slate-400 mt-1 text-right">10:23 AM</p>
                </motion.div>
              )}
              {activeStep === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="bg-emerald-100 rounded-lg p-3 max-w-[85%] ml-auto">
                    <p className="text-sm text-emerald-800">✓ Got it! Creating your order...</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-slate-500 mb-2">Detected items:</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">Ankara Dress × 2</span>
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">Leather Bag × 1</span>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeStep === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="bg-emerald-100 rounded-lg p-3 max-w-[85%] ml-auto">
                    <p className="text-sm text-emerald-800 font-medium">Order #VAY-7842 Created!</p>
                    <div className="mt-2 pt-2 border-t border-emerald-200">
                      <div className="flex justify-between text-xs text-emerald-700">
                        <span>2× Ankara Dress</span>
                        <span>₦35,000</span>
                      </div>
                      <div className="flex justify-between text-xs text-emerald-700">
                        <span>1× Leather Bag</span>
                        <span>₦12,500</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-emerald-800 mt-1 pt-1 border-t border-emerald-200">
                        <span>Total</span>
                        <span>₦47,500</span>
                      </div>
                    </div>
                    <Button type="button" className="mt-2 w-full bg-emerald-600 text-white text-xs py-2 rounded-lg h-auto hover:bg-emerald-700 hover:text-white">
                      Pay Now →
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Step indicators */}
          <div className="absolute bottom-16 left-4 right-4 flex gap-2">
            {[0, 1, 2].map(i => (
              <Button
                type="button"
                variant="ghost"
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex-1 h-1 min-h-0 p-0 rounded-full transition-all ${activeStep === i ? "bg-emerald-500 hover:bg-emerald-500" : "bg-slate-300 hover:bg-slate-400"}`}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </DeviceFrame>
    ),
    payments: (
      <DeviceFrame type="desktop">
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-white min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900">Payment Methods</span>
            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full font-medium">All Active</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Card Payments", icon: "💳", methods: "Visa, Mastercard, Verve", color: "blue", active: true },
              { name: "Bank Transfer", icon: "🏦", methods: "All Nigerian banks", color: "emerald", active: true },
              { name: "USSD", icon: "📱", methods: "*737#, *919# etc", color: "amber", active: true },
            ].map((method, i) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-${method.color}-100 flex items-center justify-center text-xl`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{method.name}</p>
                  <p className="text-xs text-slate-500">{method.methods}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${method.active ? "bg-emerald-500" : "bg-slate-200"}`}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 text-center">Funds settle directly to your bank account</p>
          </div>
        </div>
      </DeviceFrame>
    ),
    dashboard: (
      <DeviceFrame type="desktop">
        <div className="p-5 bg-white min-h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-semibold text-slate-900">Performance</span>
              <p className="text-xs text-slate-500">Your business at a glance</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Today</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Week</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Revenue", value: "₦847K", change: "+23%", color: "emerald", icon: "💰" },
              { label: "Orders", value: "156", change: "+12%", color: "blue", icon: "📦" },
              { label: "Customers", value: "89", change: "+8%", color: "violet", icon: "👥" },
              { label: "Avg Order", value: "₦5.4K", change: "+5%", color: "amber", icon: "📈" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-${stat.color}-50 rounded-xl p-3 border border-${stat.color}-100`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{stat.icon}</span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{stat.label}</p>
                </div>
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className={`text-[10px] text-${stat.color}-600 font-medium`}>{stat.change} vs yesterday</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-600 mb-2">Revenue Trend</p>
            <div className="h-16 flex items-end gap-1">
              {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex-1 bg-emerald-500 rounded-t"
                />
              ))}
            </div>
          </div>
        </div>
      </DeviceFrame>
    ),
    inventory: (
      <DeviceFrame type="desktop">
        <div className="p-5 bg-white min-h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900">Inventory Alerts</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">3 items need attention</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Ankara Dress (Red)", stock: 3, threshold: 10, status: "low", sold: 45 },
              { name: "Leather Bag (Brown)", stock: 12, threshold: 15, status: "ok", sold: 28 },
              { name: "Ankara Dress (Blue)", stock: 0, threshold: 10, status: "out", sold: 67 },
            ].map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-xl border ${
                  item.status === "out" ? "bg-rose-50 border-rose-200" : 
                  item.status === "low" ? "bg-amber-50 border-amber-200" : 
                  "bg-emerald-50 border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.sold} sold this month</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      item.status === "out" ? "text-rose-600" : 
                      item.status === "low" ? "text-amber-600" : 
                      "text-emerald-600"
                    }`}>
                      {item.stock}
                    </p>
                    <p className="text-[10px] text-slate-500">in stock</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      item.status === "out" ? "bg-rose-500" : 
                      item.status === "low" ? "bg-amber-500" : 
                      "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min((item.stock / item.threshold) * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </DeviceFrame>
    ),
    delivery: (
      <DeviceFrame type="phone">
        <div className="bg-slate-50 min-h-[400px]">
          {/* Map Header */}
          <div className="bg-emerald-600 px-4 py-3">
            <p className="text-white font-medium text-sm">Track Delivery</p>
            <p className="text-white/70 text-xs">Order #VAY-7842</p>
          </div>
          
          {/* Delivery Timeline */}
          <div className="p-4 space-y-4">
            {[
              { status: "confirmed", label: "Order Confirmed", time: "10:23 AM", done: true },
              { status: "processing", label: "Preparing Order", time: "10:45 AM", done: true },
              { status: "dispatched", label: "Dispatched", time: "11:30 AM", done: true },
              { status: "transit", label: "In Transit", time: "12:15 PM", current: true },
              { status: "delivered", label: "Delivered", time: "Expected 2:00 PM", pending: true },
            ].map((step, i) => (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.done ? "bg-emerald-500 text-white" :
                  step.current ? "bg-amber-500 text-white animate-pulse" :
                  "bg-slate-200 text-slate-400"
                }`}>
                  {step.done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.current ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    step.pending ? "text-slate-400" : "text-slate-900"
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500">{step.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Rider Info */}
          <div className="mx-4 p-3 bg-white rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Kwik Delivery</p>
                <p className="text-xs text-slate-500">Abdul • +234 801 234 5678</p>
              </div>
              <Button type="button" variant="ghost" className="p-2 bg-emerald-100 rounded-full h-auto hover:bg-emerald-200" aria-label="Call rider">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </DeviceFrame>
    ),
  };

  return demos[type] || null;
}


export function NewFeaturesClient(): React.JSX.Element {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="relative w-full min-w-0 overflow-x-hidden text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Vayva platform features
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight px-1"
          >
            Everything you need to run high-performing commerce.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-base sm:text-lg text-slate-600 px-1"
          >
            <span className="md:hidden">Orders, payments, delivery, and growth in one place.</span>
            <span className="hidden md:inline">
              Capture orders, collect payments, fulfill delivery, and drive growth with a single command center.
            </span>
          </motion.p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-6 rounded-xl text-base font-semibold">
                Start free trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="px-7 py-6 rounded-xl text-base font-semibold">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col gap-10 lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-12 items-start min-w-0">
          <div className="order-2 lg:order-1 space-y-4 w-full min-w-0">
            {featureShowcase.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setActiveFeature(index)}
                className={`cursor-pointer rounded-2xl border p-6 transition-all ${
                  activeFeature === index
                    ? "border-emerald-500/40 bg-white/80 backdrop-blur shadow-lg"
                    : "border-slate-200 bg-white/60 backdrop-blur hover:bg-white/80"
                }`}
              >
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                {activeFeature === index && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-2 text-sm text-slate-600"
                  >
                    {feature.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        {cap}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </motion.div>
            ))}
          </div>
          <div className="order-1 lg:order-2 w-full min-w-0 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FeatureDemo type={featureShowcase[activeFeature].demo} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold">From first message to paid order.</h2>
            </div>
            <Link href="/how-vayva-works" className="text-sm font-semibold text-emerald-700">
              Full workflow →
            </Link>
          </div>
          <div className="mt-10 hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureWorkflowSteps.map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6">
                <span className="text-xs font-semibold text-emerald-600">{item.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 sm:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="Workflow steps"
              hint="Swipe each step"
              showDots
              dotCount={featureWorkflowSteps.length}
            >
              {featureWorkflowSteps.map((item) => (
                <MarketingSnapItem key={item.step}>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 h-full">
                    <span className="text-xs font-semibold text-emerald-600">{item.step}</span>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">Infrastructure</p>
            <h2 className="mt-4 text-3xl font-semibold">Built for serious commerce operations.</h2>
            <p className="mt-4 text-lg text-slate-600">Scale with confidence on a platform designed for high-volume Nigeria-first businesses.</p>
          </div>
          <div className="mt-12 hidden md:grid md:grid-cols-2 gap-6">
            {featureInfrastructure.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-8">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 md:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="Platform infrastructure"
              hint="Swipe for more"
              showDots
              dotCount={featureInfrastructure.length}
            >
              {featureInfrastructure.map((item) => (
                <MarketingSnapItem key={item.title}>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 h-full">
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6 text-center text-slate-900">
          <h2 className="text-3xl md:text-4xl font-semibold">Bring every channel into one platform.</h2>
          <p className="mt-4 text-lg text-slate-600">
            Start free, or talk to the team about a custom rollout for multi-location brands.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-6 rounded-xl text-base font-semibold">
                Start free trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white/60 px-7 py-6 rounded-xl text-base font-semibold">
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
