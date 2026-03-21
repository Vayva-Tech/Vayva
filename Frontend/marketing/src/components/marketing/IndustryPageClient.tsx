"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import * as TablerIcons from "@tabler/icons-react";

type TablerIcon = React.ComponentType<{ className?: string; stroke?: number }>;

const TABLER_ICON_MAP: Record<string, string> = {
  "🧾": "IconReceipt",
  "📦": "IconBox",
  "🚚": "IconTruckDelivery",
  "💳": "IconCreditCard",
  "👥": "IconUsers",
  "📈": "IconChartLine",
  "📱": "IconDeviceMobile",
  "💅": "IconBrush",
  "📅": "IconCalendar",
  "⭐": "IconStar",
  "🔧": "IconTool",
  "🛡️": "IconShieldCheck",
  "🎟️": "IconTicket",
  "📊": "IconChartBar",
  "🤝": "IconHandshake",
  "👗": "IconHanger",
  "🏷️": "IconTag",
  "📸": "IconCamera",
  "📟": "IconDeviceLaptop",
  "🪑": "IconArmchair",
  "🍎": "IconApple",
  "🏠": "IconHome",
  "📍": "IconMapPin",
  "💼": "IconBriefcase",
  "📄": "IconFileText",
  "📂": "IconFolder",
  "🔐": "IconLock",
  "💸": "IconCash",
  "🚗": "IconCar",
  "🛏️": "IconBed",
  "📩": "IconMail",
  "📰": "IconNews",
  "🔍": "IconSearch",
  "📬": "IconMailbox",
  "🔗": "IconLink",
  "🎨": "IconPalette",
  "❤️": "IconHeart",
  "📣": "IconMegaphone",
  "🎓": "IconSchool",
  "📋": "IconChecklist",
  "💬": "IconMessage",
  "🧑‍🤝‍🧑": "IconUsersGroup",
  "⚖️": "IconScale",
  "🛒": "IconShoppingCart",
  "⚡": "IconBolt",
  "⏳": "IconHourglass",
  "🍾": "IconBottle",
};

const TABLER_ICONS = TablerIcons as unknown as Record<string, TablerIcon>;

export type IndustryContent = {
  label: string;
  title: string;
  highlight: string;
  description: string;
  stats: { value: string; label: string; description: string }[];
  featureTitle: string;
  featureDescription: string;
  features: { icon: string; title: string; description: string }[];
  tools: { title: string; description: string }[];
  aiAdvantages: string[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
  ctaHref?: string;
  ctaSubtext?: string;
  availability?: "available" | "coming_soon";
  image?: string;
};

export function IndustryPageClient({ content }: { content: IndustryContent }): React.JSX.Element {
  return (
    <div className="relative overflow-hidden text-slate-900">
      <section className="relative pt-20 pb-8 px-6 sm:px-8">
        <div className="absolute -left-16 top-12 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-8 top-4 h-56 w-56 rounded-full bg-fuchsia-200/25 blur-3xl" />
        <div className="relative max-w-[1600px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900/10 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                    {content.label}
                  </span>
                  {content.availability === "coming_soon" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      Coming soon
                    </span>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6">
                  {content.title}
                  <br />
                  <span className="relative inline-flex text-emerald-600">
                    {content.highlight}
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <path d="M2 8C50 4 150 4 198 8" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 mb-8">
                  {content.description}
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Link href={content.ctaHref ?? `${APP_URL}/signup`}>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-base font-semibold rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
                      {content.ctaButton}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right: Hero Image */}
              <div className="relative">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[32px] border-2 border-emerald-200/60" />
                <div className="relative rounded-[32px] overflow-hidden border-2 border-slate-900/10 shadow-[0_30px_70px_rgba(15,23,42,0.15)]">
                  {content.image ? (
                    <Image
                      src={content.image}
                      alt={`${content.title} - ${content.highlight}`}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-emerald-100 to-fuchsia-100 flex items-center justify-center">
                      <span className="text-6xl">✨</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {content.stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative"
            >
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
              <div className="relative text-center p-6 bg-white/90 backdrop-blur rounded-[28px] border-2 border-slate-900/10 shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
                <p className="text-3xl font-semibold text-emerald-600 mb-1">{stat.value}</p>
                <p className="font-semibold text-slate-900 mb-1">{stat.label}</p>
                <p className="text-sm text-slate-500">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">{content.featureTitle}</h2>
            <p className="text-lg text-slate-600">{content.featureDescription}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.features.map((feature, index) => (
              (() => {
                const iconName = TABLER_ICON_MAP[feature.icon] ?? "IconSparkles";
                const Icon = TABLER_ICONS[iconName] ?? TABLER_ICONS.IconSparkles;
                return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
                <div className="relative p-6 bg-white/90 backdrop-blur rounded-[28px] border-2 border-slate-900/10 shadow-[0_20px_50px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-[0_10px_25px_rgba(16,185,129,0.25)]">
                    <Icon className="h-6 w-6" stroke={1.6} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </motion.div>
                );
              })()
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8 bg-slate-50/70">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 mb-3">
              Industry toolkit
            </p>
            <h2 className="text-3xl font-black text-slate-900">Tools built for this industry</h2>
            <p className="text-lg text-slate-600 mt-3">
              The exact workflows, templates, and tracking that make day-to-day operations easier.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.tools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative"
              >
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
                <div className="relative p-6 bg-white/90 backdrop-blur rounded-[28px] border-2 border-slate-900/10 shadow-[0_20px_50px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{tool.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="rounded-[32px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-10 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              AI advantages
            </p>
            <h2 className="mt-4 text-3xl font-black text-slate-900">
              How Vayva AI makes this industry easier
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Automation, recommendations, and proactive insights tailored to the way you operate.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {content.aiAdvantages.map((advantage) => (
                <div key={advantage} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-sm text-slate-700 leading-relaxed">{advantage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-8">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-6">{content.ctaTitle}</h2>
          <p className="text-lg text-slate-600 mb-8">{content.ctaDescription}</p>
          <Link href={content.ctaHref ?? `${APP_URL}/signup`}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 text-lg font-semibold rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
              {content.ctaButton}
            </Button>
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            {content.ctaSubtext ?? "7-day free trial • No credit card required"}
          </p>
        </div>
      </section>
    </div>
  );
}
