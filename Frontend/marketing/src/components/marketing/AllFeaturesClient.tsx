"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import {
  allFeatures,
  featureCategories,
  getPopularFeatures,
  getNewFeatures,
  type Feature,
  type PlanTier,
} from "@/data/features-data";
import {
  ShoppingCart,
  CreditCard,
  Package,
  Users,
  TrendingUp,
  BarChart3,
  Truck,
  Layout,
  Plug,
  Bot,
  Sparkles,
  Star,
  Check,
  Zap,
  ArrowRight,
  Search,
} from "lucide-react";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";
import { getOfferCopy } from "@/config/pricing";
import { useMarketingOffer } from "@/context/MarketingOfferContext";

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart,
  CreditCard,
  Package,
  Users,
  TrendingUp,
  BarChart3,
  Truck,
  Layout,
  Plug,
  Bot,
  Sparkles,
  Star,
  Zap,
};

const tierConfig: Record<PlanTier, { label: string; color: string; bg: string }> = {
  free: { label: "Free", color: "text-slate-600", bg: "bg-slate-100" },
  starter: { label: "Starter", color: "text-emerald-600", bg: "bg-emerald-100" },
  pro: { label: "Pro", color: "text-violet-600", bg: "bg-violet-100" },
  enterprise: { label: "Enterprise", color: "text-amber-600", bg: "bg-amber-100" },
};

function FeatureCard({ feature, index }: { feature: Feature; index: number }): React.JSX.Element {
  const tier = tierConfig[feature.tier];
  const Icon = iconMap[feature.icon] || Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Icon className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{feature.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tier.bg} ${tier.color} mt-1`}>
                {tier.label}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {feature.popular && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                Popular
              </span>
            )}
            {feature.new && (
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">
                New
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{feature.description}</p>
        {feature.highlights && (
          <ul className="mt-3 space-y-1">
            {feature.highlights.slice(0, 2).map((highlight) => (
              <li key={highlight} className="flex items-center gap-2 text-xs text-slate-500">
                <Check className="w-3 h-3 text-emerald-500" />
                {highlight}
              </li>
            ))}
          </ul>
        )}
    </motion.div>
  );
}

function CategorySection({ 
  category, 
  features, 
  isActive 
}: { 
  category: typeof featureCategories[0]; 
  features: Feature[];
  isActive: boolean;
}): React.JSX.Element | null {
  if (!isActive || features.length === 0) return null;

  const Icon = iconMap[category.icon] || Package;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{category.name}</h2>
          <p className="text-sm text-slate-500">{category.description}</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full shrink-0">
          {features.length} features
        </span>
      </div>
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index} />
        ))}
      </div>
      <div className="sm:hidden -mx-1">
        <MarketingSnapRow
          ariaLabel={`${category.name} features`}
          hint="Swipe to browse features"
          showDots={features.length <= 12}
          dotCount={features.length <= 12 ? features.length : undefined}
        >
          {features.map((feature, index) => (
            <MarketingSnapItem key={feature.id}>
              <FeatureCard feature={feature} index={index} />
            </MarketingSnapItem>
          ))}
        </MarketingSnapRow>
      </div>
    </motion.section>
  );
}

export function AllFeaturesClient(): React.JSX.Element {
  const { starterFirstMonthFree } = useMarketingOffer();
  const offerCopy = getOfferCopy(starterFirstMonthFree);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTier, setActiveTier] = useState<PlanTier | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const popularFeatures = useMemo(() => getPopularFeatures(), []);
  const newFeatures = useMemo(() => getNewFeatures(), []);

  const filteredFeatures = useMemo(() => {
    return allFeatures.filter((feature) => {
      const matchesCategory = activeCategory === "all" || feature.category === activeCategory;
      const matchesTier = activeTier === "all" || feature.tier === activeTier;
      const matchesSearch = 
        searchQuery === "" || 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTier && matchesSearch;
    });
  }, [activeCategory, activeTier, searchQuery]);

  const featuresByCategory = useMemo(() => {
    const grouped: Record<string, Feature[]> = {};
    filteredFeatures.forEach((feature) => {
      if (!grouped[feature.category]) grouped[feature.category] = [];
      grouped[feature.category].push(feature);
    });
    return grouped;
  }, [filteredFeatures]);

  return (
    <div className="relative text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-6 -top-8 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-16 sm:py-20 min-w-0">
          <div className="text-center max-w-3xl mx-auto px-1">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700"
            >
              <Sparkles className="w-3 h-3" />
              100+ Powerful Features
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              Everything you need to{" "}
              <span className="text-emerald-600">scale your business</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-600"
            >
              <span className="sm:hidden">
                AI order capture to analytics—one stack for your whole operation.
              </span>
              <span className="hidden sm:inline">
                From AI-powered order capture to advanced analytics, Vayva gives you the tools
                to run your entire commerce operation in one place.
              </span>
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { value: "100+", label: "Features" },
              { value: "9", label: "Categories" },
              { value: "3", label: "Pricing Tiers" },
              { value: "24/7", label: "AI Available" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/60 border border-slate-200/60">
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Features */}
      <section className="py-16 bg-slate-50/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Most Popular Features</h2>
              <p className="text-slate-500">Loved by thousands of merchants</p>
            </div>
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularFeatures.slice(0, 4).map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
          <div className="sm:hidden -mx-1">
            <MarketingSnapRow
              ariaLabel="Popular features"
              hint="Swipe for popular picks"
              showDots
              dotCount={4}
            >
              {popularFeatures.slice(0, 4).map((feature, index) => (
                <MarketingSnapItem key={feature.id}>
                  <FeatureCard feature={feature} index={index} />
                </MarketingSnapItem>
              ))}
            </MarketingSnapRow>
          </div>
        </div>
      </section>

      {/* New Features */}
      {newFeatures.length > 0 && (
        <section className="py-16">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Recently Added</h2>
                <p className="text-slate-500">The latest improvements to Vayva</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                New
              </span>
            </div>
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newFeatures.slice(0, 4).map((feature, index) => (
                <FeatureCard key={feature.id} feature={feature} index={index} />
              ))}
            </div>
            <div className="sm:hidden -mx-1">
              <MarketingSnapRow
                ariaLabel="New features"
                hint="Swipe for what’s new"
                showDots
                dotCount={Math.min(4, newFeatures.slice(0, 4).length)}
              >
                {newFeatures.slice(0, 4).map((feature, index) => (
                  <MarketingSnapItem key={feature.id}>
                    <FeatureCard feature={feature} index={index} />
                  </MarketingSnapItem>
                ))}
              </MarketingSnapRow>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="sticky top-0 z-30 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Category Tabs */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all h-auto ${
                    activeCategory === "all"
                      ? "bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Features
                </Button>
                {featureCategories.map((cat) => (
                  <Button
                    type="button"
                    variant="ghost"
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 h-auto ${
                      activeCategory === cat.id
                        ? "bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.name}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeCategory === cat.id ? "bg-white/20" : "bg-slate-200"
                    }`}>
                      {cat.featureCount}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Tier Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:mx-0 md:px-0 md:overflow-visible">
              {(["all", "free", "starter", "pro"] as const).map((tier) => (
                <Button
                  type="button"
                  variant="ghost"
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all h-auto ${
                    activeTier === tier
                      ? tier === "free" ? "bg-slate-600 text-white hover:bg-slate-600 hover:text-white" :
                        tier === "starter" ? "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white" :
                        tier === "pro" ? "bg-violet-600 text-white hover:bg-violet-600 hover:text-white" :
                        "bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tier === "all" ? "All Tiers" : tierConfig[tier].label}
                </Button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-8 min-h-[600px]">
        <div className="max-w-[1400px] mx-auto px-6">
          <AnimatePresence mode="wait">
            {activeCategory === "all" ? (
              // Show all categories
              Object.entries(featuresByCategory).map(([catId, features]) => {
                const category = featureCategories.find((c) => c.id === catId);
                if (!category) return null;
                return (
                  <CategorySection
                    key={catId}
                    category={category}
                    features={features}
                    isActive={true}
                  />
                );
              })
            ) : (
              // Show single category
              <>
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFeatures.map((feature, index) => (
                    <FeatureCard key={feature.id} feature={feature} index={index} />
                  ))}
                </div>
                <div className="sm:hidden -mx-1">
                  <MarketingSnapRow
                    ariaLabel="Features"
                    hint="Swipe to browse"
                    showDots={filteredFeatures.length <= 12}
                    dotCount={filteredFeatures.length <= 12 ? filteredFeatures.length : undefined}
                  >
                    {filteredFeatures.map((feature, index) => (
                      <MarketingSnapItem key={feature.id}>
                        <FeatureCard feature={feature} index={index} />
                      </MarketingSnapItem>
                    ))}
                  </MarketingSnapRow>
                </div>
              </>
            )}
          </AnimatePresence>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No features found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-200/70">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="relative rounded-[40px] border-2 border-slate-900/10 bg-gradient-to-br from-slate-900 to-slate-800 p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to explore these features?
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                {offerCopy.primaryCta}. Get full access to those features. {offerCopy.noCard}.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`${APP_URL}/signup`}>
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-6 rounded-2xl text-base font-semibold">
                    {offerCopy.primaryCta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 px-8 py-6 rounded-2xl text-base font-semibold">
                    Compare Plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
