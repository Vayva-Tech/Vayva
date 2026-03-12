"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretRight as ChevronRight,
  House as Home,
} from "@phosphor-icons/react/ssr";
import { cn } from "@vayva/ui";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Home",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  settings: "Settings",
  overview: "Overview",
  profile: "Profile",
  store: "Store",
  billing: "Billing",
  team: "Team",
  security: "Security",
  payments: "Payments",
  shipping: "Shipping",
  notifications: "Notifications",
  integrations: "Integrations",
  whatsapp: "WhatsApp",
  seo: "SEO",
  kyc: "KYC",
  roles: "Roles",
  "audit-log": "Audit Log",
  activity: "Activity",
  "store-policies": "Store Policies",
  "ai-agent": "AI Agent",
  industry: "Industry",
  subscription: "Subscription",
  finance: "Finance",
  analytics: "Analytics",
  marketing: "Marketing",
  fulfillment: "Fulfillment",
  support: "Support",
  catalog: "Catalog",
  collections: "Collections",
  bundles: "Bundles",
  new: "New",
  edit: "Edit",
  account: "Account",
};

function labelFromSegment(segment: string): string {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  // Handle dynamic segments like [id]
  if (segment.startsWith("[") || /^[a-f0-9-]{20,}$/i.test(segment))
    return "Details";
  // Title case fallback
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on the dashboard root
  if (segments.length <= 1) return null;
  // Don't show for just /dashboard
  if (segments.length === 1 && segments[0] === "dashboard") return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = labelFromSegment(segment);
    const isLast = index === segments.length - 1;
    const isFirst = index === 0;

    return { href, label, isLast, isFirst, segment };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-xs", className)}
    >
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {!crumb.isFirst && (
            <ChevronRight className="h-3 w-3 text-text-tertiary shrink-0" />
          )}
          {crumb.isFirst ? (
            <Link
              href={crumb.href}
              className="text-text-tertiary hover:text-text-secondary transition-colors flex items-center gap-1"
            >
              <Home className="h-3 w-3" />
              <span className="sr-only">{crumb.label}</span>
            </Link>
          ) : crumb.isLast ? (
            <span className="text-text-primary font-medium truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-text-tertiary hover:text-text-secondary transition-colors truncate max-w-[150px]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
