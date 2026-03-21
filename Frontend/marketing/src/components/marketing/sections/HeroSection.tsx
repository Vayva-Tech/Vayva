"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowRight as ArrowRight, IconSparkles as Sparkles, IconBolt as Zap, IconShield as Shield, IconClock as Clock, IconTrendingUp as TrendingUp, IconUsers as Users, IconPackage as Package, IconCreditCard as CreditCard, IconMessageCircle as MessageCircle, IconChartBar as BarChart3, IconCircleCheck as CheckCircle2 } from "@tabler/icons-react";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
        <Icon size={20} className="text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Testimonial card
function TestimonialCard({
  quote,
  author,
  role,
  delay,
}: {
  quote: string;
  author: string;
  role: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
    >
      <p className="text-zinc-300 mb-4 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm">
          {author.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{author}</p>
          <p className="text-xs text-zinc-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Dashboard Mockup Component
function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent rounded-3xl blur-2xl" />
      
      {/* Mockup Container */}
      <div className="relative bg-[#0f0f0f] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
        {/* Browser Chrome */}
        <div className="h-10 bg-[#1a1a1a] border-b border-white/[0.08] flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-[#252525] text-xs text-zinc-500 flex items-center gap-2">
              <Shield size={12} />
              dashboard.vayva.co
            </div>
          </div>
        </div>

        {/* App Content */}
        <div className="flex h-[500px]">
          {/* Sidebar */}
          <div className="w-60 bg-[#0a0a0a] border-r border-white/[0.06] p-4 flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6 px-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <span className="text-white font-semibold">Vayva</span>
            </div>

            {/* Nav Groups */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-2 mb-2">General</p>
                <nav className="space-y-0.5">
                  {["Dashboard", "Orders", "Products", "Customers"].map((item, i) => (
                    <div
                      key={item}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                        i === 0
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded", i === 0 ? "bg-emerald-500/20" : "bg-zinc-700/50")} />
                      {item}
                    </div>
                  ))}
                </nav>
              </div>

              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-2 mb-2">Finance</p>
                <nav className="space-y-0.5">
                  {["Payments", "Invoices"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="w-4 h-4 rounded bg-zinc-700/50" />
                      {item}
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-auto pt-4 border-t border-white/[0.06]">
              <div className="px-2 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[10px] text-emerald-400 mb-1">Today's Revenue</p>
                <p className="text-lg font-bold text-emerald-400">₦47,500</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-[#0f0f0f] flex flex-col">
            {/* Header */}
            <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <h1 className="text-white font-semibold">Amina's Boutique</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <BellIcon />
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
                  AA
                </div>
              </div>
            </header>

            {/* Dashboard Content */}
            <div className="flex-1 p-6 overflow-hidden">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Revenue", value: "₦847,500", change: "+12.5%" },
                  { label: "Orders", value: "156", change: "+8.2%" },
                  { label: "Customers", value: "89", change: "+15.3%" },
                  { label: "Products", value: "47", change: "+3" },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <span className="text-xs text-emerald-400">{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="flex gap-4 h-[280px]">
                <div className="flex-1 rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">Revenue Overview</h3>
                    <div className="text-xs text-zinc-500 px-2 py-1 rounded bg-white/[0.03]">This Week</div>
                  </div>
                  {/* Chart Bars */}
                  <div className="flex items-end justify-between gap-2 h-[200px] px-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                      const heights = [45, 70, 50, 85, 60, 40, 30];
                      return (
                        <div key={day} className="flex flex-col items-center gap-2 flex-1">
                          <div
                            className="w-full max-w-[50px] bg-emerald-500/30 rounded-t-lg relative"
                            style={{ height: `${heights[i]}%` }}
                          >
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg"
                              style={{ height: "60%" }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="w-72 rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                  <h3 className="text-sm font-medium text-white mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {[
                      { id: "#VA-2301", customer: "Chioma A.", amount: "₦45,000" },
                      { id: "#VA-2300", customer: "Emeka O.", amount: "₦28,000" },
                      { id: "#VA-2299", customer: "Ngozi M.", amount: "₦67,500" },
                    ].map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">
                            {order.customer.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-xs text-white font-medium">{order.id}</p>
                            <p className="text-[10px] text-zinc-500">{order.customer}</p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-400 font-medium">{order.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Bell icon component
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function HeroSection(): React.JSX.Element {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
            >
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">New: AI Agent for WhatsApp Orders</span>
              <ArrowRight size={14} className="text-emerald-400" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
            >
              The commerce platform
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                for African businesses
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
            >
              Turn WhatsApp conversations into organized business records. 
              Track orders, manage inventory, and grow your revenue — all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href={`${APP_URL}/signup`}>
                <Button
                  size="lg"
                  className="rounded-xl h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  Get Started Free
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href={`${APP_URL}/signin`}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-xl h-12 px-8 text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Dashboard Mockup */}
            <DashboardMockup />
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
              >
                Everything you need to scale
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400 max-w-xl mx-auto"
              >
                Purpose-built for Nigerian merchants. From order tracking to inventory management.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeatureCard
                icon={MessageCircle}
                title="WhatsApp Integration"
                description="Capture orders automatically from WhatsApp messages. No more manual data entry."
                delay={0}
              />
              <FeatureCard
                icon={Package}
                title="Inventory Management"
                description="Track stock levels, get low-stock alerts, and manage products effortlessly."
                delay={0.1}
              />
              <FeatureCard
                icon={Zap}
                title="AI Order Capture"
                description="Our AI reads customer messages and creates orders automatically."
                delay={0.2}
              />
              <FeatureCard
                icon={BarChart3}
                title="Real-time Analytics"
                description="Track revenue, best-selling products, and customer insights in real-time."
                delay={0.3}
              />
              <FeatureCard
                icon={CreditCard}
                title="Secure Payments"
                description="Accept payments via Paystack, bank transfer, and cash on delivery."
                delay={0.4}
              />
              <FeatureCard
                icon={Shield}
                title="Bank-grade Security"
                description="Your data is encrypted and protected. We're SOC 2 compliant."
                delay={0.5}
              />
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
              >
                Loved by merchants
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400"
              >
                Join 500+ Nigerian businesses using Vayva
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TestimonialCard
                quote="Vayva transformed how I handle orders. What used to take 3 hours now takes 30 minutes."
                author="Amina Yusuf"
                role="Owner, Amina's Boutique"
                delay={0}
              />
              <TestimonialCard
                quote="The WhatsApp integration is magic. My customers message me, and orders appear in the dashboard instantly."
                author="Chidi Okonkwo"
                role="Founder, FreshMart"
                delay={0.1}
              />
              <TestimonialCard
                quote="I can finally track my inventory properly. No more running out of stock unexpectedly."
                author="Ngozi Eze"
                role="CEO, Glow Beauty"
                delay={0.2}
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
          <div className="max-w-[1600px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-12 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to get organized?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Start your 7-day free trial today. No credit card required. Cancel anytime.
              </p>
              <Link href={`${APP_URL}/signup`}>
                <Button
                  size="lg"
                  className="rounded-xl h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25"
                >
                  Start Free Trial
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <span className="text-white font-bold">V</span>
                  </div>
                  <span className="text-white font-semibold text-lg">Vayva</span>
                </div>
                <p className="text-sm text-zinc-500 max-w-xs">
                  The operating system for commerce on WhatsApp. Built for African businesses.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
                  <li><Link href="/industries" className="hover:text-emerald-400 transition-colors">Industries</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
                  <li><Link href="/help" className="hover:text-emerald-400 transition-colors">Help Center</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link></li>
                  <li><Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-zinc-600">© 2026 Vayva Tech. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link href="https://twitter.com/vayva_ng" className="text-zinc-500 hover:text-emerald-400 transition-colors">
                  Twitter
                </Link>
                <Link href="https://linkedin.com/company/vayva" className="text-zinc-500 hover:text-emerald-400 transition-colors">
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
