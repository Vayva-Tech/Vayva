"use client";

import { useState, useEffect } from "react";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { 
  Breadcrumbs, 
  HubGrid, 
  SettingsCardSkeleton,
  type HubModule,
} from "@/components/shared";
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
} from "@phosphor-icons/react/ssr";

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
];

export default function SettingsHubPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching - replace with actual API calls
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardPageShell
      title="Settings"
      description="Manage your account, store, and business preferences"
    >
      <Breadcrumbs items={[{ label: "Settings" }]} className="mb-4" />
      
      {loading ? (
        <div className="space-y-8" aria-live="polite" role="status">
          <div>
            <div className="h-6 w-32 bg-border rounded mb-4" />
            <SettingsCardSkeleton count={3} />
          </div>
          <div>
            <div className="h-6 w-32 bg-border rounded mb-4" />
            <SettingsCardSkeleton count={2} />
          </div>
          <span className="sr-only">Loading settings...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {settingsGroups.map((group) => (
            <section key={group.title} aria-labelledby={`group-${group.title}`}>
              <h2 
                id={`group-${group.title}`}
                className="text-lg font-semibold text-text-primary mb-4"
              >
                {group.title}
              </h2>
              <HubGrid modules={group.items} columns={3} />
            </section>
          ))}
        </div>
      )}
    </DashboardPageShell>
  );
}
