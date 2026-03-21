// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Icon } from "@vayva/ui";
import {
  User,
  Building,
  Users,
  Bell,
  Shield,
  CreditCard,
  FileText,
  Storefront as Store,
  Link,
  List as ListIcon,
  Truck,
  Sparkle as Sparkles,
  Desktop,
} from "@phosphor-icons/react";

const settingsGroups: { title: string; items: HubModule[] }[] = [
  {
    title: "Account & Business",
    items: [
      {
        id: "profile",
        title: "Profile",
        description: "Your personal account settings",
        icon: User,
        href: "/dashboard/settings/profile",
        color: "blue",
      },
      {
        id: "store",
        title: "Store",
        description: "Store name, branding, and policies",
        icon: Store,
        href: "/dashboard/settings/store",
        color: "green",
      },
      {
        id: "business",
        title: "Business",
        description: "Industry, KYC, and business details",
        icon: Building,
        href: "/dashboard/settings/industry",
        color: "amber",
      },
    ],
  },
  {
    title: "Team & Access",
    items: [
      {
        id: "team",
        title: "Team",
        description: "Manage team members and roles",
        icon: Users,
        href: "/dashboard/settings/team",
        color: "purple",
      },
      {
        id: "roles",
        title: "Roles",
        description: "Configure permission roles",
        icon: Shield,
        href: "/dashboard/settings/roles",
        color: "red",
      },
    ],
  },
  {
    title: "Payments & Billing",
    items: [
      {
        id: "payments",
        title: "Payments",
        description: "Payment methods and processors",
        icon: CreditCard,
        href: "/dashboard/settings/payments",
        color: "emerald",
      },
      {
        id: "billing",
        title: "Billing",
        description: "Subscription and invoices",
        icon: FileText,
        href: "/dashboard/settings/billing",
        color: "cyan",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        id: "shipping",
        title: "Shipping",
        description: "Shipping methods and rates",
        icon: Truck,
        href: "/dashboard/settings/shipping",
        color: "orange",
      },
      {
        id: "notifications",
        title: "Notifications",
        description: "Email and push notification settings",
        icon: Bell,
        href: "/dashboard/settings/notifications",
        color: "pink",
      },
      {
        id: "integrations",
        title: "Integrations",
        description: "Third-party app connections",
        icon: Link,
        href: "/dashboard/settings/integrations",
        color: "indigo",
      },
      {
        id: "navigation",
        title: "Navigation",
        description: "Customize your mobile bottom tabs",
        icon: ListIcon,
        href: "/dashboard/settings/navigation",
        color: "blue",
      },
      {
        id: "ai-agent",
        title: "AI Agent",
        description: "Configure AI assistant settings",
        icon: Sparkles,
        href: "/dashboard/settings/ai-agent",
        color: "violet",
      },
    ],
  },
  {
    title: "🧪 Beta Apps",
    items: [
      {
        id: "meal-kit",
        title: "Meal Kit Manager",
        description: "Manage meal kit subscriptions and menus",
        icon: Utensils,
        href: "/dashboard/meal-kit",
        color: "emerald",
        badge: "New",
      },
      {
        id: "desktop-app",
        title: "Desktop App",
        description: "Download for Windows & Mac (Offline mode)",
        icon: Desktop,
        href: "/dashboard/beta/desktop-app",
        color: "slate",
        badge: "Beta",
      },
    ],
  },
];

export default function SettingsHubPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching - replace with actual API calls
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account, store, and business preferences</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-8">
          {["Account & Business", "Team & Access", "Payments & Billing", "Operations"].map((group) => (
            <div key={group}>
              <div className="h-6 w-32 bg-gray-100 rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Groups */}
      {!loading && (
        <div className="space-y-8">
          {settingsGroups.map((group) => (
            <section key={group.title}>
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((module) => (
                  <a
                    key={module.id}
                    href={module.href}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        module.color === "blue" ? "bg-blue-50 text-blue-600" :
                        module.color === "green" ? "bg-green-50 text-green-600" :
                        module.color === "amber" ? "bg-amber-50 text-amber-600" :
                        module.color === "purple" ? "bg-purple-50 text-purple-600" :
                        module.color === "red" ? "bg-red-50 text-red-600" :
                        module.color === "emerald" ? "bg-green-50 text-green-600" :
                        module.color === "cyan" ? "bg-cyan-50 text-cyan-600" :
                        module.color === "orange" ? "bg-orange-50 text-orange-600" :
                        module.color === "pink" ? "bg-pink-50 text-pink-600" :
                        module.color === "indigo" ? "bg-green-50 text-green-600" :
                        module.color === "violet" ? "bg-violet-50 text-violet-600" :
                        "bg-gray-50 text-gray-600"
                      }`}>
                        {module.icon && <module.icon size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
