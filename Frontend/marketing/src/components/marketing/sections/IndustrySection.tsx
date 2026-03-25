"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBuildingStore as Store,
  IconToolsKitchen2 as Utensils,
  IconShoppingBag as ShoppingBag,
  IconSparkles as Sparkles,
  IconCar as Car,
  IconHeart as Heart,
  IconChevronRight as ChevronRight,
  IconMessageCircle as MessageCircle,
  IconShoppingCart as ShoppingCart,
  IconTrendingUp as TrendingUp,
  IconUsers as Users,
  IconHeartHandshake as HeartHandshake,
  IconCpu as Cpu,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@vayva/ui";

// Industry-specific mockup components
function RetailMockup() {
  return (
    <div className="w-full h-full bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-700">Ade&apos;s General Store</div>
          <div className="text-[10px] text-slate-500">Retail Dashboard</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <div className="text-lg font-bold text-blue-600">₦89K</div>
          <div className="text-[10px] text-slate-500">Today&apos;s Sales</div>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <div className="text-lg font-bold text-emerald-600">47</div>
          <div className="text-[10px] text-slate-500">Orders</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-2 shadow-sm">
        <div className="text-[10px] font-medium text-slate-700 mb-2">Low Stock Alert</div>
        <div className="space-y-1">
          {["Rice (5 bags left)", "Detergent (8 left)"].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] text-slate-600">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FoodMockup() {
  return (
    <div className="w-full h-full bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
          <Utensils className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-700">Mama&apos;s Kitchen</div>
          <div className="text-[10px] text-slate-500">Kitchen Display</div>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { order: "#F-1021", items: "Jollof Rice x2, Chicken x2", time: "15 min", status: "cooking" },
          { order: "#F-1022", items: "Fried Rice, Moin Moin", time: "5 min", status: "ready" },
          { order: "#F-1023", items: "Pepper Soup x3", time: "25 min", status: "new" },
        ].map((order, i) => (
          <div key={i} className="bg-white rounded-lg p-2 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-slate-700">{order.order}</div>
              <div className="text-[8px] text-slate-500">{order.items}</div>
            </div>
            <div className={`px-2 py-1 rounded text-[8px] font-medium ${
              order.status === "ready" ? "bg-emerald-100 text-emerald-700" :
              order.status === "cooking" ? "bg-amber-100 text-amber-700" :
              "bg-blue-100 text-blue-700"
            }`}>
              {order.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FashionMockup() {
  return (
    <div className="w-full h-full bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-700">Zara&apos;s Boutique</div>
          <div className="text-[10px] text-slate-500">Inventory</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { item: "Ankara Dress", variants: "6 sizes, 4 colors", stock: "12 left" },
          { item: "Lace Gown", variants: "4 sizes, 2 colors", stock: "8 left" },
          { item: "Kaftan Set", variants: "5 sizes, 3 colors", stock: "15 left" },
          { item: "Head Tie", variants: "One size, 8 colors", stock: "34 left" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-[10px] font-medium text-slate-700">{item.item}</div>
            <div className="text-[8px] text-slate-500">{item.variants}</div>
            <div className="text-[8px] text-emerald-600 mt-1">{item.stock}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutoMockup() {
  return (
    <div className="w-full h-full bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
          <Car className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-700">AutoParts NG</div>
          <div className="text-[10px] text-slate-500">Parts Lookup</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 shadow-sm mb-2">
        <div className="text-[10px] font-medium text-slate-700 mb-2">Search: Toyota Corolla 2019</div>
        <div className="space-y-2">
          {[
            { part: "Brake Pads", price: "₦15,000", stock: "In stock" },
            { part: "Air Filter", price: "₦8,500", stock: "In stock" },
            { part: "Oil Filter", price: "₦4,200", stock: "Low stock" },
          ].map((part, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
              <span className="text-[10px] text-slate-700">{part.part}</span>
              <div className="text-right">
                <div className="text-[10px] font-semibold">{part.price}</div>
                <div className={`text-[8px] ${part.stock === "In stock" ? "text-emerald-600" : "text-amber-600"}`}>
                  {part.stock}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NonprofitMockup() {
  return (
    <div className="w-full h-full bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
          <HeartHandshake className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-700">Hope Foundation</div>
          <div className="text-[10px] text-slate-500">Campaign Dashboard</div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-3 text-white mb-3">
        <div className="text-[10px] opacity-90">Education Fund 2026</div>
        <div className="text-xl font-bold">₦2.4M raised</div>
        <div className="text-[10px] opacity-90">of ₦5M goal (156 donors)</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-lg p-2 shadow-sm text-center">
          <div className="text-lg font-bold text-red-600">89%</div>
          <div className="text-[10px] text-slate-500">Donor retention</div>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm text-center">
          <div className="text-lg font-bold text-emerald-600">₦15K</div>
          <div className="text-[10px] text-slate-500">Avg donation</div>
        </div>
      </div>
    </div>
  );
}

function AIMockup() {
  return (
    <div className="w-full h-full bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-700">Vayva AI</div>
          <div className="text-[10px] text-slate-500">Autopilot Insights</div>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { type: "insight", text: "Restock Ankara fabric - 73% sell-through", icon: TrendingUp },
          { type: "suggestion", text: "Offer 10% discount on slow-moving items", icon: ShoppingCart },
          { type: "alert", text: "3 customers abandoned carts - follow up?", icon: MessageCircle },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className={`rounded-lg p-2 shadow-sm ${
              item.type === "insight" ? "bg-blue-50 border border-blue-100" :
              item.type === "suggestion" ? "bg-emerald-50 border border-emerald-100" :
              "bg-amber-50 border border-amber-100"
            }`}>
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 ${
                  item.type === "insight" ? "text-blue-600" :
                  item.type === "suggestion" ? "text-emerald-600" :
                  "text-amber-600"
                }`} />
                <div>
                  <div className="text-[10px] text-slate-700">{item.text}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Button type="button" variant="outline" className="text-[8px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 h-auto min-h-0 min-w-0">
                      View
                    </Button>
                    <Button type="button" variant="link" className="text-[8px] text-emerald-600 font-medium h-auto min-h-0 min-w-0 p-0">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const industries = [
  {
    key: "retail",
    label: "General Retail",
    icon: Store,
    headline: "From messy notebooks to clean records",
    problem: "You're copying WhatsApp orders into notebooks at midnight.",
    solution: "Vayva captures every WhatsApp order automatically. Creates invoices, tracks inventory, confirms payments.",
    outcome: "50% more orders, same staff size.",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    mockup: RetailMockup,
  },
  {
    key: "food",
    label: "Food & Restaurants",
    icon: Utensils,
    headline: "Your kitchen, organized",
    problem: "Orders come from WhatsApp, Instagram, phone calls. Chaos.",
    solution: "One dashboard for all channels. Prep time tracking. Kitchen displays. Delivery coordination.",
    outcome: "No more missed orders. Faster prep times.",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    mockup: FoodMockup,
  },
  {
    key: "fashion",
    label: "Fashion & Beauty",
    icon: ShoppingBag,
    headline: "Run your boutique like a pro",
    problem: "Tracking sizes, colors, stock levels across platforms.",
    solution: "Complete inventory by variant. Customer size history. Pre-orders. WhatsApp catalogs.",
    outcome: "Know exactly what's in stock, always.",
    color: "bg-pink-500",
    textColor: "text-pink-600",
    mockup: FashionMockup,
  },
  {
    key: "automotive",
    label: "Auto Parts",
    icon: Car,
    headline: "Parts management, simplified",
    problem: "Hundreds of SKUs, cross-references, customer requests.",
    solution: "Vehicle-based search. Fitment data. Inventory alerts. Customer vehicle history.",
    outcome: "Find the right part in seconds.",
    color: "bg-amber-500",
    textColor: "text-amber-600",
    mockup: AutoMockup,
  },
  {
    key: "nonprofit",
    label: "Nonprofits",
    icon: Heart,
    headline: "Fundraising without the overhead",
    problem: "Tracking donors, campaigns, expenses with limited staff.",
    solution: "Donor management. Campaign tracking. Automated receipts. Grant compliance.",
    outcome: "More time for your cause, less for paperwork.",
    color: "bg-red-500",
    textColor: "text-red-600",
    mockup: NonprofitMockup,
  },
  {
    key: "ai",
    label: "AI Features",
    icon: Sparkles,
    headline: "Your AI business assistant",
    problem: "Too busy to analyze trends, optimize prices, follow up with customers.",
    solution: "Autopilot analyzes your data daily. Recommends actions. You approve.",
    outcome: "Smart decisions without the headache.",
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    mockup: AIMockup,
  },
];

export function IndustrySection(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState(industries[0].key);
  const activeIndustry = industries.find((i) => i.key === activeTab);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-50 to-blue-50 rounded-full blur-3xl opacity-50" />
      
      <div className="container-wide relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex mb-4 items-center gap-2 px-4 py-2 rounded-full bg-white text-emerald-700 text-sm font-medium border border-slate-200/80 shadow-sm">
            <Users className="w-4 h-4" />
            19 industries supported
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Built for your specific business
          </h2>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
            Not a generic tool. Every industry gets tailored features that actually help.
          </p>
        </motion.div>

        {/* Industry tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {industries.map((industry) => (
            <Button
              type="button"
              variant="ghost"
              key={industry.key}
              onClick={() => setActiveTab(industry.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all h-auto ${
                activeTab === industry.key
                  ? `${industry.color} text-white shadow-lg hover:opacity-95`
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <industry.icon className="w-4 h-4" />
              {industry.label}
            </Button>
          ))}
        </div>

        {/* Active industry content */}
        <AnimatePresence mode="wait">
          {activeIndustry && (
            <motion.div
              key={activeIndustry.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1400px] mx-auto px-6"
            >
              <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left: Content */}
                    <div className="order-2 md:order-1">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${activeIndustry.color} bg-opacity-10 text-white mb-4`}>
                        <activeIndustry.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{activeIndustry.label}</span>
                      </div>
                      
                      <h3 className="text-3xl font-bold text-slate-900 mb-4">
                        {activeIndustry.headline}
                      </h3>

                      <div className="space-y-4 mb-6">
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-red-600 text-xs font-bold">✕</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-red-600 mb-1">The Problem</div>
                            <p className="text-slate-600 text-sm">{activeIndustry.problem}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-emerald-600 mb-1">How Vayva Helps</div>
                            <p className="text-slate-600 text-sm">{activeIndustry.solution}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-blue-600 mb-1">The Result</div>
                            <p className="text-slate-600 text-sm">{activeIndustry.outcome}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/industries/${activeIndustry.key}`}
                        className={`inline-flex items-center gap-2 ${activeIndustry.textColor} font-semibold hover:opacity-80 transition-opacity`}
                      >
                        See all {activeIndustry.label.toLowerCase()} features
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Right: Visual Mockup */}
                    <div className="order-1 md:order-2">
                      <div className="relative">
                        {/* Phone frame */}
                        <div className="relative mx-auto w-64 h-80 bg-slate-900 rounded-[2.5rem] p-2 shadow-xl border border-slate-800/80">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
                          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                            <activeIndustry.mockup />
                          </div>
                        </div>
                        {/* Decorative elements */}
                        <div className={`absolute -top-4 -right-4 w-20 h-20 ${activeIndustry.color} rounded-full opacity-20 blur-2xl`} />
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-emerald-500 rounded-full opacity-20 blur-2xl" />
                      </div>
                    </div>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
