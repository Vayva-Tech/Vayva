import React from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Calendar, 
  Building2,
  ArrowRight,
  Store,
  ChefHat,
  Briefcase,
  Handshake
} from "lucide-react";

const SOLUTIONS = [
  {
    id: "commerce",
    title: "Retail & E-commerce",
    headline: "From boutique to brand",
    description: "Sell products online and in-person with inventory management, AI order capture, and integrated payments.",
    icon: ShoppingBag,
    color: "emerald",
    industries: [
      { name: "Retail", slug: "retail", description: "General commerce & inventory" },
      { name: "Fashion", slug: "fashion", description: "Clothing & accessories" },
      { name: "Electronics", slug: "electronics", description: "Gadgets & devices" },
      { name: "Grocery", slug: "grocery", description: "Fresh & packaged goods" },
      { name: "Beauty", slug: "beauty", description: "Cosmetics & wellness" },
      { name: "Automotive", slug: "automotive", description: "Vehicles & parts" },
    ],
    features: ["AI Order Capture", "Inventory Management", "POS Mode", "WhatsApp Sales"],
    stat: "40%",
    statLabel: "More Orders",
  },
  {
    id: "food",
    title: "Restaurants & Food",
    headline: "From order to kitchen to delivery",
    description: "Manage dine-in, takeaway, and delivery with kitchen displays, menu management, and real-time tracking.",
    icon: UtensilsCrossed,
    color: "orange",
    industries: [
      { name: "Restaurants", slug: "food", description: "Dine-in & delivery" },
      { name: "Nightlife", slug: "nightlife", description: "Bars & events" },
      { name: "Hospitality", slug: "hospitality", description: "Hotels & catering" },
    ],
    features: ["Kitchen Display", "Menu Management", "Table Booking", "Delivery Tracking"],
    stat: "2.5x",
    statLabel: "Faster Orders",
  },
  {
    id: "bookings",
    title: "Services & Bookings",
    headline: "From booking to checkout",
    description: "Schedule appointments, manage services, and accept payments—all synced in real-time.",
    icon: Calendar,
    color: "blue",
    industries: [
      { name: "Services", slug: "services", description: "Professional services" },
      { name: "Real Estate", slug: "real_estate", description: "Listings & viewings" },
      { name: "Education", slug: "education", description: "Courses & training" },
      { name: "Events", slug: "events", description: "Ticketing & conferences" },
      { name: "Travel", slug: "travel_hospitality", description: "Stays & reservations" },
    ],
    features: ["Online Booking", "Calendar Sync", "Prepayments", "Auto-Reminders"],
    stat: "60%",
    statLabel: "Fewer No-Shows",
  },
  {
    id: "b2b",
    title: "B2B Wholesale",
    headline: "From quote to cash",
    description: "Sell to other businesses with professional quotes, credit terms, and wholesale catalogs.",
    icon: Building2,
    color: "purple",
    industries: [
      { name: "B2B Wholesale", slug: "b2b", description: "Wholesale & distribution" },
      { name: "Marketplace", slug: "marketplace", description: "Multi-vendor platform" },
    ],
    features: ["Quote Management", "Credit Accounts", "Wholesale Pricing", "Requisitions"],
    stat: "3x",
    statLabel: "Faster Quotes",
  },
];

export default function SolutionsPage(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6 sm:px-8">
        <div className="absolute -left-16 top-12 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-8 top-4 h-56 w-56 rounded-full bg-fuchsia-200/25 blur-3xl" />
        <div className="relative max-w-[1600px] mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900/10 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            Solutions
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            Built for how you
            <span className="relative ml-2 inline-flex text-emerald-600">
              actually work
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 4 150 4 198 8" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
            Four business archetypes. One platform. Whether you sell products, serve meals, 
            book appointments, or handle B2B orders—Vayva adapts to your workflow.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="pb-24 px-6 sm:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {SOLUTIONS.map((solution) => {
              const Icon = solution.icon;
              const colorClasses: Record<string, { bg: string; text: string; border: string; light: string }> = {
                emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", light: "bg-emerald-50" },
                orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-200", light: "bg-orange-50" },
                blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", light: "bg-blue-50" },
                purple: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-200", light: "bg-purple-50" },
              };
              const colors = colorClasses[solution.color];

              return (
                <div
                  key={solution.id}
                  className="group relative bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${colors.light} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>

                  {/* Title & Headline */}
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{solution.title}</h2>
                  <p className={`text-lg font-medium ${colors.text} mb-4`}>{solution.headline}</p>
                  <p className="text-slate-600 mb-6">{solution.description}</p>

                  {/* Stats */}
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className={`text-4xl font-black ${colors.text}`}>{solution.stat}</span>
                    <span className="text-slate-500">{solution.statLabel}</span>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {solution.features.map((feature) => (
                      <span
                        key={feature}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${colors.light} ${colors.text}`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Industries */}
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Industries
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {solution.industries.map((industry) => (
                        <Link
                          key={industry.slug}
                          href={`/industries/${industry.slug}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-sm hover:bg-slate-100 transition-colors"
                        >
                          {industry.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <Link href={`/industries/${solution.industries[0].slug}`}>
                      <Button className={`w-full ${colors.bg} hover:opacity-90 text-white`}>
                        Explore {solution.title}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 sm:px-8 bg-slate-900">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Not sure which solution fits?
          </h2>
          <p className="text-slate-400 mb-8">
            Every business is unique. See all 20+ industry-specific setups or start with a free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/industries">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                View All Industries
              </Button>
            </Link>
            <Link href="/checkout?plan=starter">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
