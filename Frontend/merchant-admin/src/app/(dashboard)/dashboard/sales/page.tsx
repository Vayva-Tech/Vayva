"use client";

import { useState, useEffect } from "react";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { 
  Breadcrumbs, 
  HubGrid, 
  StatGrid,
  HubCardSkeleton, 
  StatCardSkeleton,
  type HubModule,
  type StatItem
} from "@/components/shared";
import {
  User,
  FileText,
  Warning,
  TrendUp,
  Target,
  Plus,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

const salesModules: HubModule[] = [
  {
    id: "leads",
    title: "Leads",
    description: "Manage sales leads and prospects",
    icon: User,
    href: "/dashboard/leads",
    color: "blue",
  },
  {
    id: "quotes",
    title: "Quotes",
    description: "Create and track price quotes",
    icon: FileText,
    href: "/dashboard/quotes",
    color: "green",
  },
  {
    id: "rescue",
    title: "Rescue",
    description: "Emergency rescue operations",
    icon: Warning,
    href: "/dashboard/rescue",
    color: "amber",
  },
];

const quickStats: StatItem[] = [
  { label: "Total Leads", value: "--", icon: Target },
  { label: "Pending Quotes", value: "--", icon: FileText },
  { label: "Active Rescue", value: "--", icon: Warning },
  { label: "Conversion Rate", value: "--%", icon: TrendUp },
];

const quickActions = [
  {
    id: "new-lead",
    label: "New Lead",
    href: "/dashboard/leads/new",
    icon: Plus,
    variant: "primary" as const,
  },
  {
    id: "create-quote",
    label: "Create Quote",
    href: "/dashboard/quotes/new",
    icon: FileText,
    variant: "secondary" as const,
  },
  {
    id: "report-incident",
    label: "Report Incident",
    href: "/dashboard/rescue/incidents",
    icon: Warning,
    variant: "warning" as const,
  },
];

export default function SalesHubPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching - replace with actual API calls
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardPageShell
      title="Sales & Operations"
      description="Manage leads, quotes, and rescue operations"
    >
      <Breadcrumbs items={[{ label: "Sales & Operations" }]} className="mb-4" />
      
      {/* Quick Stats */}
      <section className="mb-8" aria-label="Quick statistics">
        {loading ? (
          <StatCardSkeleton count={4} />
        ) : (
          <StatGrid stats={quickStats} />
        )}
      </section>

      {/* Module Cards */}
      <section className="space-y-4" aria-label="Sales modules">
        <h2 className="text-lg font-semibold text-text-primary">Sales Modules</h2>
        {loading ? (
          <HubCardSkeleton count={3} />
        ) : (
          <HubGrid modules={salesModules} columns={3} />
        )}
      </section>

      {/* Quick Actions */}
      <section className="mt-8 space-y-4" aria-label="Quick actions">
        <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
        <nav className="flex flex-wrap gap-3" aria-label="Quick action navigation">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
            const variantClasses = {
              primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
              secondary: "bg-surface-secondary text-text-primary hover:bg-surface-tertiary focus:ring-primary/50",
              warning: "bg-amber-100 text-amber-700 hover:bg-amber-200 focus:ring-amber-500",
            };
            
            return (
              <Link
                key={action.id}
                href={action.href}
                className={`${baseClasses} ${variantClasses[action.variant]}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </DashboardPageShell>
  );
}
