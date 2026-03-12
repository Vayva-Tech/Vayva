"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@vayva/ui";

function HomeIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ChevronRightIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  ops: "Dashboard",
  merchants: "Merchants",
  "onboarding": "Onboarding",
  kyc: "KYC Queue",
  subscriptions: "Subscriptions",
  payouts: "Payouts",
  industries: "Industries",
  analytics: "Analytics",
  health: "System Health",
  alerts: "Alerts",
  marketplace: "Marketplace",
  listings: "Listings",
  sellers: "Sellers",
  categories: "Categories",
  orders: "Orders",
  payments: "Payments",
  deliveries: "Deliveries",
  webhooks: "Webhooks",
  inbox: "Support Inbox",
  disputes: "Disputes",
  refunds: "Refunds",
  audit: "Audit Log",
  security: "Security Center",
  risk: "Risk Flags",
  rescue: "Rescue Console",
  users: "Ops Team",
  tools: "System Tools",
  settings: "Settings",
  approvals: "Approvals",
  communications: "Communications",
  financials: "Financials",
  growth: "Growth",
  logistics: "Logistics",
  partners: "Partners",
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: "Ops", href: "/ops" }];

  let currentPath = "";
  for (const segment of segments.slice(1)) {
    // Skip UUIDs and numeric IDs
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
      continue;
    }
    if (/^\d+$/.test(segment)) {
      continue;
    }

    currentPath += `/${segment}`;
    const label = SEGMENT_LABELS[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

    crumbs.push({
      label,
      href: `/ops${currentPath}`,
    });
  }

  return crumbs;
}

interface OpsBreadcrumbsProps {
  className?: string;
}

export function OpsBreadcrumbs({ className }: OpsBreadcrumbsProps): React.JSX.Element | null {
  const pathname = usePathname();
  const crumbs = generateBreadcrumbs(pathname);

  // Don't show breadcrumbs on dashboard root
  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm", className)}
    >
      <Link
        href="/ops"
        className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HomeIcon size={14} />
      </Link>

      {crumbs.slice(1).map((crumb, index, array) => (
        <React.Fragment key={crumb.label}>
          <ChevronRightIcon size={14} className="text-gray-300" />
          {index === array.length - 1 || !crumb.href ? (
            <span className="font-medium text-gray-900" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
