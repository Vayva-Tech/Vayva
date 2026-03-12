import React from "react";
import Link from "next/link";
import { industriesContent } from "@/data/marketing-content";

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

export default function IndustriesIndexPage(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      <section className="pt-28 pb-16 px-6 sm:px-8">
        <div className="absolute -left-16 top-12 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-8 top-4 h-56 w-56 rounded-full bg-fuchsia-200/25 blur-3xl" />
        <div className="relative max-w-[1600px] mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900/10 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            Industries
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            Built for every business model
            <span className="relative ml-2 inline-flex text-emerald-600">
              in Africa
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 4 150 4 198 8" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
            Every industry gets a tailored stack of tools, AI automations, and workflows.
            Explore how Vayva delivers the exact advantages each business needs.
          </p>
        </div>
      </section>

      <section className="pb-24 px-6 sm:px-8">
        <div className="max-w-[1600px] mx-auto px-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRY_ORDER.map((key) => {
            const content = industriesContent[key];
            const meta = INDUSTRY_META[key];
            return (
              <Link
                key={key}
                href={`/industries/${meta.slug}`}
                className="group relative h-full"
              >
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-300/40" />
                <div className="relative rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] transition-transform group-hover:-translate-y-1 h-full flex flex-col">
                  <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                    {meta.subtitle}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                    {content.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 flex-grow">{content.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {content.tools.slice(0, 2).map((tool) => (
                      <span
                        key={tool.title}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                      >
                        {tool.title}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 text-sm font-semibold text-slate-900 group-hover:text-emerald-600">
                    See industry playbook →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
