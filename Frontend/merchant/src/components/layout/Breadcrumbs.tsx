// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CaretDown,
  CaretRight as ChevronRight,
  File as FileIcon,
  FolderSimple,
  House as Home,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { BREADCRUMB_HIERARCHY } from "@/config/breadcrumb-hierarchy";

// ---------------------------------------------------------------------------
// Segment label map
// ---------------------------------------------------------------------------

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
  modules: "Modules",
  lessons: "Lessons",
  assignments: "Assignments",
  quizzes: "Quizzes",
  memberships: "Memberships",
  classes: "Classes",
  appointments: "Appointments",
  cases: "Cases",
  applications: "Applications",
  tools: "Tools & Modules",
  navigation: "Navigation",
  sso: "SSO",
  beauty: "Beauty",
  grocery: "Grocery",
  creative: "Creative",
  fraud: "Fraud",
  "social-hub": "Social Hub",
  "real-estate": "Real Estate",
  donations: "Donations",
  grants: "Grants",
  volunteers: "Volunteers",
  nonprofit: "Nonprofit",
  disputes: "Disputes",
  messages: "Messages",
  locations: "Locations",
  bnpl: "BNPL",
  statements: "Statements",
  calendar: "Calendar",
  portfolio: "Portfolio",
};

function formatSegment(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  if (segment.startsWith("[") || segment.match(/^[a-f0-9-]{20,}$/))
    return "Details";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Dropdown for intermediate breadcrumb segments with children
// ---------------------------------------------------------------------------

interface DropdownProps {
  label: string;
  href: string;
  children: { label: string; href: string }[];
  currentPath: string;
}

function BreadcrumbDropdown({
  label,
  href,
  children,
  currentPath,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close]);

  useEffect(() => {
    close();
  }, [currentPath, close]);

  return (
    <div ref={containerRef} className="relative flex items-center gap-0.5">
      <Link
        href={href}
        className="text-gray-400 hover:text-gray-500 transition-colors flex items-center gap-1 truncate max-w-[150px]"
      >
        <FolderSimple weight="duotone" className="h-3.5 w-3.5 shrink-0 text-amber-500/80" />
        <span>{label}</span>
      </Link>
      <button
        type="button"
        aria-label={`Show ${label} sub-pages`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "p-0.5 rounded hover:bg-gray-100 transition-colors",
          open && "bg-gray-100",
        )}
      >
        <CaretDown
          weight="bold"
          className={cn(
            "h-3 w-3 text-gray-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {children.map((child) => {
            const isActive =
              currentPath === child.href ||
              currentPath.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-gray-50 text-gray-900 font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <FileIcon
                  weight={isActive ? "duotone" : "regular"}
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-green-500" : "text-gray-400",
                  )}
                />
                {child.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb item type
// ---------------------------------------------------------------------------

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ---------------------------------------------------------------------------
// Main Breadcrumbs component
// ---------------------------------------------------------------------------

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // If explicit items are provided, render them with folder/file icons (no dropdown)
  if (items) {
    if (items.length <= 1) return null;
    return (
      <nav
        aria-label="Breadcrumb"
        className={cn("flex items-center gap-1 text-sm", className)}
      >
        <ol className="flex items-center gap-1">
          {items.map((crumb, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 text-gray-400 shrink-0 mx-0.5"
                    aria-hidden="true"
                  />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1"
                  >
                    {index === 0 ? (
                      <Home weight="duotone" className="h-3.5 w-3.5" />
                    ) : (
                      <FolderSimple weight="duotone" className="h-3.5 w-3.5 shrink-0 text-amber-500/80" />
                    )}
                    <span>{crumb.label}</span>
                  </Link>
                ) : (
                  <span
                    className="text-gray-900 font-medium flex items-center gap-1"
                    aria-current="page"
                  >
                    <FileIcon weight="duotone" className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    <span>{crumb.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Auto-generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;

  const crumbs = segments
    .map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      // Skip dynamic segments
      if (segment.startsWith("[") || segment.match(/^[a-f0-9-]{20,}$/))
        return null;
      const label = formatSegment(segment);
      const isLast = index === segments.length - 1;
      const isFirst = index === 0;
      const hierarchy = BREADCRUMB_HIERARCHY[href];
      return { href, label, isLast, isFirst, segment, hierarchy };
    })
    .filter(Boolean) as Array<{
    href: string;
    label: string;
    isLast: boolean;
    isFirst: boolean;
    segment: string;
    hierarchy: (typeof BREADCRUMB_HIERARCHY)[string] | undefined;
  }>;

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <ol className="flex items-center gap-1">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 text-gray-400 shrink-0 mx-0.5"
                aria-hidden="true"
              />
            )}

            {crumb.isFirst ? (
              <Link
                href={crumb.href}
                className="text-gray-400 hover:text-gray-500 transition-colors flex items-center gap-1"
              >
                <Home weight="duotone" className="h-3.5 w-3.5" />
                <span>{crumb.label}</span>
              </Link>
            ) : !crumb.isLast && crumb.hierarchy ? (
              <BreadcrumbDropdown
                label={crumb.label}
                href={crumb.href}
                children={crumb.hierarchy.children}
                currentPath={pathname}
              />
            ) : !crumb.isLast ? (
              <Link
                href={crumb.href}
                className="text-gray-400 hover:text-gray-500 transition-colors flex items-center gap-1 truncate max-w-[150px]"
              >
                <FolderSimple weight="duotone" className="h-3.5 w-3.5 shrink-0 text-amber-500/80" />
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <span
                className="text-gray-900 font-medium flex items-center gap-1 truncate max-w-[200px]"
                aria-current="page"
              >
                <FileIcon weight="duotone" className="h-3.5 w-3.5 shrink-0 text-green-500" />
                <span>{crumb.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
