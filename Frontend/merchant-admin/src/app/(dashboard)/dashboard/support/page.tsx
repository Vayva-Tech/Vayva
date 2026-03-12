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
  Clipboard,
  Users,
  ChatCircle,
  Ticket,
  Plus,
  Headset,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

const supportModules: HubModule[] = [
  {
    id: "tickets",
    title: "Support Tickets",
    description: "Manage customer support requests and issues",
    icon: Ticket,
    href: "/dashboard/support/messages",
    color: "blue",
  },
  {
    id: "appeals",
    title: "Appeals",
    description: "Handle disputes and customer appeals",
    icon: Clipboard,
    href: "/dashboard/appeals",
    color: "amber",
  },
  {
    id: "enrollments",
    title: "Enrollments",
    description: "Manage customer enrollments and registrations",
    icon: Users,
    href: "/dashboard/enrollments",
    color: "green",
  },
  {
    id: "whatsapp",
    title: "WhatsApp Inbox",
    description: "Customer conversations via WhatsApp",
    icon: ChatCircle,
    href: "/dashboard/settings/whatsapp",
    color: "emerald",
  },
];

const quickStats: StatItem[] = [
  { label: "Open Tickets", value: "--", icon: Ticket },
  { label: "Pending Appeals", value: "--", icon: Clipboard },
  { label: "New Enrollments", value: "--", icon: Users },
  { label: "Avg Response", value: "--m", icon: Headset },
];

const quickActions = [
  {
    id: "new-ticket",
    label: "New Ticket",
    href: "/dashboard/support/new",
    icon: Plus,
    variant: "primary" as const,
  },
  {
    id: "open-whatsapp",
    label: "Open WhatsApp",
    href: "/dashboard/settings/whatsapp",
    icon: ChatCircle,
    variant: "success" as const,
  },
  {
    id: "view-appeals",
    label: "View Appeals",
    href: "/dashboard/appeals",
    icon: Clipboard,
    variant: "secondary" as const,
  },
];

export default function SupportHubPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching - replace with actual API calls
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardPageShell
      title="Support Center"
      description="Manage tickets, appeals, enrollments, and customer communications"
    >
      <Breadcrumbs items={[{ label: "Support Center" }]} className="mb-4" />
      
      {/* Quick Stats */}
      <section className="mb-8" aria-label="Quick statistics">
        {loading ? (
          <StatCardSkeleton count={4} />
        ) : (
          <StatGrid stats={quickStats} />
        )}
      </section>

      {/* Module Cards */}
      <section className="space-y-4" aria-label="Support modules">
        <h2 className="text-lg font-semibold text-text-primary">Support Modules</h2>
        {loading ? (
          <HubCardSkeleton count={4} />
        ) : (
          <HubGrid modules={supportModules} columns={4} />
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
              primary: "bg-primary text-text-inverse hover:bg-primary/90 focus:ring-primary",
              secondary: "bg-surface-secondary text-text-primary hover:bg-surface-tertiary focus:ring-primary/50",
              success: "bg-success/20 text-success hover:bg-success/30 focus:ring-success",
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
