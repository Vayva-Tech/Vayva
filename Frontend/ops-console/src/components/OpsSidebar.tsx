"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@vayva/ui";
import { DollarSign, LayoutDashboard, MessageSquare, Scale, Shield, Truck, Users, Receipt, MessageCircle, FileText, BarChart, Gavel, TrendingUp, Accessibility } from "lucide-react";

function WalletIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function ZapIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ChevronLeftIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function BadgeCheckIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function StoreIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 3v18" />
    </svg>
  );
}

function CreditCardIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" fill="none" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BellIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ActivityIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function GlobeIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChartBarIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="12" y1="10" x2="18" y2="16" />
      <line x1="12" y1="10" x2="6" y2="16" />
    </svg>
  );
}

function SettingsIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function TerminalIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function LogOutIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarSection {
  header: string;
  items: SidebarItem[];
}

const MENU_ITEMS: SidebarSection[] = [
  {
    header: "Command Center",
    items: [
      { label: "Dashboard", href: "/ops", icon: LayoutDashboard },
      { label: "Platform Analytics", href: "/ops/analytics", icon: BarChart },
      { label: "System Health", href: "/ops/health", icon: ActivityIcon },
      { label: "Alerts & Incidents", href: "/ops/alerts", icon: BellIcon },
    ],
  },
  {
    header: "Merchant Admin",
    items: [
      { label: "All Merchants", href: "/ops/merchants", icon: StoreIcon },
      { label: "Onboarding", href: "/ops/onboarding", icon: Users },
      { label: "KYC Queue", href: "/ops/kyc", icon: BadgeCheckIcon },
      { label: "Subscriptions", href: "/ops/subscriptions", icon: CreditCardIcon },
      { label: "Payouts", href: "/ops/payouts", icon: WalletIcon },
      { label: "Industry Breakdown", href: "/ops/industries", icon: GlobeIcon },
    ],
  },
  // HIDDEN: Marketplace section - not launching yet
  // {
  //   header: "Marketplace",
  //   items: [
  //     {
  //       label: "Listings Moderation",
  //       href: "/ops/marketplace/listings",
  //       icon: Package,
  //     },
  //     {
  //       label: "Seller Verification",
  //       href: "/ops/marketplace/sellers",
  //       icon: BadgeCheck,
  //     },
  //     {
  //       label: "Categories",
  //       href: "/ops/marketplace/categories",
  //       icon: FileText,
  //     },
  //     {
  //       label: "Templates & Apps",
  //       href: "/ops/marketplace",
  //       icon: ShoppingBag,
  //     },
  //   ],
  // },
  {
    header: "Transactions",
    items: [
      { label: "Orders", href: "/ops/orders", icon: Receipt },
      { label: "Payments", href: "/ops/payments", icon: DollarSign },
      { label: "Wallet Funding", href: "/ops/payments/wallet-funding", icon: WalletIcon },
      { label: "Paystack Events", href: "/ops/payments/paystack-webhooks", icon: ZapIcon },
      { label: "Deliveries", href: "/ops/deliveries", icon: Truck },
      { label: "Webhooks", href: "/ops/webhooks", icon: ZapIcon },
    ],
  },
  {
    header: "Support & Disputes",
    items: [
      { label: "Support Inbox", href: "/ops/inbox", icon: MessageSquare },
      { label: "Disputes", href: "/ops/disputes", icon: Scale },
      { label: "Refund Requests", href: "/ops/refunds", icon: DollarSign },
    ],
  },
  {
    header: "Governance & Security",
    items: [
      { label: "Audit Log", href: "/ops/audit", icon: FileText },
      { label: "Security Center", href: "/ops/security", icon: Shield },
      { label: "Risk Flags", href: "/ops/risk", icon: AlertTriangleIcon },
    ],
  },
  {
    header: "Compliance",
    items: [
      { label: "Subprocessors", href: "/admin/subprocessors", icon: Gavel },
      { label: "Cookie Analytics", href: "/analytics/cookie-consent", icon: TrendingUp },
      { label: "Accessibility Issues", href: "/support/accessibility", icon: Accessibility },
    ],
  },
  {
    header: "Emergency",
    items: [
      { label: "Rescue Console", href: "/ops/rescue", icon: AlertTriangleIcon },
    ],
  },
  {
    header: "Administration",
    items: [
      { label: "Ops Team", href: "/ops/users", icon: Users },
      { label: "System Tools", href: "/ops/tools", icon: TerminalIcon },
      { label: "Settings", href: "/ops/settings", icon: SettingsIcon },
    ],
  },
];

interface OpsSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function OpsSidebar({
  isCollapsed,
  onToggle,
}: OpsSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-64"} bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 overflow-hidden`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2">
            <img
              src="/vayva-logo-official.svg"
              alt="Vayva Ops"
              width={28}
              height={28}
              className="object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm tracking-tight text-gray-900">
                Vayva Ops
              </span>
              <span className="text-[10px] font-bold text-white bg-black px-1.5 py-0.5 rounded w-fit mt-0.5">
                ADMIN
              </span>
            </div>
          </div>
        )}
        <Button
          onClick={onToggle}
          variant="ghost"
          size="icon"
          className={`rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors ${isCollapsed ? "mx-auto" : ""}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-hidden hover:overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {MENU_ITEMS.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 whitespace-nowrap">
                {section.header}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item: any) => {
                const isActive =
                  mounted &&
                  (pathname === item.href ||
                    (item.href !== "/ops" && pathname.startsWith(item.href)));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : ""}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/api/ops/auth/signout"
          title={isCollapsed ? "Sign Out" : ""}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? "justify-center px-0" : ""}`}
        >
          <LogOutIcon size={18} className="shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </div>
  );
}
