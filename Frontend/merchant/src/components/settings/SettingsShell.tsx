"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, cn } from "@vayva/ui";
import { PageShell } from "@/components/layout/PageShell";

type SettingsLink = {
  label: string;
  href: string;
  icon: string;
};

const SETTINGS_LINKS: SettingsLink[] = [
  {
    label: "Overview",
    href: "/dashboard/settings/overview",
    icon: "LayoutGrid",
  },
  { label: "Profile", href: "/dashboard/settings/profile", icon: "User" },
  { label: "Store", href: "/dashboard/settings/store", icon: "Store" },
  {
    label: "Payments",
    href: "/dashboard/settings/payments",
    icon: "CreditCard",
  },
  { label: "Billing", href: "/dashboard/billing", icon: "Receipt" },
  {
    label: "Subscription",
    href: "/dashboard/settings/subscription",
    icon: "Sparkles",
  },
  { label: "Team", href: "/dashboard/settings/team", icon: "Users" },
  { label: "Roles", href: "/dashboard/settings/roles", icon: "KeyRound" },
  { label: "Security", href: "/dashboard/settings/security", icon: "Shield" },
  {
    label: "Audit Log",
    href: "/dashboard/settings/audit-log",
    icon: "FileSearch",
  },
  { label: "Activity", href: "/dashboard/settings/activity", icon: "Activity" },
  {
    label: "Notifications",
    href: "/dashboard/settings/notifications",
    icon: "Bell",
  },
  {
    label: "Integrations",
    href: "/dashboard/settings/integrations",
    icon: "Plug",
  },
  {
    label: "WhatsApp",
    href: "/dashboard/settings/whatsapp",
    icon: "MessageSquare",
  },
  { label: "AI Agent", href: "/dashboard/settings/ai-agent", icon: "Bot" },
  { label: "KYC", href: "/dashboard/settings/kyc", icon: "ShieldCheck" },
  { label: "Shipping", href: "/dashboard/settings/shipping", icon: "Truck" },
  { label: "SEO", href: "/dashboard/settings/seo", icon: "Search" },
  {
    label: "Industry",
    href: "/dashboard/settings/industry",
    icon: "Briefcase",
  },
  {
    label: "Policies",
    href: "/dashboard/settings/store-policies",
    icon: "ScrollText",
  },
];

interface SettingsShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function SettingsShell({
  title,
  description,
  actions,
  children,
}: SettingsShellProps) {
  const pathname = usePathname() ?? "";

  return (
    <PageShell title={title} description={description} actions={actions}>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="rounded-2xl border border-gray-100 bg-white p-2 h-fit">
          <nav className="space-y-1">
            {SETTINGS_LINKS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard/settings/overview" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-500/10 text-gray-900"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Icon name={item.icon} size={16} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="space-y-6">{children}</section>
      </div>
    </PageShell>
  );
}
