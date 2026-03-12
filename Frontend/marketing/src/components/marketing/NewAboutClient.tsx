"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import {
  IconSparkles as Sparkles,
  IconShield as Shield,
  IconWorld as Globe,
  IconBolt as Zap,
  IconTrendingUp as TrendingUp,
  IconUsers as Users,
  IconMessageCircle as MessageCircle,
} from "@tabler/icons-react";
import { aboutContent } from "@/data/marketing-content";

// Growth timeline visualization component
function GrowthTimeline(): React.JSX.Element {
  const iconMap = [Zap, Users, MessageCircle, TrendingUp];

  return (
    <div className="relative py-12">
      {/* Timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-600" />
      
      <div className="space-y-8">
        {aboutContent.timeline.map((milestone, index) => {
          const Icon = iconMap[index % iconMap.length];

          return (
          <motion.div
            key={milestone.year}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className={`flex items-center gap-4 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
          >
            {/* Content */}
            <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
              <p className="text-sm font-bold text-emerald-600">{milestone.year}</p>
              <p className="text-slate-700 font-medium">{milestone.event}</p>
            </div>
            
            {/* Icon node */}
            <div className="relative z-10 w-12 h-12 bg-white/90 rounded-full border-2 border-emerald-500 flex items-center justify-center shadow-lg backdrop-blur">
              <Icon className="w-5 h-5 text-emerald-600" />
            </div>
            
            {/* Spacer for alternating layout */}
            <div className="flex-1" />
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Values card with icon
function ValueCard({ value, index }: { value: typeof aboutContent.values[number]; index: number }): React.JSX.Element {
  const iconMap = {
    simplicity: Sparkles,
    reliability: Shield,
    african: Globe,
  };
  const Icon = iconMap[value.key as keyof typeof iconMap] ?? Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
      <div className="relative p-8 bg-white/90 backdrop-blur rounded-[28px] border-2 border-slate-900/10 shadow-[0_20px_50px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all">
        <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">{value.title}</h3>
        <p className="text-slate-600 leading-relaxed">{value.description}</p>
      </div>
    </motion.div>
  );
}

export function NewAboutClient(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden text-slate-900">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 leading-tight"
          >
            {aboutContent.heroTitle}{" "}
            <span className="text-emerald-600">{aboutContent.heroHighlight}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            {aboutContent.heroDescription}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutContent.stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-emerald-200/40 rounded-3xl blur-2xl opacity-60" />
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white/70 border border-white/60">
                <Image
                  src={aboutContent.founder.image}
                  alt={`${aboutContent.founder.name}, ${aboutContent.founder.role}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur rounded-xl p-4 shadow-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wide">{aboutContent.founder.role}</p>
                <p className="font-semibold text-slate-900">{aboutContent.founder.name}</p>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">{aboutContent.storyTitle}</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                {aboutContent.storyParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="font-medium text-slate-900">{aboutContent.storyQuote}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-4">
              {aboutContent.missionTitle}
            </p>
            <blockquote className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight">
              "{aboutContent.missionQuote}"
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* Growth Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">Our Journey</h2>
            <p className="mt-4 text-slate-600">From first lines of code to ₦2.5B processed</p>
          </div>
          <GrowthTimeline />
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">How we build</h2>
            <p className="mt-4 text-slate-600">The principles that guide every decision</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aboutContent.values.map((value, index) => (
              <ValueCard key={value.title} value={value} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Investors / Backing */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 mb-8">Backed by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
            {aboutContent.backing.map((partner) => (
              <span key={partner} className="text-lg font-semibold text-slate-400">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
            {aboutContent.ctaTitle}
          </h2>
          <p className="text-slate-600 mb-8">{aboutContent.ctaDescription}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={aboutContent.ctaPrimary.href}>
              <Button variant="outline" className="px-6 py-5 rounded-xl">
                {aboutContent.ctaPrimary.label}
              </Button>
            </Link>
            <Link href={`${APP_URL}${aboutContent.ctaSecondary.href}`}>
              <Button className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-5 rounded-xl">
                {aboutContent.ctaSecondary.label}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
