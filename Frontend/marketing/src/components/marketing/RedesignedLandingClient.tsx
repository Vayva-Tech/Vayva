"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@vayva/ui";
import {
  MessageCircle,
  CreditCard,
  Package,
  Truck,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  Play,
  Layers,
  Zap,
  Shield,
  Headphones,
  TrendingUp,
  Smartphone,
  Globe
} from "lucide-react";
import { APP_URL } from "@/lib/constants";
import { landingContent } from "@/data/marketing-content";

// Industry Selector Component
const industries = [
  { id: "fashion", name: "Fashion", icon: "👗", description: "Variant management, lookbooks" },
  { id: "food", name: "Food & Beverage", icon: "🍽️", description: "Kitchen display, delivery" },
  { id: "beauty", name: "Beauty & Wellness", icon: "💅", description: "Bookings, no-show reduction" },
  { id: "electronics", name: "Electronics", icon: "📱", description: "IMEI tracking, warranties" },
  { id: "services", name: "Professional Services", icon: "💼", description: "Scheduling, proposals" },
  { id: "real_estate", name: "Real Estate", icon: "🏠", description: "Listings, viewings" },
];

function IndustrySelector() {
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);

  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
      <div className="relative rounded-[34px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-8 shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Built for YOUR industry</h3>
        
        {/* Industry Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => setSelectedIndustry(industry)}
              className={`p-4 rounded-2xl transition-all ${
                selectedIndustry.id === industry.id
                  ? "bg-emerald-500 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <div className="text-3xl mb-2">{industry.icon}</div>
              <div className="text-sm font-semibold">{industry.name}</div>
            </button>
          ))}
        </div>

        {/* Industry Preview */}
        <motion.div
          key={selectedIndustry.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{selectedIndustry.icon}</div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">{selectedIndustry.name}</h4>
              <p className="text-sm text-slate-600">{selectedIndustry.description}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
              <p className="text-sm text-slate-700">Industry-specific dashboard with relevant KPIs</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
              <p className="text-sm text-slate-700">Workflows designed for how you actually work</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
              <p className="text-sm text-slate-700">Templates and features that match your business</p>
            </div>
          </div>

          <Link href={`/industries/${selectedIndustry.id}`} className="mt-6 inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800">
            Explore {selectedIndustry.name} →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// Smart Order Management Demo
function OrderManagementDemo() {
  const [messages, setMessages] = useState([
    { id: 1, type: "customer", text: "Hi! I want 3 black bags and 2 ankara dresses", time: "2 min ago" },
    { id: 2, type: "system", text: "Order created automatically", time: "now" },
  ]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* WhatsApp Preview */}
      <div className="bg-green-50 rounded-3xl p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-6 h-6 text-green-600" />
          <h4 className="font-bold text-slate-900">Customer Message</h4>
        </div>
        <div className="space-y-3">
          {messages.filter(m => m.type === "customer").map((msg) => (
            <div key={msg.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-slate-800">{msg.text}</p>
              <p className="text-xs text-slate-500 mt-2">{msg.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <h4 className="font-bold text-slate-900">Auto-Created Order</h4>
        </div>
        <div className="space-y-3">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-emerald-900">Order #VYA-4721</span>
              <span className="text-xs px-2 py-1 bg-emerald-200 text-emerald-800 rounded-full font-semibold">Created</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Black Bag × 3</span>
                <span className="font-bold text-slate-900">₦27,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Ankara Dress × 2</span>
                <span className="font-bold text-slate-900">₦18,500</span>
              </div>
              <div className="border-t border-emerald-300 pt-2 flex justify-between font-bold">
                <span className="text-emerald-900">Total</span>
                <span className="text-emerald-700">₦45,500</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Order organized automatically—no manual typing needed</p>
        </div>
      </div>
    </div>
  );
}

// Operating System Layers
function OSLayers() {
  const layers = [
    {
      icon: MessageCircle,
      title: "Order Management",
      description: "WhatsApp & Instagram messages become organized orders",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Cards, transfers, USSD—all payment methods work seamlessly",
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      icon: Package,
      title: "Inventory Intelligence",
      description: "Track stock, get alerts, know what to reorder",
      color: "bg-purple-500",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Truck,
      title: "Delivery Operations",
      description: "Live tracking, customer updates, proof of delivery",
      color: "bg-orange-500",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Users,
      title: "Customer Intelligence",
      description: "Know your customers, their preferences, purchase history",
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Revenue trends, product insights, forecasting",
      color: "bg-rose-500",
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {layers.map((layer, index) => (
        <motion.div
          key={layer.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="group relative"
        >
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-300" />
          <div className="relative bg-white rounded-2xl p-6 border-2 border-slate-900/10 shadow-[0_10px_30px_rgba(15,23,42,0.08)] h-full group-hover:-translate-y-1 transition-transform">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${layer.gradient} flex items-center justify-center text-white mb-4`}>
              <layer.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{layer.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{layer.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Merchant Success Stories
function MerchantStories() {
  const stories = [
    {
      name: "Fatima Yusuf",
      business: "Luxe Fashion House",
      location: "Lagos",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
      quote: "I used to miss 10+ orders daily from WhatsApp chaos. Vayva captures everything automatically. Now I'm doing ₦2.3M monthly without the stress.",
      stats: { revenue: "₦2.3M", orders: "450/mo", team: "2 staff" },
    },
    {
      name: "Chidi Okafor",
      business: "Quick Bites",
      location: "Abuja",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      quote: "During rush hour, Vayva sends orders straight to the kitchen display. Zero mistakes, faster turnover. We're serving 2x more customers with the same staff.",
      stats: { revenue: "400+/mo", speed: "50% faster", team: "Same staff" },
    },
    {
      name: "Amina Bello",
      business: "Glow Spa",
      location: "Lekki",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      quote: "Clients book on Instagram, pay deposits upfront, and show up on time. Vayva eliminated my no-show problem completely.",
      stats: { revenue: "85% rate", noshow: "60% fewer", team: "3x growth" },
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {stories.map((story, index) => (
        <motion.div
          key={story.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[34px] border-2 border-emerald-200/60" />
          <div className="relative bg-white rounded-[34px] border-2 border-slate-900/10 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.1)] h-full">
            <div className="flex items-center gap-4 mb-6">
              <img src={story.image} alt={story.name} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-slate-900">{story.name}</h4>
                <p className="text-sm text-slate-600">{story.business}, {story.location}</p>
              </div>
            </div>
            <blockquote className="text-slate-700 leading-relaxed mb-6">"{story.quote}"</blockquote>
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-200">
              {Object.entries(story.stats).map(([key, value]) => (
                <div key={key}>
                  <div className="text-lg font-bold text-emerald-600">{value}</div>
                  <div className="text-xs text-slate-500 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function RedesignedLandingClient(): React.JSX.Element {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900/10 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg mb-8"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {landingContent.heroBadge}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight mb-6"
          >
            {landingContent.heroTitle}
            <br />
            <span className="relative inline-flex text-emerald-600">
              {landingContent.heroHighlight}
              <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M3 8C75 4 225 4 297 8" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            {landingContent.heroDescription}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-2xl text-base font-semibold shadow-[0_20px_50px_rgba(15,23,42,0.25)] transition-all hover:scale-105">
                Start your free store
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/how-vayva-works">
              <Button variant="outline" className="border-2 border-slate-900/15 text-slate-700 hover:bg-white/60 px-8 py-6 rounded-2xl text-base font-semibold backdrop-blur-sm">
                <Play className="mr-2 w-5 h-5" />
                Watch 90-second demo
              </Button>
            </Link>
          </motion.div>

          {/* Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-slate-600"
          >
            {landingContent.heroStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {stat}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Operating System Layers */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold mb-4">Why "operating system" matters</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Not just tools. <span className="text-emerald-600">Infrastructure.</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Like Windows runs your laptop, Vayva runs your business—coordinating every message, payment, product, and delivery in one unified system.
            </p>
          </div>

          <OSLayers />
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold mb-4">See it in action</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              From conversation to order in seconds
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Customer messages become organized orders automatically—no manual typing, no missed sales.
            </p>
          </div>

          <OrderManagementDemo />
        </div>
      </section>

      {/* Industry Selector */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <IndustrySelector />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold mb-4">Success stories</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Built by business owners, for business owners
            </h2>
          </div>

          <MerchantStories />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[34px] border-2 border-emerald-200/60" />
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[34px] p-12 shadow-[0_20px_50px_rgba(15,23,42,0.2)]">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to upgrade your business infrastructure?
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Join 2,000+ businesses running on Vayva
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`${APP_URL}/signup`}>
                  <Button className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-6 rounded-2xl text-base font-semibold shadow-xl">
                    Get your free store
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-2xl text-base font-semibold">
                    Book a demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-slate-400 mt-6">
                7-day trial on paid plans • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
