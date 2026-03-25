"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMessageCircle as MessageCircle,
  IconShoppingBag as ShoppingBag,
  IconSparkles as Sparkles,
  IconLayoutDashboard as LayoutDashboard,
  IconChevronRight as ChevronRight,
  IconCircleCheck as CheckCircle2,
  IconClock as Clock,
  IconTruck as Truck,
} from "@tabler/icons-react";
import { Button } from "@vayva/ui";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "ai", label: "AI Agent", icon: Sparkles },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

// WhatsApp Demo Content
function WhatsAppDemo() {
  const [step, setStep] = useState(0);
  
  const messages = [
    { from: "customer", text: "Hi! I want 2 Ankara gowns. Size M and L. Deliver to Lekki.", time: "10:23 AM" },
    { from: "ai", text: "Perfect! I've found:\n• Ankara Gown - M - ₦25,000\n• Ankara Gown - L - ₦25,000\n\nTotal: ₦50,000 + ₦2,000 delivery = ₦52,000\n\nPay here: paystack.com/pay/abc123", time: "10:23 AM" },
    { from: "customer", text: "Paid! When will it arrive?", time: "10:25 AM" },
    { from: "ai", text: "Payment confirmed ✓\nYour order #VA-2847 will be delivered tomorrow between 2-4pm. Track here: vayva.ng/t/2847", time: "10:25 AM" },
  ];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* iPhone Frame */}
      <div className="bg-slate-900 rounded-[3rem] p-2 shadow-2xl">
        <div className="bg-white rounded-[2.5rem] overflow-hidden">
          {/* Notch */}
          <div className="bg-black h-6 flex justify-center items-end pb-1">
            <div className="w-20 h-4 bg-black rounded-full" />
          </div>
          
          {/* WhatsApp Header */}
          <div className="bg-emerald-700 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">A</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Amina&apos;s Boutique</p>
              <p className="text-xs text-emerald-200">online</p>
            </div>
          </div>

          {/* Chat */}
          <div className="bg-[#E5DDD5] p-3 space-y-2 h-64 overflow-hidden">
            {messages.slice(0, step + 1).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.from === "customer" ? "justify-start" : "justify-end"}`}
              >
                <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${
                  msg.from === "customer" 
                    ? "bg-white rounded-tl-none" 
                    : "bg-emerald-100 rounded-tr-none"
                }`}>
                  <p className="whitespace-pre-line text-slate-800">{msg.text}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{msg.time}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="bg-slate-100 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-slate-400">
              Message...
            </div>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {messages.map((_, i) => (
          <Button
            type="button"
            variant="ghost"
            key={i}
            onClick={() => setStep(i)}
            className={`w-2 h-2 min-h-0 min-w-0 p-0 rounded-full transition-all ${
              i <= step ? "bg-emerald-500 w-4 hover:bg-emerald-500" : "bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Store Demo Content
function StoreDemo() {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Laptop Frame */}
      <div className="bg-slate-800 rounded-xl p-2 shadow-2xl">
        {/* Browser Chrome */}
        <div className="bg-slate-700 rounded-t-lg px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 bg-slate-600 rounded px-3 py-1 text-xs text-slate-300 text-center">
            aminaboutique.vayva.ng
          </div>
        </div>

        {/* Store Content */}
        <div className="bg-white rounded-b-lg p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Amina&apos;s Boutique</h3>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-full" />
              <div className="w-8 h-8 bg-slate-100 rounded-full" />
            </div>
          </div>

          {/* Hero */}
          <div className="bg-emerald-100 rounded-xl p-4 mb-4">
            <p className="text-xs text-emerald-600 font-medium mb-1">NEW COLLECTION</p>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Autumn Ankara</h4>
            <Button type="button" className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full h-auto hover:bg-emerald-700 hover:text-white">
              Shop Now
            </Button>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-2">
                <div className="bg-slate-200 rounded-lg h-20 mb-2" />
                <p className="text-xs font-medium text-slate-700">Ankara Gown</p>
                <p className="text-xs text-emerald-600 font-bold">₦25,000</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Demo Content
function AIDemo() {
  const features = [
    { icon: MessageCircle, title: "WhatsApp AI", desc: "Auto-replies 24/7" },
    { icon: CheckCircle2, title: "Smart Orders", desc: "Extracts from any message" },
    { icon: Clock, title: "Follow-ups", desc: "Never forget a lead" },
    { icon: Truck, title: "Tracking", desc: "Auto-updates customers" },
  ];

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* iPad Frame */}
      <div className="bg-slate-800 rounded-2xl p-2 shadow-2xl">
        <div className="bg-white rounded-xl overflow-hidden">
          {/* AI Settings UI */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">AI Agent Settings</h4>
                <p className="text-xs text-slate-500">Your 24/7 sales assistant</p>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl mb-4">
              <span className="text-sm font-medium text-emerald-900">AI Auto-Reply</span>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 p-3 rounded-xl"
                >
                  <f.icon className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-xs font-medium text-slate-900">{f.title}</p>
                  <p className="text-[10px] text-slate-500">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-2">This Week</p>
              <div className="flex justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">47</p>
                  <p className="text-[10px] text-slate-500">Conversations</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">12</p>
                  <p className="text-[10px] text-slate-500">Orders Created</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">₦624K</p>
                  <p className="text-[10px] text-slate-500">Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Demo Content
function DashboardDemo() {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Desktop Monitor Frame */}
      <div className="bg-slate-800 rounded-xl p-2 shadow-2xl">
        {/* Monitor Stand */}
        <div className="bg-slate-700 rounded-t-lg px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 bg-slate-600 rounded px-3 py-1 text-xs text-slate-300 text-center">
            merchant.vayva.ng/dashboard
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-slate-50 rounded-b-lg p-4">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Revenue", value: "₦847K", change: "+12%" },
              { label: "Orders", value: "156", change: "+8%" },
              { label: "Customers", value: "89", change: "+15%" },
              { label: "Conversion", value: "3.2%", change: "−0.2%" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-2 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500">{stat.label}</p>
                <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                <p
                  className={cn(
                    "text-[10px]",
                    stat.change.startsWith("−") || stat.change.startsWith("-")
                      ? "text-rose-600"
                      : "text-emerald-600",
                  )}
                >
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3">
            <p className="text-xs font-medium text-slate-700 mb-2">Revenue Overview</p>
            <div className="flex items-end gap-1 h-16">
              {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-100 rounded-t">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-emerald-500 rounded-t"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-2">Recent Orders</p>
            {[
              { id: "#VA-2301", customer: "Chioma A.", amount: "₦45K", status: "completed" },
              { id: "#VA-2300", customer: "Emeka O.", amount: "₦28K", status: "processing" },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    order.status === "completed" ? "bg-emerald-100" : "bg-blue-100"
                  }`}>
                    {order.status === "completed" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-900">{order.id}</p>
                    <p className="text-[10px] text-slate-500">{order.customer}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-900">{order.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveDemo(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState("whatsapp");

  const renderDemo = () => {
    switch (activeTab) {
      case "whatsapp": return <WhatsAppDemo />;
      case "store": return <StoreDemo />;
      case "ai": return <AIDemo />;
      case "dashboard": return <DashboardDemo />;
      default: return <WhatsAppDemo />;
    }
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 100% 100% at 50% 0%, rgba(34, 197, 94, 0.05), transparent 70%)"
        }}
      />

      <div className="container-readable relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            See it in action
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3 mb-4">
            Every channel. One platform.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Click through to see how Vayva works across WhatsApp, your store, AI automation, and dashboard.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  type="button"
                  variant="ghost"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all h-auto ${
                    isActive
                      ? "bg-white text-emerald-700 shadow-sm hover:bg-white hover:text-emerald-700"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-500"}`} />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Demo Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              {renderDemo()}
            </motion.div>
          </AnimatePresence>

          {/* Glow */}
          <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-3xl -z-10 opacity-60" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
          >
            See all features
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
