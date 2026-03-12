"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@vayva/ui";

const MARKETING_TABS = [
  { label: "Discounts", href: "/dashboard/marketing/discounts" },
  { label: "Flash Sales", href: "/dashboard/marketing/flash-sales" },
  { label: "Bundles", href: "/dashboard/marketing/bundles" },
  { label: "Affiliates", href: "/dashboard/marketing/affiliates" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <nav
        className="flex items-center gap-1 border-b border-border/60 pb-0"
        aria-label="Marketing sections"
      >
        {MARKETING_TABS.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border",
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
