"use client";

import Link from "next/link";
import { cn } from "@vayva/ui";
import {
  CaretRight as ChevronRight,
  Storefront as Store,
  Briefcase,
  MagnifyingGlass as Search,
  Scroll as ScrollText,
  Truck,
  CreditCard,
  Receipt,
  ShieldCheck,
  Users,
  KeyReturn as KeyRound,
  Shield,
  FileMagnifyingGlass as FileSearch,
  Pulse as Activity,
  Bell,
  Plug,
  List as ListIcon,
  ChatCircleText as MessageSquare,
} from "@phosphor-icons/react/ssr";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";

type SettingsItem = {
  title: string;
  description: string;
  href: string;
  icon: string;
};

type SettingsGroup = {
  label: string;
  iconColor: string;
  items: SettingsItem[];
};

export default function SettingsOverviewPage() {
  const groups: SettingsGroup[] = [
    {
      label: "Store",
      iconColor: "bg-blue-500/10 text-blue-600",
      items: [
        {
          title: "Store Profile",
          description: "Public store name, logo, contact info, hours",
          href: "/dashboard/settings/store",
          icon: "Store",
        },
        {
          title: "Industry",
          description: "Change your industry variant and modules",
          href: "/dashboard/settings/industry",
          icon: "Briefcase",
        },
        {
          title: "SEO",
          description: "Search appearance and metadata",
          href: "/dashboard/settings/seo",
          icon: "Search",
        },
        {
          title: "Store Policies",
          description: "Refund, privacy, shipping, terms",
          href: "/dashboard/settings/store-policies",
          icon: "ScrollText",
        },
        {
          title: "Shipping",
          description: "Delivery zones and shipping preferences",
          href: "/dashboard/settings/shipping",
          icon: "Truck",
        },
      ],
    },
    {
      label: "Payments & Billing",
      iconColor: "bg-purple-500/10 text-purple-600",
      items: [
        {
          title: "Payments",
          description: "Settlement account and checkout payment methods",
          href: "/dashboard/settings/payments",
          icon: "CreditCard",
        },
        {
          title: "Billing",
          description: "Plan, invoices, and subscription management",
          href: "/dashboard/billing",
          icon: "Receipt",
        },
        {
          title: "Identity Verification (KYC)",
          description: "Verify your identity to enable payouts",
          href: "/dashboard/settings/kyc",
          icon: "ShieldCheck",
        },
      ],
    },
    {
      label: "Team & Security",
      iconColor: "bg-orange-500/10 text-orange-600",
      items: [
        {
          title: "Team",
          description: "Invite members and manage access",
          href: "/dashboard/settings/team",
          icon: "Users",
        },
        {
          title: "Roles & Permissions",
          description: "Create custom roles and permissions",
          href: "/dashboard/settings/roles",
          icon: "KeyRound",
        },
        {
          title: "Security",
          description: "Password and active sessions",
          href: "/dashboard/settings/security",
          icon: "Shield",
        },
        {
          title: "Audit Log",
          description: "Track important actions in your store",
          href: "/dashboard/settings/audit-log",
          icon: "FileSearch",
        },
        {
          title: "Activity",
          description: "Recent system activity and events",
          href: "/dashboard/settings/activity",
          icon: "Activity",
        },
      ],
    },
    {
      label: "Operations",
      iconColor: "bg-teal-500/10 text-teal-600",
      items: [
        {
          title: "Notifications",
          description: "Configure how you receive alerts",
          href: "/dashboard/settings/notifications",
          icon: "Bell",
        },
        {
          title: "Integrations",
          description: "Connect WhatsApp, payments, and logistics",
          href: "/dashboard/settings/integrations",
          icon: "Plug",
        },
        {
          title: "Mobile Navigation",
          description: "Choose and reorder your mobile bottom tabs",
          href: "/dashboard/settings/navigation",
          icon: "ListIcon",
        },
        {
          title: "WhatsApp Agent",
          description: "Connection, templates, and safety settings",
          href: "/dashboard/settings/whatsapp",
          icon: "MessageSquare",
        },
      ],
    },
  ];

  return (
    <div className="relative max-w-5xl space-y-10 pb-20">
      {/* Header */}
      <PageHeader
        title="Settings"
        subtitle="Everything that controls your store, team, and system behavior."
      />

      {/* Grouped Sections */}
      {groups.map((group, gi) => (
        <motion.section
          key={group.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.06, duration: 0.3, ease: "easeOut" }}
          className="space-y-4"
        >
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {group.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group?.items?.map((item) => (
              <Link key={item.href} href={item.href} className="block group">
                <div className="h-full rounded-[20px] border border-gray-100 bg-white  p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:border-green-500/20">
                  <div
                    className={cn("p-2.5 rounded-xl shrink-0", group.iconColor)}
                  >
                    {item.icon === "Store" && <Store size={16} />}
                    {item.icon === "Briefcase" && <Briefcase size={16} />}
                    {item.icon === "Search" && <Search size={16} />}
                    {item.icon === "ScrollText" && <ScrollText size={16} />}
                    {item.icon === "Truck" && <Truck size={16} />}
                    {item.icon === "CreditCard" && <CreditCard size={16} />}
                    {item.icon === "Receipt" && <Receipt size={16} />}
                    {item.icon === "ShieldCheck" && <ShieldCheck size={16} />}
                    {item.icon === "Users" && <Users size={16} />}
                    {item.icon === "KeyRound" && <KeyRound size={16} />}
                    {item.icon === "Shield" && <Shield size={16} />}
                    {item.icon === "FileSearch" && <FileSearch size={16} />}
                    {item.icon === "Activity" && <Activity size={16} />}
                    {item.icon === "Bell" && <Bell size={16} />}
                    {item.icon === "Plug" && <Plug size={16} />}
                    {item.icon === "ListIcon" && <ListIcon size={16} />}
                    {item.icon === "MessageSquare" && (
                      <MessageSquare size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500 shrink-0 group-hover:text-green-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
