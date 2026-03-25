"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@vayva/ui";

const FULFILLMENT_TABS = [
  { label: "Shipments", href: "/dashboard/fulfillment/shipments" },
  { label: "Pickups", href: "/dashboard/fulfillment/pickups" },
  { label: "Issues", href: "/dashboard/fulfillment/issues" },
];

export default function FulfillmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";

  return (
    <div className="space-y-4">
      <nav
        className="flex items-center gap-1 border-b border-gray-100 pb-0"
        aria-label="Fulfillment sections"
      >
        {FULFILLMENT_TABS.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-green-500 text-gray-900"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-200",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
