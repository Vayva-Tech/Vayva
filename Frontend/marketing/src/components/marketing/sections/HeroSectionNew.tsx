"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@vayva/ui";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { APP_URL } from "@/lib/constants";
import { landingContent } from "@/data/marketing-content";
import { getLandingHeroTrustChips } from "@/config/pricing";
import { useMarketingOffer } from "@/context/MarketingOfferContext";

export function HeroSection(): React.JSX.Element {
  const { starterFirstMonthFree } = useMarketingOffer();
  const heroStats = getLandingHeroTrustChips(starterFirstMonthFree);

  return (
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
              Watch demo
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
          {heroStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {stat}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
