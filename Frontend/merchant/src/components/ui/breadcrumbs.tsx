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
import { cn } from "@vayva/ui";
import { BREADCRUMB_HIERARCHY } from "@/config/breadcrumb-hierarchy";

// ---------------------------------------------------------------------------
// Segment label map
// ---------------------------------------------------------------------------

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
  discounts: "Discounts",
  "flash-sales": "Flash Sales",
  affiliates: "Affiliates",
  transactions: "Transactions",
  payouts: "Payouts",
  statements: "Statements",
  bnpl: "BNPL",
  shipments: "Shipments",
  pickups: "Pickups",
  issues: "Issues",
  disputes: "Disputes",
  messages: "Messages",
  nightlife: "Nightlife",
  reservations: "Reservations",
  events: "Events",
  tickets: "Tickets",
  nonprofit: "Nonprofit",
  campaigns: "Campaigns",
  donations: "Donations",
  grants: "Grants",
  volunteers: "Volunteers",
  inventory: "Inventory",
  locations: "Locations",
  "control-center": "Control Center",
  customize: "Customize",
  templates: "Templates",
  properties: "Properties",
  vehicles: "Vehicles",
  leads: "Leads",
  stays: "Stays",
  bookings: "Bookings",
  services: "Services",
  courses: "Courses",
  projects: "Projects",
  portfolio: "Portfolio",
  "wholesale-catalog": "Wholesale Catalog",
  quotes: "Quotes",
  calendar: "Calendar",
  autopilot: "Autopilot",
  extensions: "Extensions",
  socials: "Socials",
  blog: "Blog",
  posts: "Content",
  reports: "Reports",
  reviews: "Reviews",
  referrals: "Referrals",
  "menu-items": "Menu Items",
  kitchen: "Kitchen",
  "digital-assets": "Digital Assets",
  domains: "Domains",
  editor: "Editor",
  sites: "Sites",
  publish: "Publish",
  logistics: "Logistics",
  listings: "Listings",
  appeals: "Appeals",
  approvals: "Approvals",
  automations: "Automations",
  "setup-checklist": "Setup Checklist",
  memberships: "Memberships",
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
};

function labelFromSegment(segment: string): string {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  // Dynamic segments like UUIDs
  if (segment.startsWith("[") || /^[a-f0-9-]{20,}$/i.test(segment))
    return "Details";
  // Title-case fallback
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Dropdown for intermediate breadcrumb segments with children
// ---------------------------------------------------------------------------

interface BreadcrumbDropdownProps {
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
}: BreadcrumbDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click
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

  // Close when the route changes
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
// Main Breadcrumbs component
// ---------------------------------------------------------------------------

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on the dashboard root
  if (segments.length <= 1) return null;
  if (segments.length === 1 && segments[0] === "dashboard") return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = labelFromSegment(segment);
    const isLast = index === segments.length - 1;
    const isFirst = index === 0;
    const hierarchy = BREADCRUMB_HIERARCHY[href];

    return { href, label, isLast, isFirst, segment, hierarchy };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-xs", className)}
    >
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {/* Separator */}
          {!crumb.isFirst && (
            <ChevronRight className="h-3 w-3 text-gray-400 shrink-0 mx-0.5" />
          )}

          {/* Home segment */}
          {crumb.isFirst ? (
            <Link
              href={crumb.href}
              className="text-gray-400 hover:text-gray-500 transition-colors flex items-center gap-1"
            >
              <Home weight="duotone" className="h-3.5 w-3.5" />
              <span className="sr-only">{crumb.label}</span>
            </Link>
          ) : /* Intermediate segment with dropdown children */
          !crumb.isLast && crumb.hierarchy ? (
            <BreadcrumbDropdown
              label={crumb.label}
              href={crumb.href}
              children={crumb.hierarchy.children}
              currentPath={pathname}
            />
          ) : /* Intermediate segment without children */
          !crumb.isLast ? (
            <Link
              href={crumb.href}
              className="text-gray-400 hover:text-gray-500 transition-colors flex items-center gap-1 truncate max-w-[150px]"
            >
              <FolderSimple weight="duotone" className="h-3.5 w-3.5 shrink-0 text-amber-500/80" />
              <span>{crumb.label}</span>
            </Link>
          ) : (
            /* Current page (last segment) */
            <span className="text-gray-900 font-medium flex items-center gap-1 truncate max-w-[200px]">
              <FileIcon weight="duotone" className="h-3.5 w-3.5 shrink-0 text-green-500" />
              <span>{crumb.label}</span>
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
