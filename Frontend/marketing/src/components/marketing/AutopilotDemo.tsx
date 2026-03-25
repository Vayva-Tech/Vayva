"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@vayva/ui";

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  icon: string;
  color: string;
}

const recommendations: Recommendation[] = [
  {
    id: "1",
    category: "Inventory",
    title: "Restock Alert",
    description: "Ankara Dresses running low. 8 sold in 48hrs, only 12 left.",
    impact: "+₦85k potential",
    icon: "📦",
    color: "blue",
  },
  {
    id: "2",
    category: "Pricing",
    title: "Price Optimization",
    description: "Leather bags priced 15% below market. Test ₦45k vs ₦38k.",
    impact: "+12% margin",
    icon: "💰",
    color: "emerald",
  },
  {
    id: "3",
    category: "Marketing",
    title: "Flash Sale Opportunity",
    description: "Dead stock detected: 23 Scarfs unsold 60+ days.",
    impact: "Clear ₦125k stock",
    icon: "⚡",
    color: "amber",
  },
  {
    id: "4",
    category: "Engagement",
    title: "VIP Follow-Up",
    description: "3 high-value customers haven't purchased in 30 days.",
    impact: "₦200k recoverable",
    icon: "👑",
    color: "violet",
  },
  {
    id: "5",
    category: "Operations",
    title: "Staffing Alert",
    description: "Weekend orders up 40%. Consider Saturday temp staff.",
    impact: "Maintain SLA",
    icon: "👥",
    color: "orange",
  },
];

export function AutopilotDemo(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % recommendations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = recommendations[activeIndex];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-emerald-500/20 to-amber-500/20 rounded-3xl blur-2xl" />
      
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse border-2 border-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Vayva Autopilot</h3>
              <p className="text-xs text-slate-500">AI Business Advisor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Live</span>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["All", "Inventory", "Pricing", "Marketing", "Engagement", "Operations"].map((cat, i) => (
              <Button
                type="button"
                variant="ghost"
                key={cat}
                onClick={() => setActiveIndex(i === 0 ? 0 : recommendations.findIndex(r => r.category === cat) || 0)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all h-auto ${
                  (i === 0 && activeIndex === 0) || recommendations[activeIndex]?.category === cat
                    ? "bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Active recommendation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className={`p-4 rounded-xl bg-${active.color}-50 border border-${active.color}-100`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${active.color}-100 flex items-center justify-center text-2xl shrink-0`}>
                    {active.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold text-${active.color}-600 uppercase tracking-wide`}>
                        {active.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{active.title}</h4>
                    <p className="text-sm text-slate-600">{active.description}</p>
                  </div>
                </div>
              </div>

              {/* Impact */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Estimated Impact</span>
                <span className={`text-lg font-bold text-${active.color}-600`}>{active.impact}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  className={`flex-1 py-2.5 px-4 bg-${active.color}-600 hover:bg-${active.color}-700 text-white rounded-xl font-semibold text-sm transition-colors h-auto`}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-colors h-auto"
                >
                  Dismiss
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {recommendations.map((_, i) => (
              <Button
                type="button"
                variant="ghost"
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 min-w-0 p-0 rounded-full transition-all ${
                  i === activeIndex ? "w-8 bg-slate-900 hover:bg-slate-900" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Show recommendation ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer stats */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">35+</p>
            <p className="text-[10px] text-slate-500 uppercase">AI Rules</p>
          </div>
          <div className="text-center border-x border-slate-200">
            <p className="text-lg font-bold text-emerald-600">₦2.1M</p>
            <p className="text-[10px] text-slate-500 uppercase">Value Added</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">24/7</p>
            <p className="text-[10px] text-slate-500 uppercase">Monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
}
