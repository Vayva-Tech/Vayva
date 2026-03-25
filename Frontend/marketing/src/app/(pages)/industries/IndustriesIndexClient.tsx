"use client";

import React from "react";
import Link from "next/link";
import { industriesContent } from "@/data/marketing-content";
import { MarketingSnapItem, MarketingSnapRow } from "@/components/marketing/MarketingSnapRow";

const INDUSTRY_ORDER = [
  "retail",
  "fashion",
  "electronics",
  "food",
  "beauty",
  "grocery",
  "hospitality",
  "services",
  "digital",
  "events",
  "b2b",
  "real_estate",
  "automotive",
  "travel_hospitality",
  "blog_media",
  "creative_portfolio",
  "nonprofit",
  "education",
  "one_product",
  "nightlife",
  "marketplace",
] as const;

type IndustryKey = (typeof INDUSTRY_ORDER)[number];

const INDUSTRY_META: Record<IndustryKey, { slug: string; subtitle: string }> = {
  retail: { slug: "retail", subtitle: "General commerce & inventory" },
  fashion: { slug: "fashion", subtitle: "Clothing & accessories" },
  electronics: { slug: "electronics", subtitle: "Gadgets & devices" },
  food: { slug: "food", subtitle: "Restaurants & delivery" },
  beauty: { slug: "beauty", subtitle: "Salons & wellness" },
  grocery: { slug: "grocery", subtitle: "Fresh & packaged goods" },
  hospitality: { slug: "hospitality", subtitle: "Hotels & rentals" },
  services: { slug: "services", subtitle: "Professional services" },
  digital: { slug: "digital", subtitle: "Downloads & subscriptions" },
  events: { slug: "events", subtitle: "Ticketing & conferences" },
  b2b: { slug: "b2b", subtitle: "Wholesale & quotes" },
  real_estate: { slug: "real_estate", subtitle: "Listings & viewings" },
  automotive: { slug: "automotive", subtitle: "Vehicles & test drives" },
  travel_hospitality: { slug: "travel_hospitality", subtitle: "Stays & reservations" },
  blog_media: { slug: "blog_media", subtitle: "Publishing & media" },
  creative_portfolio: { slug: "creative_portfolio", subtitle: "Showcase & inquiries" },
  nonprofit: { slug: "nonprofit", subtitle: "Campaigns & donors" },
  education: { slug: "education", subtitle: "Courses & cohorts" },
  one_product: { slug: "one_product", subtitle: "Hero product funnels" },
  nightlife: { slug: "nightlife", subtitle: "Tickets & reservations" },
  marketplace: { slug: "marketplace", subtitle: "Multi-vendor operations" },
};

function IndustryCard({
  industryKey,
  compact,
}: {
  industryKey: IndustryKey;
  compact?: boolean;
}): React.JSX.Element {
  const content = industriesContent[industryKey];
  const meta = INDUSTRY_META[industryKey];
  return (
    <Link
      href={`/industries/${meta.slug}`}
      className="group block h-full rounded-[28px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md flex flex-col"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
        {meta.subtitle}
      </div>
      <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">
        {content.title}
      </h2>
      <p className="mt-2 text-sm text-slate-600 flex-grow leading-snug">
        {compact
          ? `${content.description.slice(0, 120).trim()}…`
          : content.description}
      </p>
      {!compact && (
        <div className="mt-4 hidden sm:flex flex-wrap gap-2">
          {content.tools.slice(0, 2).map((tool) => (
            <span
              key={tool.title}
              className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
            >
              {tool.title}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 text-sm font-semibold text-slate-900 group-hover:text-emerald-600">
        See playbook →
      </div>
    </Link>
  );
}

export function IndustriesIndexClient(): React.JSX.Element {
  return (
    <div className="relative w-full min-w-0 overflow-x-hidden">
      <section className="pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-8">
        <div className="absolute -left-16 top-12 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-8 top-4 h-56 w-56 rounded-full bg-fuchsia-200/25 blur-3xl" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-slate-700 shadow-sm">
            Industries
          </span>
          <h1 className="mt-5 sm:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight text-balance px-1">
            Built for every business model
            <span className="relative ml-1 sm:ml-2 inline-flex text-emerald-600">
              in Africa
              <svg
                className="absolute -bottom-2 left-0 w-full hidden sm:block"
                viewBox="0 0 200 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 8C50 4 150 4 198 8"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto text-pretty px-1">
            <span className="md:hidden">
              Tailored tools and AI for your vertical—swipe to explore.
            </span>
            <span className="hidden md:inline">
              Every industry gets a tailored stack of tools, AI automations, and
              workflows. Explore how Vayva delivers the exact advantages each
              business needs.
            </span>
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-24 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-6 hidden sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRY_ORDER.map((key) => (
            <IndustryCard key={key} industryKey={key} />
          ))}
        </div>
        <div className="sm:hidden -mx-1 pb-4">
          <MarketingSnapRow
            ariaLabel="Industries"
            hint="Swipe to browse industries"
            hintSub="Short previews — open for full playbook"
            showDots
            dotCount={INDUSTRY_ORDER.length}
          >
            {INDUSTRY_ORDER.map((key) => (
              <MarketingSnapItem key={key}>
                <IndustryCard industryKey={key} compact />
              </MarketingSnapItem>
            ))}
          </MarketingSnapRow>
        </div>
      </section>
    </div>
  );
}
