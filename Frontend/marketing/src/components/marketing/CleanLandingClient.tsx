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
  CreditCard,
  Store,
  Package,
  Truck,
  Users,
  Wallet,
  Heart,
  Star,
  Cog,
} from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { getOfferCopy, QUARTERLY_DISCOUNT_PERCENT } from "@/config/pricing";
import { useMarketingOffer } from "@/context/MarketingOfferContext";
import { IndustryFeatureRequest } from "./IndustryFeatureRequest";
import { DashboardPreviewSection } from "./DashboardPreview";
import { ProDashboardMarketing } from "./ProDashboardMarketing";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

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
  const { starterFirstMonthFree } = useMarketingOffer();
  const offerCopy = getOfferCopy(starterFirstMonthFree);
  const heroTrustChips = [
    offerCopy.trialBadge,
    offerCopy.noCard,
    offerCopy.cancelAnytime,
  ] as const;

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-transparent w-full min-w-0">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-emerald-100/10 via-teal-50/10 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-teal-50/10 via-emerald-50/10 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-16 w-full min-w-0">
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center">
       
          {/* Business OS + AI badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-xs sm:text-sm font-semibold text-slate-700 mb-6 text-center max-w-[95vw]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              <span className="md:hidden">Business OS · AI-powered</span>
              <span className="hidden md:inline">
                Business Operating System • Powered by Artificial Intelligence
              </span>
            </span>
          </motion.div>
          
          {/* Headline - Centered */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-slate-900 max-w-4xl text-balance px-1"
          >
            The <span className="relative inline-block text-emerald-600">
              operating system
              <svg className="absolute -bottom-2 left-0 w-full hidden sm:block" height="12" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                <path d="M0,8 Q50,0 100,8 T200,8" stroke="#10b981" strokeWidth="3" fill="none" />
              </svg>
            </span> that runs your business smoothly with AI
          </motion.h1>
          
          {/* Description Text - Above Dashboard */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mb-8 text-pretty px-1"
          >
            <span className="md:hidden">
              Orders, inventory, payments, and deliveries in one dashboard—AI handles the busywork.
            </span>
            <span className="hidden md:inline">
              Vayva is the complete operating system for your business. Manage orders, inventory,
              payments, deliveries, and customer relationships in one unified dashboard.
              Artificial intelligence handles the busywork while you focus on growth.
            </span>
          </motion.p>

          {/* Dashboard Mockup - Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative w-full max-w-[1000px] mx-auto mt-8 mb-8 hidden md:block"
          >
            {/* Subtle glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/15 via-teal-400/10 to-emerald-400/15 rounded-3xl blur-2xl opacity-40" />

            {/* Pro Dashboard UI Replica */}
            <div className="relative bg-white rounded-2xl shadow-md border border-slate-200/50 overflow-hidden">
              {/* Browser Header */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1 rounded-md bg-white px-3 py-1.5 font-mono text-xs text-slate-500">
                  merchant.vayva.ng/dashboard
                </div>
              </div>

              {/* Dashboard Content - Scrollable */}
              <div className="p-4 max-h-[600px] overflow-auto">
                <ProDashboardMarketing />
              </div>
            </div>
          </motion.div>

          {/* Mobile Dashboard Preview - Scaled down full dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative w-full mx-auto mt-6 mb-6 md:hidden overflow-hidden rounded-xl border border-slate-200/50 shadow-md"
          >
            <div className="absolute -inset-3 bg-gradient-to-br from-emerald-500/15 via-teal-400/10 to-emerald-400/15 rounded-2xl blur-xl opacity-40" />
            <div className="relative bg-white overflow-hidden">
              {/* Mini browser bar */}
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1 rounded bg-white px-2 py-1 font-mono text-[10px] text-slate-500">
                  merchant.vayva.ng/dashboard
                </div>
              </div>
              <p className="border-b border-slate-100 bg-slate-50/80 px-2 py-1 text-center text-[9px] font-medium text-slate-400">
                Live preview · Actual merchant dashboard
              </p>
              {/* Scaled-down full dashboard */}
              <div className="origin-top-left" style={{ transform: "scale(0.55)", width: "182%", maxHeight: "400px", overflow: "hidden" }}>
                <ProDashboardMarketing />
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-6"
          >
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all">
                Get Started
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
            {heroTrustChips.map((stat) => (
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
    { value: "OS", label: "Business Platform" },
    { value: "Global", label: "Works from Anywhere" },
    { value: "0₦", label: "Setup Cost" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <section className="relative py-8 bg-transparent border-b border-emerald-100/50">
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
              Built for businesses everywhere
            </span>
            <span className="w-px h-4 bg-emerald-200 hidden sm:block" />
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Built for high availability
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
    <section className="relative py-20 lg:py-28 bg-transparent overflow-hidden">
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
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/images/chaos-problem.jpg"
                alt="African business owner managing orders"
                width={480}
                height={360}
                className="w-full h-auto object-cover"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent" />
            </div>
            {/* Floating element */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-sm border border-slate-200/80">
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
              The Problem Today
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
              Running a business means juggling
              <span className="relative inline-block text-emerald-600 mx-2">
                too many disconnected tools
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
                </svg>
              </span>
at once—no matter where you are.
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-4">
              You&apos;re managing orders on WhatsApp, tracking inventory in spreadsheets, 
              handling payments manually, and coordinating delivery through phone calls. 
              It&apos;s exhausting whether you&apos;re in Lagos, Dubai, or London—and it&apos;s holding your business back.
            </p>

            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Every missed message is a lost sale. Every late delivery is a disappointed customer. 
              And at the end of the day, you&apos;re too tired to grow your business because 
              you&apos;re stuck running it.
            </p>

            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-2xl">💡</span>
              <p className="text-slate-700 font-medium">
                What if your entire business ran smoothly from one unified operating system powered by AI?
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
    <section className="relative py-20 lg:py-28 bg-transparent overflow-hidden">

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
              </span>—powered by artificial intelligence.
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Imagine managing your entire commerce operation from a single dashboard. 
              Orders flow in automatically. Inventory updates in real-time. Payments 
              settle instantly. Delivery is coordinated with a click. All powered by 
              intelligent automation that learns your business.
            </p>

            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              No more switching between apps. No more manual data entry. No more wondering 
              if you&apos;re missing something important. Just clarity, control, and the 
              freedom to focus on growing your business with AI-powered insights.
            </p>

            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl text-base font-semibold shadow-md">
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
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/images/calm-solution.jpg"
                alt="Business owner using Vayva"
                width={480}
                height={360}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent" />
            </div>
            {/* Floating element */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-sm border border-slate-200/80">
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
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group h-full"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <pillar.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{pillar.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="md:hidden mt-12 -mx-1">
          <MarketingSnapRow
            ariaLabel="What you get with Vayva"
            hint="Swipe through highlights"
            showDots
            dotCount={pillars.length}
          >
            {pillars.map((pillar, i) => (
              <MarketingSnapItem key={i}>
                <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm h-full">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-3">
                    <pillar.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{pillar.title}</h3>
                  <p className="text-sm text-slate-600 leading-snug">{pillar.description}</p>
                </div>
              </MarketingSnapItem>
            ))}
          </MarketingSnapRow>
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
    { slug: "fashion", name: "Fashion", icon: "👗", color: "from-emerald-100 to-teal-100", desc: "From boutique to beloved brand" },
    { slug: "beauty", name: "Beauty", icon: "💄", color: "from-teal-100 to-emerald-100", desc: "Scale your glow, grow your business" },
    { slug: "food", name: "Food", icon: "🍲", color: "from-green-100 to-emerald-100", desc: "Serve more customers with ease" },
    { slug: "retail", name: "Retail", icon: "🛍️", color: "from-teal-100 to-cyan-100", desc: "Modernize your store operations" },
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
            For Every Business Owner
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
            Whatever you sell, wherever you are,
            <span className="relative inline-block text-emerald-600 mx-2">
              we&apos;ve got you covered
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
              </svg>
            </span>.
          </h2>
          <p className="text-lg text-slate-600">
            From Lagos fashion boutiques to Dubai online sellers—Vayva adapts to how your business actually works.
          </p>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, i) => (
            <motion.div
              key={industry.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="h-full"
            >
              <Link
                href={`/industries/${industry.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm outline-none ring-emerald-500/40 transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus-visible:ring-2"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${industry.color} mb-6 flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <span className="text-3xl" aria-hidden>
                    {industry.icon}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{industry.name}</h3>
                <p className="mb-4 flex-grow text-slate-600">{industry.desc}</p>
                <span className="mt-auto flex items-center text-sm font-semibold text-emerald-600 transition-transform group-hover:translate-x-1">
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="md:hidden -mx-1">
          <MarketingSnapRow
            ariaLabel="Industries we serve"
            hint="Swipe to explore industries"
            showDots
            dotCount={industries.length}
          >
            {industries.map((industry) => (
              <MarketingSnapItem key={industry.slug}>
                <Link
                  href={`/industries/${industry.slug}`}
                  className="group flex h-full min-h-[220px] flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${industry.color} mb-4 flex items-center justify-center`}>
                    <span className="text-2xl" aria-hidden>
                      {industry.icon}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{industry.name}</h3>
                  <p className="mb-3 flex-grow text-sm text-slate-600 leading-snug">{industry.desc}</p>
                  <span className="mt-auto flex items-center text-sm font-semibold text-emerald-600">
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </MarketingSnapItem>
            ))}
          </MarketingSnapRow>
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
            Built to scale from your first sale to your thousandth—
            <span className="relative inline-block text-emerald-600 mx-2">
              from any location
              <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,6 Q25,0 50,6 T100,6" stroke="#10b981" strokeWidth="2" fill="none" />
              </svg>
            </span>.
          </h2>
          <p className="text-lg text-slate-600">
            Our operating system grows alongside your ambition—whether you&apos;re just starting or scaling to new heights.
          </p>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="md:hidden -mx-1">
          <MarketingSnapRow
            ariaLabel="Growth features"
            hint="Swipe for more"
            showDots
            dotCount={features.length}
          >
            {features.map((feature, i) => (
              <MarketingSnapItem key={i}>
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-snug">{feature.desc}</p>
                </div>
              </MarketingSnapItem>
            ))}
          </MarketingSnapRow>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 10: FINAL CTA - LIGHT GREEN
// ============================================
function FinalCTASection() {
  const { starterFirstMonthFree } = useMarketingOffer();
  const offerCopy = getOfferCopy(starterFirstMonthFree);

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-transparent">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100/15 to-transparent rounded-full blur-3xl" />

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

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-5 sm:mb-6 leading-tight text-balance px-1">
            Ready to transform your business?
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-1 text-pretty">
            <span className="md:hidden">
              From chat chaos to clear orders and payments. {offerCopy.trialBadge} on Starter &amp; Pro.
            </span>
            <span className="hidden md:inline">
              Move from chat chaos to clear orders, payments, and delivery in one place.{" "}
              {offerCopy.trialFootnote}{" "}
              Save {QUARTERLY_DISCOUNT_PERCENT}% when you pay quarterly at checkout.
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-7 rounded-xl text-lg font-bold shadow-md">
                Get Started
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
            {offerCopy.trialBadge} on Starter &amp; Pro • {offerCopy.noCard} for trials •{" "}
            {offerCopy.cancelAnytime}
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
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-transparent">
      <HeroSection />
      <TrustBarSection />
      <RealityGapSection />
      <SolutionSection />
      <IndustrySection />
      <GrowthTechSection />
      <DashboardPreviewSection />
      <IndustryFeatureRequest industry="your business" />
      <FinalCTASection />
    </main>
  );
}

export default CleanLandingClient;
