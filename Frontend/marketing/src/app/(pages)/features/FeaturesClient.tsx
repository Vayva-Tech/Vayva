"use client";

import React from "react";
import Link from "next/link";
import {
  IconCreditCard as CreditCard,
  IconPackage as Package,
  IconTruck as Truck,
  IconDeviceMobile as Smartphone,
  IconBolt as Zap,
  IconShieldCheck as ShieldCheck,
  IconWifi as Wifi,
  IconRobot as Bot,
  IconWorld as Globe,
  IconEye as Eye,
  IconUpload as Upload,
  IconBell as Bell,
  IconSearch as Search,
  IconClock as Clock,
  IconCircleCheck as CheckCircle,
  IconBrain as Brain,
  IconMessageCircle as MessageSquare,
  IconStar as Star,
} from "@tabler/icons-react";
import { PremiumButton } from "@/components/marketing/PremiumButton";
import { APP_URL } from "@/lib/constants";
import * as motion from "framer-motion/client";

/* ─── Mini UI Preview Components ─── */

function OrderCapturePreview(): React.JSX.Element {
  return (
    <div className="bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl p-5 shadow-card space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
          Live Capture
        </span>
      </div>
      <div className="bg-emerald-50 rounded-xl rounded-tl-sm px-3 py-2.5 border border-emerald-100">
        <p className="text-xs text-foreground">
          &quot;Hi, I want 3 of the black bags and 2 ankara dresses&quot;
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          via WhatsApp • 2 min ago
        </p>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-xl border border-violet-100">
        <Bot className="w-4 h-4 text-violet-600" />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-violet-600">
            AI Processing...
          </p>
          <p className="text-[10px] text-violet-600">
            Identified 2 products, creating order
          </p>
        </div>
        <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
      </div>
      <div className="bg-muted/30 border border-border/40 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">
            Order #VYA-4721
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
            Created
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Black Bag × 3</span>
            <span className="font-bold text-foreground">₦27,000</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Ankara Dress × 2</span>
            <span className="font-bold text-foreground">₦18,500</span>
          </div>
          <div className="border-t border-border/40 pt-1.5 flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-black text-primary">₦45,500</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AICommercePreview(): React.JSX.Element {
  return (
    <div className="bg-white/[0.22] backdrop-blur-2xl border border-white/[0.40] rounded-2xl p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-bold text-gray-600">
            AI Performance
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-bold border border-violet-100">
          Active
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Conversations",
            value: "892",
            change: "+24%",
            color: "text-violet-600 bg-violet-50",
            icon: MessageSquare,
          },
          {
            label: "Auto-Orders",
            value: "234",
            change: "+31%",
            color: "text-emerald-600 bg-emerald-50",
            icon: Zap,
          },
          {
            label: "Avg Response",
            value: "1.2s",
            change: "-0.3s",
            color: "text-blue-600 bg-blue-50",
            icon: Clock,
          },
          {
            label: "Satisfaction",
            value: "94%",
            change: "+2%",
            color: "text-amber-600 bg-amber-50",
            icon: Star,
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-white/30 bg-white/[0.15] p-3"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center ${m.color}`}
              >
                <m.icon className="w-3 h-3" />
              </div>
              <p className="text-[9px] font-bold text-gray-400 uppercase">
                {m.label}
              </p>
            </div>
            <p className="text-lg font-black text-gray-600 leading-none">
              {m.value}
            </p>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
              {m.change}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1 h-[40px] px-1">
        {[28, 45, 38, 62, 55, 71, 68, 52, 78, 65, 82, 74].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-violet-500/50 rounded-t-sm"
            style={{ height: `${(h / 82) * 36}px` }}
          />
        ))}
      </div>
      <p className="text-[10px] text-gray-400 text-center">
        AI-captured orders this month
      </p>
    </div>
  );
}

function PaymentsPreview(): React.JSX.Element {
  return (
    <div className="bg-white/[0.22] backdrop-blur-2xl border border-white/[0.40] rounded-2xl p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-600">Recent Payments</span>
        <span className="text-[10px] text-gray-400">Today</span>
      </div>
      {[
        {
          name: "Amina Bello",
          amount: "₦45,500",
          method: "Bank Transfer",
          status: "Confirmed",
          statusColor:
            "text-emerald-600 bg-emerald-50 border border-emerald-100",
          time: "2m ago",
        },
        {
          name: "Chidi Okafor",
          amount: "₦28,000",
          method: "Card Payment",
          status: "Confirmed",
          statusColor:
            "text-emerald-600 bg-emerald-50 border border-emerald-100",
          time: "15m ago",
        },
        {
          name: "Fatima Yusuf",
          amount: "₦12,800",
          method: "USSD",
          status: "Pending",
          statusColor: "text-amber-600 bg-amber-50 border-amber-100",
          time: "22m ago",
        },
      ].map((p, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2.5 rounded-xl border border-white/30 bg-white/[0.15]"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">{p.name}</span>
              <span className="text-xs font-black text-gray-600">
                {p.amount}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] text-gray-400">
                {p.method} • {p.time}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${p.statusColor}`}
              >
                {p.status}
              </span>
            </div>
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="rounded-xl border border-white/30 bg-white/[0.15] p-3 text-center">
          <p className="text-[9px] font-bold text-gray-400 uppercase">
            Available
          </p>
          <p className="text-lg font-black text-gray-600">₦1.8M</p>
        </div>
        <div className="rounded-xl border border-white/30 bg-white/[0.15] p-3 text-center">
          <p className="text-lg font-black text-amber-600">₦245k</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase">
            Pending
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview(): React.JSX.Element {
  return (
    <div className="bg-white/[0.22] backdrop-blur-2xl border border-white/[0.40] rounded-2xl p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600">
            Store Dashboard
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100">
            Live
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center">
            <Search className="w-2.5 h-2.5 text-gray-400" />
          </div>
          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center relative">
            <Bell className="w-2.5 h-2.5 text-gray-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Revenue", value: "₦2.4M", change: "+23%", positive: true },
          { label: "Orders", value: "347", change: "+12%", positive: true },
          { label: "Customers", value: "1,204", change: "+8%", positive: true },
          {
            label: "Conversion",
            value: "4.2%",
            change: "-2%",
            positive: false,
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-lg border border-white/30 bg-white/[0.15] p-2"
          >
            <p className="text-[8px] font-bold text-gray-400 uppercase">
              {k.label}
            </p>
            <p className="text-sm font-black text-gray-600 leading-none mt-0.5">
              {k.value}
            </p>
            <p
              className={`text-[8px] font-bold mt-0.5 ${k.positive ? "text-emerald-600" : "text-rose-500"}`}
            >
              {k.change}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/30 bg-white/[0.15] p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-600">
            Revenue Performance
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[8px] text-gray-400">Income</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-[8px] text-gray-400">Expense</span>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-0.5 h-[50px]">
          {[35, 52, 41, 68, 55, 82, 74, 90, 65, 78, 88, 95].map((h, i) => (
            <div key={i} className="flex-1 flex gap-px items-end">
              <div
                className="flex-1 bg-primary/60 rounded-t-sm"
                style={{ height: `${(h / 95) * 44}px` }}
              />
              <div
                className="flex-1 bg-orange-400/40 rounded-t-sm"
                style={{ height: `${(h / 95) * 44 * 0.35}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InventoryPreview(): React.JSX.Element {
  return (
    <div className="bg-white/[0.22] backdrop-blur-2xl border border-white/[0.40] rounded-2xl p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-600">
          Inventory Overview
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Synced
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/30 bg-white/[0.15] p-2.5 text-center">
          <p className="text-lg font-black text-gray-600">156</p>
          <p className="text-[9px] text-gray-400">Products</p>
        </div>
        <div className="rounded-xl border border-white/30 bg-white/[0.15] p-2.5 text-center">
          <p className="text-lg font-black text-amber-600">5</p>
          <p className="text-[9px] text-gray-400">Low Stock</p>
        </div>
        <div className="rounded-xl border border-white/30 bg-white/[0.15] p-2.5 text-center">
          <p className="text-lg font-black text-rose-400">1</p>
          <p className="text-[9px] text-gray-400">Out</p>
        </div>
      </div>
      {[
        { name: "Ankara Dress (Red)", stock: 2, status: "low" },
        { name: "Leather Bag (Brown)", stock: 0, status: "out" },
        { name: "Body Butter (Shea)", stock: 5, status: "low" },
        { name: "Sneakers (Black, 43)", stock: 12, status: "ok" },
      ].map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-2.5 rounded-xl border border-white/30 bg-white/[0.15]"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/[0.25] flex items-center justify-center backdrop-blur-xl border border-white/30">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {item.name}
            </span>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${item.status === "out"
                ? "text-rose-600 bg-rose-50 border-rose-100"
                : (item as { status: string }).status === "low"
                  ? "text-amber-600 bg-amber-50 border-amber-100"
                  : "text-emerald-600 bg-emerald-50 border border-emerald-100"
            }`}
          >
            {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
          </span>
        </div>
      ))}
    </div>
  );
}

function DeliveryPreview(): React.JSX.Element {
  return (
    <div className="bg-white/[0.22] backdrop-blur-2xl border border-white/[0.40] rounded-2xl p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-600">
          Delivery Tracking
        </span>
        <span className="text-[10px] text-gray-400">3 active</span>
      </div>
      {[
        {
          id: "#4718",
          customer: "Tunde Adeyemi",
          location: "Lekki, Lagos",
          status: "In Transit",
          statusColor: "text-blue-600 bg-blue-50 border-blue-100",
          progress: 65,
        },
        {
          id: "#4716",
          customer: "Grace Eze",
          location: "Ikeja, Lagos",
          status: "Dispatched",
          statusColor: "text-amber-600 bg-amber-50 border-amber-100",
          progress: 30,
        },
        {
          id: "#4715",
          customer: "Emeka Nwosu",
          location: "Wuse, Abuja",
          status: "Delivered",
          statusColor:
            "text-emerald-600 bg-emerald-50 border border-emerald-100",
          progress: 100,
        },
      ].map((d, i) => (
        <div
          key={i}
          className="p-3 rounded-xl border border-white/30 bg-white/[0.15]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-foreground">
                Order {d.id}
              </span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${d.statusColor}`}
            >
              {d.status}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">
            {d.customer} • {d.location}
          </p>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${d.progress === 100 ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${d.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StorefrontPreview(): React.JSX.Element {
  return (
    <div className="bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl p-5 shadow-card space-y-3">
      <div className="rounded-xl border border-border/40 bg-muted/30 overflow-hidden">
        <div className="h-6 bg-muted/30 border-b border-border/40 flex items-center px-2 gap-1.5">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full border border-border/40">
            <Globe className="w-2 h-2 text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">
              amina.vayva?.ng
            </span>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="h-16 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              Amina&apos;s Boutique
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {["Ankara Dress", "Leather Bag", "Body Butter"].map((p) => (
              <div key={p} className="rounded-lg border border-border/40 p-1.5">
                <div className="h-10 bg-muted/30 rounded-md mb-1" />
                <p className="text-[8px] font-medium text-foreground truncate">
                  {p}
                </p>
                <p className="text-[8px] font-bold text-primary">₦9,250</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/40 text-xs font-bold text-muted-foreground bg-background flex-1 justify-center">
          <Eye className="w-3.5 h-3.5" />
          Preview
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold flex-1 justify-center">
          <Upload className="w-3.5 h-3.5" />
          Publish
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Section Layout ─── */
function FeatureSection({
  badge: _badge,
  title,
  description,
  bullets,
  preview,
  reversed = false,
  index: _index = 0,
}: {
  badge: string;
  title: React.ReactNode;
  description: string;
  bullets: string[];
  preview: React.ReactNode;
  reversed?: boolean;
  index?: number;
}): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`grid lg:grid-cols-2 gap-10 xl:gap-16 items-center ${reversed ? "lg:direction-rtl" : ""}`}
    >
      <div
        className={`space-y-6 ${reversed ? "lg:order-2 lg:direction-ltr" : ""}`}
      >
        <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-[1.1]">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {description}
        </p>
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${reversed ? "lg:order-1 lg:direction-ltr" : ""}`}>
        <div className="relative">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[30px] border-2 border-emerald-200/60" />
          <div className="relative rounded-[28px] border-2 border-slate-900/10 bg-white/70 backdrop-blur p-5 shadow-[0_24px_55px_rgba(15,23,42,0.12)]">
            {preview}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesClient(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="pt-8 md:pt-16 pb-12 md:pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight leading-[1.08]">
              Your Business,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Simplified.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Imagine managing orders, payments, campaigns, and deliveries from one 
              beautiful dashboard—while AI handles the repetitive work. That&apos;s the 
              Vayva experience. Less stress. More sales. Smoother days.
            </p>
            <Link href={`${APP_URL}/signup`}>
              <PremiumButton className="px-8 py-4 text-base shadow-card">
                Start Free — No Credit Card
              </PremiumButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Sections */}
      <div className="max-w-[1200px] mx-auto px-4 space-y-20 md:space-y-32">
        <FeatureSection
          badge="Order Capture"
          title={
            <>
              AI Turns Conversations into{" "}
              <span className="text-primary">Orders—Automatically.</span>
            </>
          }
          description="While you sleep, while you spend time with family, while you focus on what matters—Vayva AI reads WhatsApp and Instagram messages, identifies what customers want, and creates orders instantly. No more late-night replies. No more missed sales."
          bullets={[
            "AI reads and understands customer messages automatically",
            "Creates complete orders with products, quantities, and prices",
            "Works across WhatsApp, Instagram DMs, and your storefront",
            "Sends payment links instantly—sales happen while you rest",
          ]}
          preview={<OrderCapturePreview />}
        />

        <FeatureSection
          badge="AI Commerce"
          title={
            <>
              Your 24/7 AI Assistant That{" "}
              <span className="text-primary">Never Takes a Break.</span>
            </>
          }
          description="Customers shop at all hours. Vayva AI responds instantly—day or night—keeping conversations warm, answering questions, and converting chats into sales. You wake up to new orders, not unread messages."
          bullets={[
            "Responds to customers in under 2 seconds, 24/7",
            "Learns your products and speaks with your brand voice",
            "Converts casual chats into completed purchases",
            "Escalates complex issues to you only when needed",
          ]}
          preview={<AICommercePreview />}
          reversed
        />

        <FeatureSection
          badge="Payments"
          title={
            <>
              Accept <span className="text-primary">payments from anywhere</span> in the world.
            </>
          }
          description="Your store isn't limited to Nigeria. Accept payments from customers in the US, UK, Europe, and beyond via international Visa, Mastercard, Amex, and Apple Pay—plus all local Nigerian payment methods. Go global while staying local."
          bullets={[
            "International cards: Visa, Mastercard, Amex, Apple Pay (60+ countries)",
            "Local payments: Paystack-powered cards, transfers, and USSD",
            "Funds settle in Naira—simple and familiar for your accounting",
            "Real-time confirmations and instant payout to your bank account",
          ]}
          preview={<PaymentsPreview />}
        />

        <FeatureSection
          badge="Dashboard & Analytics"
          title={
            <>
              One Dashboard.{" "}
              <span className="text-primary">Complete Control.</span>
            </>
          }
          description="Stop jumping between apps. See revenue, orders, inventory, and customer insights—all in one beautifully simple dashboard. Make smarter decisions with real-time data that actually makes sense."
          bullets={[
            "See all your KPIs at a glance: revenue, orders, customers",
            "Track sales trends and identify your best products",
            "Monitor team performance and order fulfillment",
            "Make decisions with data that updates in real-time",
          ]}
          preview={<DashboardPreview />}
          reversed
        />

        <FeatureSection
          badge="Inventory Control"
          title={
            <>
              Never run out of stock.{" "}
              <span className="text-primary">Never oversell.</span>
            </>
          }
          description="Real-time inventory tracking with automatic low-stock alerts. Know exactly what you have, what's selling, and what needs restocking."
          bullets={[
            "Real-time stock levels synced across all channels",
            "Automatic low-stock and out-of-stock alerts",
            "Product performance tracking and best-seller insights",
            "Bulk import and export for easy management",
          ]}
          preview={<InventoryPreview />}
        />

        <FeatureSection
          badge="Delivery & Fulfillment"
          title={
            <>
              Fulfillment Made{" "}
              <span className="text-primary">Quick and Easy.</span>
            </>
          }
          description="From dispatch to doorstep, track every order effortlessly. Automatic delivery updates keep customers happy while you focus on selling more. No more manual coordination. No more 'where is my order?' messages."
          bullets={[
            "Real-time delivery tracking with automatic status updates",
            "Customers get notified at every step—no manual work",
            "Integration with top delivery providers across Nigeria",
            "Proof of delivery and instant confirmation receipts",
          ]}
          preview={<DeliveryPreview />}
          reversed
        />

        <FeatureSection
          badge="Marketing Campaigns"
          title={
            <>
              Campaigns That{" "}
              <span className="text-primary">Drive Results.</span>
            </>
          }
          description="Launch targeted campaigns in minutes, not hours. Send personalized WhatsApp and SMS messages to your customers. Track opens, clicks, and conversions—all from your Vayva dashboard."
          bullets={[
            "Launch WhatsApp and SMS campaigns in minutes",
            "Target customers based on purchase history",
            "Track campaign performance and ROI in real-time",
            "Automated follow-ups that convert browsers into buyers",
          ]}
          preview={<StorefrontPreview />}
        />
      </div>

      {/* Infrastructure Section */}
      <section className="py-16 md:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-[1600px] mx-auto px-6"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
              Built for Life in Nigeria.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We understand the daily hustle. That&apos;s why Vayva works beautifully 
              even with 2G networks, handles every payment method Nigerians use, 
              and protects both you and your customers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Works on Any Network",
                desc: "2G, 3G, that frustrating network in your area—Vayva keeps working. We built it for real Nigerian conditions.",
                Icon: Wifi,
                color: "text-sky-600",
                bg: "bg-sky-500/10",
              },
              {
                title: "All Payment Methods",
                desc: "Cards, bank transfers, USSD, mobile money. Your customers pay how they want. You get your money same day.",
                Icon: Smartphone,
                color: "text-emerald-600",
                bg: "bg-emerald-500/10",
              },
              {
                title: "Protected Transactions",
                desc: "Buyer protection builds trust. Our secure system ensures both you and your customers are covered.",
                Icon: ShieldCheck,
                color: "text-emerald-600",
                bg: "bg-emerald-500/10",
              },
              {
                title: "Scale Without Stress",
                desc: "Handle 100 customers as easily as 10. Vayva automates the repetitive work so you can grow peacefully.",
                Icon: Zap,
                color: "text-warning",
                bg: "bg-warning/10",
              },
            ].map((item) => (
              <div key={item.title} className="relative">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[26px] border-2 border-emerald-200/60" />
                <div className="relative surface-glass rounded-2xl p-8 border-2 border-slate-900/10 hover:bg-background/90 hover:shadow-[0_22px_50px_rgba(15,23,42,0.12)] transition-all group">
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <item.Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-3 text-lg tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-[1600px] mx-auto px-6 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[44px] border-2 border-emerald-200/60" />
            <div className="relative surface-glass rounded-[40px] border-2 border-slate-900/10 p-10 md:p-16 shadow-[0_28px_65px_rgba(15,23,42,0.12)]">
              <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-[1.1] tracking-tight">
                Ready for Smoother Days?
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                Join thousands of Nigerian entrepreneurs who&apos;ve reclaimed their time
                and grown their sales with Vayva. One dashboard. Zero stress.
                Start your free journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${APP_URL}/signup`}>
                  <PremiumButton className="px-12 py-6 text-lg rounded-2xl shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(34,197,94,0.4)] transition-all">
                    Start Free — No Credit Card
                  </PremiumButton>
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                5-minute setup. No stress. Reclaim your time.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
