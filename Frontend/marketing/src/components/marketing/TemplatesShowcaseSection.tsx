"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";
import {
  Palette,
  Layout,
  Sparkles,
  Zap,
  Globe,
  Smartphone,
  ShoppingBag,
  Calendar,
  Car,
  Heart,
  Briefcase,
  GraduationCap,
  Ticket,
  Home,
  Utensils,
  Dumbbell,
  Music,
  Camera,
  Truck,
  Leaf,
  Baby,
  Dog,
  Wrench,
  Wine,
  Shirt,
  Laptop,
  Hammer,
  Building2,
  Landmark,
} from "lucide-react";

// Template categories with their counts and descriptions
const TEMPLATE_CATEGORIES = [
  {
    id: "retail",
    name: "Retail & E-Commerce",
    count: 12,
    icon: ShoppingBag,
    description: "From fashion boutiques to electronics stores",
    templates: ["Fashion", "Electronics", "Jewelry", "Beauty", "Furniture", "Toys", "Sports", "Books", "Groceries", "Home & Garden", "Baby & Kids", "General Store"],
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "services",
    name: "Services & Bookings",
    count: 10,
    icon: Calendar,
    description: "Appointment-based businesses made simple",
    templates: ["Beauty & Spa", "Healthcare", "Legal Services", "Consulting", "Auto Repair", "Cleaning", "Photography", "Events", "Fitness", "Salon"],
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "food",
    name: "Food & Hospitality",
    count: 8,
    icon: Utensils,
    description: "Restaurants, cafes, and food delivery",
    templates: ["Restaurant", "Fast Food", "Cafe", "Bakery", "Food Truck", "Catering", "Bar & Lounge", "Hotel"],
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "creative",
    name: "Creative & Portfolio",
    count: 8,
    icon: Palette,
    description: "Showcase your work and attract clients",
    templates: ["Photographer", "Designer", "Artist", "Writer", "Musician", "Agency", "Studio", "Creative Portfolio"],
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "education",
    name: "Education & Learning",
    count: 6,
    icon: GraduationCap,
    description: "Courses, workshops, and training platforms",
    templates: ["Online Courses", "LMS Platform", "Workshop", "Tutoring", "Language School", "Training Center"],
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "realestate",
    name: "Real Estate & Automotive",
    count: 6,
    icon: Home,
    description: "Property listings and vehicle sales",
    templates: ["Real Estate", "Property Management", "Car Dealership", "Auto Parts", "Rental Agency", "Motorsports"],
    color: "from-indigo-500 to-blue-700",
  },
  {
    id: "tech",
    name: "Technology & SaaS",
    count: 6,
    icon: Laptop,
    description: "Software, apps, and digital products",
    templates: ["SaaS Product", "App Landing", "Tech Startup", "Software", "Digital Agency", "IT Services"],
    color: "from-sky-500 to-cyan-600",
  },
  {
    id: "events",
    name: "Events & Entertainment",
    count: 6,
    icon: Ticket,
    description: "Ticketing, venues, and experiences",
    templates: ["Event Venue", "Ticketing Platform", "Nightlife", "Wedding", "Conference", "Festival"],
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "nonprofit",
    name: "Nonprofit & Community",
    count: 4,
    icon: Heart,
    description: "Charities, causes, and community groups",
    templates: ["Charity", "NGO", "Community Center", "Fundraising"],
    color: "from-rose-500 to-red-600",
  },
  {
    id: "specialized",
    name: "Specialized Industries",
    count: 6,
    icon: Wrench,
    description: "Niche business verticals",
    templates: ["Construction", "Agriculture", "Manufacturing", "Logistics", "Pet Services", "Wellness"],
    color: "from-slate-500 to-slate-700",
  },
];

// Mini-features that make template setup easy
const SETUP_FEATURES = [
  {
    title: "One-Click Template Selection",
    description: "Browse by industry or business type. Preview any template instantly before choosing.",
    icon: Layout,
  },
  {
    title: "Visual WebStudio Editor",
    description: "Drag-and-drop customization. Change colors, fonts, and layouts without writing code.",
    icon: Palette,
  },
  {
    title: "AI-Powered Content Suggestions",
    description: "Get smart recommendations for product descriptions, about pages, and marketing copy.",
    icon: Sparkles,
  },
  {
    title: "Instant Mobile Preview",
    description: "See exactly how your store looks on phones as you edit. Mobile-first by default.",
    icon: Smartphone,
  },
  {
    title: "Industry-Optimized Settings",
    description: "Each template comes pre-configured with the right features for your business type.",
    icon: Zap,
  },
  {
    title: "Global Commerce Ready",
    description: "Multi-currency support, local payment methods, and language options built-in.",
    icon: Globe,
  },
];

// Stats to highlight
const TEMPLATE_STATS = [
  { value: "4+", label: "Templates", subtext: "4 free, upgrade for more" },
  { value: "Visual", label: "Editor", subtext: "Drag-and-drop" },
  { value: "0", label: "Code Required", subtext: "Easy customization" },
  { value: "<5min", label: "Setup Time", subtext: "From template to live" },
];

export function TemplatesShowcaseSection(): React.JSX.Element {
  const [activeCategory, setActiveCategory] = React.useState(TEMPLATE_CATEGORIES[0].id);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-slate-50 to-white">
        <div className="relative max-w-[1600px] mx-auto px-6 py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 text-sm font-semibold text-emerald-700 mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Professional Templates + Visual Editor
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto"
          >
            Your perfect storefront,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              ready in minutes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Choose from professionally designed templates for your business. 
            The Free plan includes 4 templates; upgrade to unlock more designs. 
            Each template is mobile-ready and fully customizable with our visual editor.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {TEMPLATE_STATS.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-700 mt-1">{stat.label}</div>
                <div className="text-xs text-slate-500">{stat.subtext}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link href={`${APP_URL}/signup`}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-xl text-base font-semibold h-auto">
                Browse All Templates
              </Button>
            </Link>
            <Link href="#categories">
              <Button variant="outline" className="px-8 py-6 rounded-xl text-base font-semibold h-auto">
                Explore by Industry
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Template Categories */}
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Template Library
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              Find your industry. Start with a template built for it.
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeCategory === category.id ? "bg-slate-700" : "bg-slate-200"
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Active Category Display */}
          {TEMPLATE_CATEGORIES.map((category) => (
            activeCategory === category.id && (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-8 items-center"
              >
                {/* Visual Preview Placeholder */}
                <div className={`relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br ${category.color} p-8`}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  <div className="relative h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="h-12 bg-slate-100 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 p-6 grid grid-cols-2 gap-4">
                      <div className="bg-slate-100 rounded-xl" />
                      <div className="bg-slate-100 rounded-xl" />
                      <div className="col-span-2 bg-slate-100 rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Category Details */}
                <div className="space-y-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} text-white`}>
                    <category.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{category.name}</h3>
                    <p className="text-slate-600 mt-2">{category.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {category.templates.slice(0, 6).map((template, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {template}
                      </div>
                    ))}
                  </div>
                  <Link href={`${APP_URL}/signup`}>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold">
                      Explore {category.name} Templates
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )
          ))}
        </div>
      </section>

      {/* Easy Setup Features */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/70">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Easy Design Setup
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              From template to live store in under 5 minutes
            </h2>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
              We have removed the complexity from storefront design. No coding, no designers needed. 
              Just pick, customize, and publish.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SETUP_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 lg:p-16 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to launch your storefront?
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
              Browse available templates, pick the one that fits your business, 
              and go live in minutes. Start free, upgrade when you are ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={`${APP_URL}/signup`}>
                <Button className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 rounded-xl text-base font-semibold h-auto">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
