"use client";
import { Button } from "@vayva/ui";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  CreditCard,
  Wallet,
  Truck,
  Bell,
  Shield,
  Users,
  Puzzle,
  Search,
  MessageCircle,
  ChevronRight,
  Settings,
} from "lucide-react";

const settingsCategories = [
  {
    id: "profile",
    title: "Profile & Store",
    description: "Business name, logo, contact info",
    icon: User,
    href: "/dashboard/settings/profile",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "billing",
    title: "Billing & Plans",
    description: "Subscription, invoices, credits",
    icon: CreditCard,
    href: "/dashboard/settings/billing",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: "payments",
    title: "Payments",
    description: "Payment methods, payout accounts",
    icon: Wallet,
    href: "/dashboard/settings/payments",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    id: "shipping",
    title: "Shipping",
    description: "Shipping rates, zones, carriers",
    icon: Truck,
    href: "/dashboard/settings/shipping",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Email, push, WhatsApp alerts",
    icon: Bell,
    href: "/dashboard/settings/notifications",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    id: "security",
    title: "Security",
    description: "Password, 2FA, sessions",
    icon: Shield,
    href: "/dashboard/settings/security",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    id: "team",
    title: "Team",
    description: "Invite members, manage roles",
    icon: Users,
    href: "/dashboard/settings/team",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Third-party connections",
    icon: Puzzle,
    href: "/dashboard/settings/integrations",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    id: "seo",
    title: "SEO",
    description: "Meta tags, sitemap, social previews",
    icon: Search,
    href: "/dashboard/settings/seo",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "AI agent, auto-replies",
    icon: MessageCircle,
    href: "/dashboard/settings/whatsapp",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = settingsCategories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
          <Settings className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your store, account, and business preferences
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
        />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-xl ${category.iconBg} ${category.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {category.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No settings match &quot;{searchQuery}&quot;
          </p>
          <Button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}

