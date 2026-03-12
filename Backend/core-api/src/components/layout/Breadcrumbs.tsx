"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRight as ChevronRight } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  customers: "Customers",
  finance: "Finance",
  wallet: "Wallet",
  transactions: "Transactions",
  payouts: "Payouts",
  billing: "Billing",
  settings: "Settings",
  profile: "Profile",
  store: "Store",
  team: "Team",
  shipping: "Shipping",
  payments: "Payments",
  marketing: "Marketing",
  storefront: "Storefront",
  autopilot: "Autopilot",
  extensions: "Extensions",
  analytics: "Analytics",
  seo: "SEO",
  roles: "Roles",
  security: "Security",
  notifications: "Notifications",
  integrations: "Integrations",
  whatsapp: "WhatsApp",
  policies: "Policies",
  industry: "Industry",
  kyc: "KYC",
  fulfillment: "Fulfillment",
  shipments: "Shipments",
  pickups: "Pickups",
  issues: "Issues",
  discounts: "Discounts",
  affiliates: "Affiliates",
  bundles: "Bundles",
  "flash-sales": "Flash Sales",
  "control-center": "Control Center",
  customize: "Customize",
  "payment-success": "Payment Success",
  "ai-agent": "AI Agent",
  channels: "Channels",
  "wa-agent": "WhatsApp Agent",
  support: "Support",
  inbox: "Inbox",
  posts: "Content",
  socials: "Socials",
  blog: "Blog",
  bookings: "Bookings",
  campaigns: "Campaigns",
  courses: "Courses",
  enrollments: "Enrollments",
  events: "Events",
  "check-in": "Check-In",
  "menu-items": "Menu Items",
  kitchen: "Kitchen",
  services: "Services",
  "digital-assets": "Digital Assets",
  properties: "Properties",
  viewings: "Viewings",
  vehicles: "Vehicles",
  leads: "Leads",
  stays: "Stays",
  "wholesale-catalog": "Wholesale Catalog",
  quotes: "Quotes",
  nightlife: "Nightlife",
  reservations: "Reservations",
  tickets: "Tickets",
  projects: "Projects",
  "ops-console": "Ops Console",
  domains: "Domains",
  editor: "Editor",
  "creative-editor": "Creative Editor",
  templates: "Templates",
  sites: "Sites",
  publish: "Publish",
  inventory: "Inventory",
  logistics: "Logistics",
  listings: "Listings",
  appeals: "Appeals",
  approvals: "Approvals",
  automations: "Automations",
  "setup-checklist": "Setup Checklist",
  developer: "Developer",
  apps: "Apps",
  reports: "Reports",
  reviews: "Reviews",
  referrals: "Referrals",
  account: "Account",
  edit: "Edit",
  new: "New",
  insights: "Insights",
  collections: "Collections",
  catalog: "Catalog",
  overview: "Overview",
  activity: "Activity",
  "audit-log": "Audit Log",
  "store-policies": "Store Policies",
  subscription: "Subscription",
};

function formatSegment(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip dynamic segments like [id]
    if (segment.startsWith("[") || segment.match(/^[a-f0-9-]{20,}$/)) {
      continue;
    }

    const isLast = i === segments.length - 1;
    crumbs.push({
      label: formatSegment(segment),
      href: isLast ? undefined : currentPath,
    });
  }

  return crumbs;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const crumbs = items || generateBreadcrumbs(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <ol className="flex items-center gap-1">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 text-text-tertiary shrink-0"
                aria-hidden="true"
              />
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className="text-text-primary font-medium"
                aria-current="page"
              >
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
