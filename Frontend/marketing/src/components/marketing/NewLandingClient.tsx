"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { APP_URL } from "@/lib/constants";
import { Button } from "@vayva/ui";
import { AutopilotDemo } from "./AutopilotDemo";
import { StatsWall } from "./StatsWall";

// Animated code typing component
function CodeTypingAnimation(): React.JSX.Element {
  const [code, setCode] = useState("");
  const fullCode = `// The Commerce OS for African Business
import { Vayva } from '@vayva/sdk';

const business = await Vayva.connect({
  channels: ["whatsapp", "instagram", "web"],
  payments: ["card", "transfer", "ussd"],
  ai: true // Autopilot included
});

// AI analyzes your business 24/7
business.autopilot.on('insight', (rec) => {
  console.log(rec.action); // Auto-implement recommendations
});`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullCode.length) {
        setCode(fullCode.slice(0, index));
        index++;
      } else {
        setTimeout(() => {
          index = 0;
          setCode("");
        }, 4000);
      }
    }, 35);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="ml-4 text-xs text-slate-500 font-mono">vayva.config.ts</span>
        </div>
        <div className="p-5 font-mono text-sm leading-relaxed">
          <pre className="text-slate-300">
            <code>
              {code.split("").map((char, i) => {
                if (char === " ") return <span key={i}>&nbsp;</span>;
                if (char === "\n") return <br key={i} />;
                if ("/{}()[]=':\",.<>;".includes(char)) {
                  return <span key={i} className="text-slate-500">{char}</span>;
                }
                if (["import", "from", "const", "async", "await", "true", "false"].some(kw => 
                  code.slice(Math.max(0, i-10), i+5).includes(kw) && 
                  code.slice(i, i+kw.length) === kw
                )) {
                  return <span key={i} className="text-purple-400">{char}</span>;
                }
                if (char === '"' || code.slice(i).startsWith('"')) {
                  const strEnd = code.indexOf('"', i + 1);
                  if (strEnd > i && i <= strEnd) {
                    return <span key={i} className="text-emerald-400">{char}</span>;
                  }
                }
                if (char === "'" || code.slice(i).startsWith("'")) {
                  const strEnd = code.indexOf("'", i + 1);
                  if (strEnd > i && i <= strEnd) {
                    return <span key={i} className="text-emerald-400">{char}</span>;
                  }
                }
                if (char === "₦" || !isNaN(parseInt(char))) {
                  return <span key={i} className="text-amber-400">{char}</span>;
                }
                return <span key={i}>{char}</span>;
              })}
              <span className="inline-block w-2 h-5 bg-emerald-500/50 animate-pulse ml-0.5" />
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

// Live dashboard preview
function DashboardPreview(): React.JSX.Element {
  const [revenue, setRevenue] = useState(2147000);
  const [orders, setOrders] = useState(156);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(r => r + Math.floor(Math.random() * 25000));
      setOrders(o => o + Math.floor(Math.random() * 2));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const formatNaira = (n: number) => "₦" + (n / 1000000).toFixed(1) + "M";

  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 rounded-[48px] blur-3xl" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-2xl overflow-hidden"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200/60 bg-white/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto flex items-center gap-2 bg-slate-100/80 px-4 py-1.5 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500 font-medium">merchant.vayva.ng</span>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Dashboard</h3>
              <p className="text-xs text-slate-500">Live metrics</p>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-700">{["AB", "CK", "MN"][i-1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Revenue", value: formatNaira(revenue), change: "+18%", color: "emerald" },
              { label: "Orders", value: orders.toString(), change: "+12", color: "blue" },
              { label: "Autopilot", value: "ON", change: "35 rules", color: "violet" },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className={`text-[10px] font-medium text-${stat.color}-600 mt-0.5`}>{stat.change}</p>
              </div>
            ))}
          </div>

          {/* AI insight card */}
          <div className="bg-gradient-to-r from-violet-50 to-emerald-50 rounded-xl p-4 border border-violet-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-violet-700">Autopilot Insight</span>
            </div>
            <p className="text-sm text-slate-700">Leather bags trending. Recommend 15% price increase.</p>
          </div>

          {/* Mini chart */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700">Revenue Trend</span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {[35, 52, 41, 68, 55, 82, 74, 90, 85, 95].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Floating feature cards
function FloatingCards(): React.JSX.Element {
  const cards = [
    { label: "AI Order Capture", value: "Active", color: "violet", delay: 0 },
    { label: "WhatsApp", value: "Connected", color: "emerald", delay: 0.2 },
    { label: "Paystack", value: "Live", color: "blue", delay: 0.4 },
  ];

  return (
    <>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, x: i === 0 ? -50 : i === 1 ? 50 : 0, y: i === 2 ? 50 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.8 + card.delay, duration: 0.6 }}
          className={`absolute ${i === 0 ? "-left-8 top-1/4" : i === 1 ? "-right-4 top-1/3" : "right-8 -bottom-4"}`}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-slate-200/60">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-${card.color}-500 animate-pulse`} />
              <span className="text-xs font-semibold text-slate-700">{card.label}</span>
            </div>
            <p className={`text-sm font-bold text-${card.color}-600 mt-1`}>{card.value}</p>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export function NewLandingClient(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Parallax background gradient */}
      <motion.div 
        style={{ y: backgroundY }}
        className="fixed inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-blue-50/40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto w-full py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100/50 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-violet-800">Autopilot AI now available</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                The Commerce OS for{" "}
                <span className="relative">
                  <span className="relative z-10 text-emerald-600">African</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 4 150 4 198 8" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                Business
              </h1>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                One platform for orders, payments, inventory, team management, and AI-powered growth. 
                Built for 19+ industries. From side hustle to scalable empire.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href={`${APP_URL}/signup`}>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 transition-all">
                    Start free trial
                  </Button>
                </Link>
                <Link href="/autopilot">
                  <Button variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl border-slate-300 hover:bg-slate-50">
                    See Autopilot AI
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  7-day free trial
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  5-min setup
                </span>
              </div>
            </motion.div>

            {/* Right: Code + Dashboard */}
            <div className="relative lg:h-[600px]">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="relative z-10"
              >
                <CodeTypingAnimation />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -bottom-8 -right-4 lg:right-0 w-[280px] lg:w-[320px] z-20"
              >
                <DashboardPreview />
                <FloatingCards />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Wall */}
      <StatsWall />

      {/* Autopilot AI Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-lg"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 rounded-full mb-6">
                <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Autopilot AI</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Your AI business advisor that never sleeps
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Autopilot analyzes your inventory, pricing, customers, and operations 24/7. 
                It spots opportunities, flags risks, and recommends actions—automatically.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: "📦", title: "Inventory Intelligence", desc: "Dead stock alerts, reorder points, velocity analysis" },
                  { icon: "💰", title: "Pricing Optimization", desc: "Market-based pricing suggestions, margin analysis" },
                  { icon: "🎯", title: "Marketing Automation", desc: "Campaign suggestions, abandoned cart recovery" },
                  { icon: "👥", title: "Customer Engagement", desc: "VIP detection, re-engagement, review requests" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/autopilot">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-5 text-base font-semibold rounded-xl">
                  Explore Autopilot AI →
                </Button>
              </Link>
            </motion.div>

            {/* Right: Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <AutopilotDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              One platform. Every need.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From order capture to delivery tracking. From team management to AI insights. 
              Everything your business needs to grow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Sell Everywhere", 
                desc: "WhatsApp, Instagram, Web, POS, B2B portal—all synced",
                icon: "🛒",
                color: "emerald"
              },
              { 
                title: "Run Your Business", 
                desc: "Inventory, team, bookings, KDS, events, courses",
                icon: "⚙️",
                color: "blue"
              },
              { 
                title: "Get Paid Properly", 
                desc: "Virtual accounts, cards, transfers, USSD, payouts",
                icon: "💳",
                color: "amber"
              },
              { 
                title: "Grow with AI", 
                desc: "35+ intelligent rules analyzing your business 24/7",
                icon: "✨",
                color: "violet"
              },
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/30 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-${pillar.color}-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {pillar.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
                <Link 
                  href={`${APP_URL}/signup`} 
                  className={`inline-flex items-center gap-1 mt-4 text-sm font-semibold text-${pillar.color}-600 hover:gap-2 transition-all`}
                >
                  Start free trial →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 px-4 border-y border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-center text-sm text-slate-500 mb-8">Trusted by businesses across Nigeria</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            {["Paystack", "YouVerify", "Kwik", "123Design"].map((partner) => (
              <span key={partner} className="text-lg font-bold text-slate-400">{partner}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
