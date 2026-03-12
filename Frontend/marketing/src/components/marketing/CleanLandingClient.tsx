"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import * as motion from "framer-motion/client";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  TrendingUp,
  CreditCard,
  Store,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Users,
  Wallet,
  Heart,
  Star,
  Lightbulb,
  Cog,
} from "lucide-react";
import {
  IconBrandWhatsapp,
  IconBrandInstagram,
} from "@tabler/icons-react";
import { FeatureArc } from "./FeatureArc";

// ============================================
// LIGHT GREEN & WHITE THEME - VAYVA BRAND
// ============================================
// Primary: Emerald green (emerald-500/600)
// Secondary: Sage green (emerald-100/200)
// Background: White with light emerald tints
// Accents: Soft green glows

// ============================================
// SECTION 1: HERO - CENTERED LAYOUT
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20">
      {/* Soft green organic shapes background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-emerald-200/20 via-teal-100/20 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-teal-100/20 via-emerald-50/20 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%">
            <pattern id="greenDots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#10b981" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#greenDots)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-16">
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center">
          
          {/* AI + WhatsApp badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-semibold text-emerald-700 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            AI-powered • WhatsApp-integrated
          </motion.div>
          
          {/* Headline - Centered */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-slate-900 max-w-4xl"
          >
            Running <span className="relative inline-block text-emerald-600">
              your African
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" stroke="#10b981" strokeWidth="3" fill="none" />
              </svg>
            </span> business just got easier
          </motion.h1>
          
          {/* Dashboard Mockup - Centered and Scaled */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full max-w-[850px] mx-auto mt-8 mb-8"
          >
            {/* Glow effect behind dashboard */}
            <div className="absolute -inset-8 bg-gradient-to-br from-emerald-500/20 via-teal-400/15 to-emerald-400/20 rounded-[40px] blur-3xl opacity-60" />
            
            {/* Dashboard with scale transform */}
            <div className="relative transform scale-[0.95] origin-center">
              {/* Dashboard mock removed */}
            </div>
          </motion.div>
          
          {/* Description Text - Below Dashboard */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8"
          >
            We just launched Vayva to solve a problem we know too well—running an African business 
            shouldn&apos;t require juggling five different apps. Our all-in-one platform brings your 
            storefront, WhatsApp orders, inventory, payments, and deliveries into one intelligent dashboard. 
            Be among the first merchants to shape what Vayva becomes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-6"
          >
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all">
                Start your free trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href={`${APP_URL}/signin`}>
              <Button variant="outline" className="border-2 border-emerald-200 text-slate-700 hover:bg-emerald-50 px-8 py-6 rounded-xl text-base font-medium">
                Sign in
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 text-sm text-slate-500"
          >
            {["7-day free trial", "No credit card needed", "Cancel anytime"].map((stat) => (
              <span key={stat} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {stat}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 2: TRUST BAR - GREEN & WHITE
// ============================================
function TrustBarSection() {
  const stats = [
    { value: "Just", label: "Launched" },
    { value: "100%", label: "Free Beta" },
    { value: "0₦", label: "Setup Cost" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <section className="relative py-8 bg-white border-b border-emerald-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Bank-grade security
            </span>
            <span className="w-px h-4 bg-emerald-200 hidden sm:block" />
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-500" />
              Made with love in Lagos
            </span>
            <span className="w-px h-4 bg-emerald-200 hidden sm:block" />
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              99.9% uptime guarantee
            </span>
          </div>

          <div className="flex items-center gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-emerald-600">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 3: REALITY GAP - SIDE BY SIDE
// ============================================
function RealityGapSection() {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-white to-emerald-50/30 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Smaller Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-[480px] mx-auto lg:mx-0"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-emerald-900/10">
              <Image
                src="/images/chaos-problem.jpg"
                alt="African business owner managing orders"
                width={480}
                height={360}
                className="w-full h-auto object-cover"
                unoptimized
              />
              {/* Light green overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent" />
            </div>
            {/* Floating element */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-lg border border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl">😰</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Overwhelmed?</p>
                  <p className="text-xs text-slate-500">We understand</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content - Commerce Focus */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-4 block">
              Commerce in Africa Today
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
              Running a commerce business means juggling
              <span className="relative inline-block text-emerald-600 mx-2">
                too many tools
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
                </svg>
              </span>
at once.
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-4">
              You&apos;re managing orders on WhatsApp, tracking inventory in spreadsheets, 
              handling payments manually, and coordinating delivery through phone calls. 
              It&apos;s exhausting, and it&apos;s holding your business back.
            </p>

            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Every missed message is a lost sale. Every late delivery is a disappointed customer. 
              And at the end of the day, you&apos;re too tired to grow your business because 
              you&apos;re stuck running it.
            </p>

            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-2xl">💡</span>
              <p className="text-slate-700 font-medium">
                What if all your commerce tools worked together in one place?
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 4: SOLUTION - SIDE BY SIDE REVERSED
// ============================================
function SolutionSection() {
  const pillars = [
    {
      icon: Store,
      title: "Your storefront",
      description: "Professional web presence that works 24/7"
    },
    {
      icon: IconBrandWhatsapp,
      title: "Order capture",
      description: "WhatsApp & Instagram orders organized automatically"
    },
    {
      icon: CreditCard,
      title: "Payments",
      description: "Instant settlement to your bank account"
    },
    {
      icon: Truck,
      title: "Delivery",
      description: "Coordinated logistics from one dashboard"
    },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-50/30 via-transparent to-emerald-50/20" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Content - Unified Tools Focus */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-4 block">
              Everything in One Place
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
              We brought every commerce tool you need
              <span className="relative inline-block text-emerald-600 mx-2">
                under one roof
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
                </svg>
              </span>.
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Imagine managing your entire commerce operation from a single dashboard. 
              Orders flow in automatically. Inventory updates in real-time. Payments 
              settle instantly. Delivery is coordinated with a click.
            </p>

            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              No more switching between apps. No more manual data entry. No more wondering 
              if you&apos;re missing something important. Just clarity, control, and the 
              freedom to focus on growing your business.
            </p>

            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-xl shadow-emerald-500/20">
                Experience the difference
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Right: Smaller Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2 relative max-w-[480px] mx-auto lg:mx-0 lg:ml-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-emerald-900/10">
              <Image
                src="/images/calm-solution.jpg"
                alt="Business owner using Vayva"
                width={480}
                height={360}
                className="w-full h-auto object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent" />
            </div>
            {/* Floating element */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg border border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl">😌</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Peace of mind</p>
                  <p className="text-xs text-slate-500">Everything organized</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pillar cards below */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl bg-white border border-emerald-100 shadow-lg shadow-emerald-100/30 hover:shadow-xl hover:border-emerald-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <pillar.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{pillar.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 5: INDUSTRY TABS - GREEN & WHITE
// ============================================
function IndustrySection() {
  const industries = [
    { name: "Fashion", icon: "👗", color: "from-emerald-100 to-teal-100", desc: "From boutique to beloved brand" },
    { name: "Beauty", icon: "💄", color: "from-teal-100 to-emerald-100", desc: "Scale your glow, grow your business" },
    { name: "Food", icon: "🍲", color: "from-green-100 to-emerald-100", desc: "Serve more customers with ease" },
    { name: "Retail", icon: "🛍️", color: "from-teal-100 to-cyan-100", desc: "Modernize your store operations" },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-b from-emerald-50/50 to-white overflow-hidden">
      {/* Light green pattern background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%">
          <pattern id="industryPattern" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="24" r="3" fill="#10b981" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#industryPattern)" />
        </svg>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
            For Every African Entrepreneur
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
            Whatever you sell,
            <span className="relative inline-block text-emerald-600 mx-2">
              we&apos;ve got you
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
              </svg>
            </span>.
          </h2>
          <p className="text-lg text-slate-600">
            From Lagos fashion boutiques to Abuja food vendors—Vayva adapts to how your business actually works.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-2xl bg-white border border-emerald-100 shadow-lg shadow-emerald-100/30 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <span className="text-3xl">{industry.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{industry.name}</h3>
              <p className="text-slate-600 mb-4">{industry.desc}</p>
              <div className="flex items-center text-emerald-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Learn more
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 6: GROWTH TECHNOLOGY - LIGHT GREEN
// ============================================
function GrowthTechSection() {
  const features = [
    { icon: Users, title: "Know your customers", desc: "Understand who buys and when they buy" },
    { icon: Cog, title: "Work smarter", desc: "Automation that saves you hours every day" },
    { icon: Wallet, title: "Track every naira", desc: "Real-time revenue and profit insights" },
    { icon: Package, title: "Never run out", desc: "Smart inventory alerts and forecasting" },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-br from-teal-50 via-emerald-50/30 to-white overflow-hidden">
      {/* Green wave decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-32" preserveAspectRatio="none" viewBox="0 0 1440 120">
          <path 
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" 
            fill="url(#greenWave)"
            opacity="0.2"
          />
          <defs>
            <linearGradient id="greenWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
            Technology That Grows With You
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
            Built to scale from
            <span className="relative inline-block text-emerald-600 mx-2">
              your first sale
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
              </svg>
            </span>
            to your thousandth.
          </h2>
          <p className="text-lg text-slate-600">
            Our technology grows alongside your ambition—whether you&apos;re just starting or scaling to new heights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-lg shadow-emerald-100/30 hover:shadow-xl hover:border-emerald-200 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 7: FEATURE ACCORDION - CLEAN GREEN
// ============================================
function FeatureAccordion() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  type FeatureItem =
    | {
        kind: "single";
        icon: React.ComponentType<{ className?: string }>;
        title: string;
        content: string;
      }
    | {
        kind: "multi";
        icons: Array<React.ComponentType<{ className?: string }>>;
        title: string;
        content: string;
      };

  const features: FeatureItem[] = [
    {
      kind: "single",
      icon: Store,
      title: "Professional Storefront",
      content: "Beautiful, mobile-optimized templates that make your business look established from day one. Custom domains, SEO-ready, and designed to convert visitors into customers."
    },
    {
      kind: "multi",
      icons: [IconBrandWhatsapp, IconBrandInstagram],
      title: "Unified Order Capture",
      content: "All your orders—whether from WhatsApp, Instagram, or your website—flow into one organized dashboard. No more scattered DMs or missed sales."
    },
    {
      kind: "single",
      icon: Package,
      title: "Smart Inventory Management",
      content: "Real-time stock tracking across all channels. Low-stock alerts, automatic updates, and forecasting so you never run out of your bestsellers."
    },
    {
      kind: "single",
      icon: CreditCard,
      title: "Integrated Payments",
      content: "Paystack-powered cards, bank transfers, and USSD—all automated. Instant settlement to your Nigerian bank account with automatic reconciliation."
    },
    {
      kind: "single",
      icon: Truck,
      title: "Coordinated Delivery",
      content: "One-click dispatch with Kwik Delivery for same-day Lagos deliveries. Live tracking for you and your customers, nationwide options available."
    },
    {
      kind: "single",
      icon: BarChart3,
      title: "Business Intelligence",
      content: "Real-time dashboards showing revenue, bestsellers, customer trends, and growth opportunities. Export reports for your accountant or investors."
    },
  ];

  const activeIndex = openIndex ?? 0;
  const active = features[Math.min(Math.max(activeIndex, 0), features.length - 1)];
  const arcStartDeg = 210;
  const arcEndDeg = -30;
  const arcSpan = arcStartDeg - arcEndDeg;
  const arcStep = features.length > 1 ? arcSpan / (features.length - 1) : 0;

  return (
    <section className="relative py-16 bg-white">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
            Everything You Need
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
            All the tools to
            <span className="relative inline-block text-emerald-600 mx-2">
              run and grow
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
              </svg>
            </span>
            your business.
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            A complete suite of commerce tools designed specifically for African businesses.
          </p>
        </div>

        <div className="md:hidden space-y-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border-2 transition-all ${
                openIndex === i
                  ? "bg-white border-emerald-300 shadow-lg shadow-emerald-100/50"
                  : "bg-slate-50 border-slate-100 hover:border-emerald-200"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      openIndex === i
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100"
                        : "bg-white"
                    }`}
                  >
                    {feature.kind === "multi" ? (
                      <div className="flex -space-x-1">
                        {feature.icons.map((IconComponent, idx) => (
                          <IconComponent
                            key={idx}
                            className={`w-5 h-5 transition-colors ${
                              openIndex === i
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <feature.icon
                        className={`w-5 h-5 transition-colors ${
                          openIndex === i
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`font-bold text-lg transition-colors ${
                      openIndex === i ? "text-slate-900" : "text-slate-600"
                    }`}
                  >
                    {feature.title}
                  </span>
                </div>
                {openIndex === i ? (
                  <ChevronUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 pl-[88px]">
                  <p className="text-slate-600 leading-relaxed">
                    {feature.content}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Desktop Arc Layout with Vayva Logo Center */}
        <div className="hidden md:block">
          <div className="relative mx-auto w-full max-w-[1000px]">
            {/* Main semicircle container */}
            <div className="relative w-full h-[500px]">
              
              {/* Background semicircle segments */}
              <div className="absolute inset-x-0 bottom-0 h-[400px] overflow-hidden">
                <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
                  {/* 6 colored segments forming semicircle */}
                  {features.map((_, i) => {
                    const startAngle = 180 - (i * 30); // 180 to 0 degrees
                    const endAngle = 180 - ((i + 1) * 30);
                    const colors = [
                      "#f0fdf4", // emerald-50
                      "#ecfdf5", // emerald-100
                      "#d1fae5", // emerald-200
                      "#a7f3d0", // emerald-300
                      "#6ee7b7", // emerald-400
                      "#34d399", // emerald-500
                    ];
                    const rad1 = (startAngle * Math.PI) / 180;
                    const rad2 = (endAngle * Math.PI) / 180;
                    const r = 180;
                    const cx = 200;
                    const cy = 200;
                    const x1 = cx + Math.cos(rad1) * r;
                    const y1 = cy - Math.sin(rad1) * r;
                    const x2 = cx + Math.cos(rad2) * r;
                    const y2 = cy - Math.sin(rad2) * r;
                    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2} Z`;
                    
                    return (
                      <path
                        key={i}
                        d={path}
                        fill={colors[i]}
                        className="transition-opacity duration-300"
                        style={{ opacity: i === activeIndex ? 0.6 : 0.3 }}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Center Logo Circle */}
              <div className="absolute left-1/2 bottom-[40px] -translate-x-1/2 z-20">
                <div className="w-[160px] h-[80px] rounded-t-full bg-white border-2 border-emerald-300 shadow-xl flex items-center justify-center pt-4">
                  <Image
                    src="/vayva-logo-official.svg"
                    alt="Vayva"
                    width={80}
                    height={55}
                    className="w-20 h-auto"
                    priority
                  />
                </div>
              </div>

              {/* Feature cards positioned on the arc */}
              <div className="absolute inset-0">
                {features.map((feature, i) => {
                  const isActive = i === activeIndex;
                  // Position cards along the arc
                  const angle = 180 - (i * 30) - 15; // Center of each 30-degree segment
                  const rad = (angle * Math.PI) / 180;
                  const radius = 140; // Distance from center
                  const centerX = 50; // percentage
                  const bottomY = 80; // percentage from bottom
                  const x = centerX + (Math.cos(rad) * radius / 5);
                  const y = bottomY - (Math.sin(rad) * radius / 5);

                  return (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => setOpenIndex(i)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className={`absolute z-10 transition-all duration-300 ${
                        isActive ? "scale-110" : "hover:scale-105"
                      }`}
                      style={{
                        left: `${x}%`,
                        bottom: `${y}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div
                        className={`w-[160px] text-center transition-all duration-300 ${
                          isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        {/* Number Circle */}
                        <div
                          className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold border-2 transition-all ${
                            isActive
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-300"
                              : "bg-white border-emerald-300 text-emerald-600"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>

                        {/* Icon */}
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          isActive ? "bg-emerald-500" : "bg-white shadow-md"
                        }`}>
                          {feature.kind === "multi" ? (
                            <div className="flex -space-x-1">
                              {feature.icons.map((Icon, idx) => (
                                <Icon 
                                  key={idx} 
                                  className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600"}`} 
                                />
                              ))}
                            </div>
                          ) : (
                            <feature.icon 
                              className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-600"}`} 
                            />
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-xs font-bold leading-tight ${
                          isActive ? "text-slate-900" : "text-slate-600"
                        }`}>
                          {feature.title}
                        </h3>

                        {/* Description on hover/active */}
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-[10px] text-slate-500 mt-1 leading-tight"
                          >
                            {feature.content.slice(0, 60)}...
                          </motion.p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Active feature detail panel */}
              <div className="absolute left-1/2 bottom-[140px] -translate-x-1/2 w-[320px]">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 backdrop-blur-sm rounded-xl border-2 border-emerald-200 shadow-xl px-6 py-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                      {active.kind === "multi" ? (
                        <div className="flex -space-x-1">
                          {active.icons.map((Icon, idx) => (
                            <Icon key={idx} className="w-3 h-3 text-white" />
                          ))}
                        </div>
                      ) : (
                        <active.icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{active.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {active.content}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 9: FEATURE REQUEST - CUSTOMER-DRIVEN
// ============================================
function FeatureRequestSection() {
  const requestedFeatures = [
    { industry: "Fashion", feature: "Size chart customization", votes: 12, status: "live" },
    { industry: "Food", feature: "Kitchen display system", votes: 8, status: "building" },
    { industry: "Beauty", feature: "Appointment scheduling", votes: 15, status: "live" },
    { industry: "Retail", feature: "Barcode scanning", votes: 6, status: "planned" },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-b from-white to-emerald-50/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-4 block">
              Built With You, For You
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Need something
              <span className="relative inline-block text-emerald-600 mx-2">
                for your industry
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
                </svg>
              </span>?
              <br />
              We&apos;ll build it.
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Every industry has unique challenges. Tell us what your business needs, 
              and our team will research, design, and build it. From fashion boutiques 
              needing size charts to food vendors wanting kitchen displays—we listen, 
              then we deliver.
            </p>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              This is how we&apos;ve built tools for agriculture exports, event ticketing, 
              salon appointments, and auto parts inventory. Your request could be next.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-xl shadow-emerald-500/20">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Request a feature
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" className="border-2 border-emerald-200 text-slate-700 hover:bg-emerald-50 px-8 py-6 rounded-xl text-base font-medium">
                  See all features
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Feature cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
              Recently requested & shipped
            </p>

            {requestedFeatures.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-white border border-emerald-100 shadow-lg shadow-emerald-100/30 hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <span className="text-lg">
                        {item.industry === "Fashion" && "👗"}
                        {item.industry === "Food" && "🍲"}
                        {item.industry === "Beauty" && "💄"}
                        {item.industry === "Retail" && "🛍️"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{item.feature}</h3>
                      <p className="text-sm text-slate-500">Requested by {item.industry} merchants</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600">
                      {item.votes} votes
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === "live" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : item.status === "building"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {item.status === "live" && "✓ Live"}
                      {item.status === "building" && "🔨 Building"}
                      {item.status === "planned" && "📋 Planned"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-center">
              <p className="text-slate-600 text-sm">
                <span className="font-semibold text-emerald-700">Dozens of features</span> shipped based on merchant feedback
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 10: FINAL CTA - LIGHT GREEN
// ============================================
function FinalCTASection() {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-50">
      {/* Light green decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-transparent rounded-full blur-3xl" />
      
      {/* Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%">
          <pattern id="ctaPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="#10b981" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#ctaPattern)" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 text-sm font-semibold text-emerald-700 mb-8">
            <Star className="w-4 h-4 fill-emerald-500" />
            Just launched — be an early adopter
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Ready to transform
            <br />
            <span className="relative inline-block text-emerald-600">
              your business
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" stroke="#10b981" strokeWidth="3" fill="none" />
              </svg>
            </span>?
          </h2>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Join thousands of African entrepreneurs who&apos;ve moved from chaos to clarity. 
            Your free trial starts today.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-7 rounded-xl text-lg font-bold shadow-xl shadow-emerald-500/30">
                Start free trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-emerald-300 text-slate-700 hover:bg-white/80 px-10 py-7 rounded-xl text-lg font-semibold">
                View pricing
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-500 mt-8">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// MAIN CLEAN LANDING CLIENT
// ============================================
export function CleanLandingClient(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <TrustBarSection />
      <RealityGapSection />
      <SolutionSection />
      <IndustrySection />
      <GrowthTechSection />
      <FeatureArc />
      <FeatureRequestSection />
      <FinalCTASection />
    </main>
  );
}

export default CleanLandingClient;
