"use client";

import React from "react";
import * as motion from "framer-motion/client";
import {
  IconCircleCheck as CheckCircle2,
  IconCreditCard as CreditCard,
  IconLayoutDashboard as LayoutDashboard,
  IconPackage as Package,
  IconTruck as Truck,
  IconTrendingUp as TrendingUp,
  IconStar as Star,
  IconMessageCircle as MessageSquare,
  IconBrandWhatsapp as WhatsappLogo,
  IconWorld as Globe,
} from "@tabler/icons-react";
import { PremiumButton } from "@/components/marketing/PremiumButton";
import { APP_URL } from "@/lib/constants";
import { Button } from "@vayva/ui";

interface LandingHeroProps {
  headline: React.ReactNode;
  sub: string;
  showGlobalBadge?: boolean;
}

export function LandingHero({
  headline,
  sub,
  showGlobalBadge,
}: LandingHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden pt-4 pb-8 md:pt-8 md:pb-12 px-4">
      <div className="relative max-w-[1760px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-center min-h-[70vh]">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-black text-foreground mb-6 leading-[1.08] tracking-tight">
              {headline}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
              {sub}
            </p>

            {/* Compact Dashboard Mock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 w-full max-w-xl"
            >
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                    <span className="text-white font-semibold text-sm">Amina&apos;s Boutique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/90 text-xs">Live</span>
                  </div>
                </div>
                
                {/* Metrics Grid */}
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Revenue</p>
                    <p className="text-lg font-bold text-slate-900">₦847k</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-600">+23%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Orders</p>
                    <p className="text-lg font-bold text-slate-900">47</p>
                    <span className="text-[10px] text-slate-400">Active</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Inventory</p>
                    <p className="text-lg font-bold text-slate-900">156</p>
                    <span className="text-[10px] text-amber-500">3 low stock</span>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="px-4 pb-4">
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Recent</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <WhatsappLogo className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-900">WhatsApp Order</p>
                          <p className="text-[10px] text-slate-500">Ankara Dress × 2</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-900">₦18,500</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-900">Payment</p>
                          <p className="text-[10px] text-slate-500">Via Paystack</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">Confirmed</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <LayoutDashboard className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-500">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-500">Products</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-500">AI</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">vayva.ng/amina</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <a href={`${APP_URL}/signup`}>
                <PremiumButton
                  data-testid="landing-get-started"
                  className="px-8 py-4 shadow-card text-base"
                >
                  Start Free — No Card Needed
                </PremiumButton>
              </a>

              <a
                href="https://wa.me/2349160000000?text=Hi%20Vayva%2C%20I%20want%20to%20learn%20more%20about%20selling%20on%20WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="px-6 py-4 border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                >
                  <WhatsappLogo className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>

              {/* Avatars + Rating */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-emerald-400/30 border-2 border-background flex items-center justify-center"
                    >
                      <span className="text-[10px] font-bold text-primary">
                        {["AO", "FK", "NI"][i - 1]}
                      </span>
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">
                      +
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="text-sm font-bold text-foreground ml-1">
                      4.8
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    From 5k+ reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                5-minute setup
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Network-friendly
              </span>
              {showGlobalBadge && (
                <span className="flex items-center gap-2 text-primary font-medium">
                  <Globe className="w-4 h-4" />
                  Global payments enabled
                </span>
              )}
            </div>
          </motion.div>

          {/* Right: Dashboard Mockup */}
          <div className="relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-br from-emerald-500/20 via-primary/15 to-emerald-400/20 rounded-[60px] blur-3xl opacity-60 group-hover:opacity-80 transition duration-1000" />
              
              {/* Dashboard mock */}
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">V</span>
                    </div>
                    <div>
                      <span className="text-white font-semibold text-sm">Amina&apos;s Boutique</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white/80 text-[10px]">Store Live • vayva.ng/amina</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AB</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-slate-500">Revenue</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">₦847k</p>
                      <span className="text-xs text-emerald-600">+23% today</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-slate-500">Orders</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">47</p>
                      <span className="text-xs text-slate-500">12 pending</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <LayoutDashboard className="w-4 h-4 text-violet-500" />
                        <span className="text-xs text-slate-500">Inventory</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">156</p>
                      <span className="text-xs text-amber-500">3 low stock</span>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-900">Recent Orders</span>
                      <span className="text-[10px] text-slate-500">View all</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <WhatsappLogo className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">WhatsApp Order</p>
                            <p className="text-xs text-slate-500">Ankara Dress × 2 • 2 min ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">₦18,500</p>
                          <span className="text-[10px] text-amber-600">Pending</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Payment Confirmed</p>
                            <p className="text-xs text-slate-500">Via Paystack • Bank Transfer</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-600">₦45,000</p>
                          <span className="text-[10px] text-emerald-600">Paid</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Card */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-sm font-semibold">AI Assistant</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-emerald-400">892</p>
                        <p className="text-[10px] text-slate-400">Conversations</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-400">234</p>
                        <p className="text-[10px] text-slate-400">Auto-Orders</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-400">1.2s</p>
                        <p className="text-[10px] text-slate-400">Response</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-400">94%</p>
                        <p className="text-[10px] text-slate-400">Satisfaction</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-slate-700">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500">Products</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500">Orders</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">₦1.8M Available</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile: Simplified visual */}
          <div className="lg:hidden mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Dashboard
                  </span>
                </div>
                <p className="text-lg font-black text-foreground">₦847k</p>
                <p className="text-[10px] text-muted-foreground">
                  Today&apos;s revenue
                </p>
              </div>
              <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Orders
                  </span>
                </div>
                <p className="text-lg font-black text-foreground">47</p>
                <p className="text-[10px] text-muted-foreground">
                  Active orders
                </p>
              </div>
              <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Payments
                  </span>
                </div>
                <p className="text-lg font-black text-foreground">₦45k</p>
                <p className="text-[10px] text-muted-foreground">
                  Last payment
                </p>
              </div>
              <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Delivery
                  </span>
                </div>
                <p className="text-lg font-black text-foreground">89%</p>
                <p className="text-[10px] text-muted-foreground">Fulfilled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
