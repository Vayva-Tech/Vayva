// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Icon, Input } from "@vayva/ui";

interface OpsShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

const NAV_ITEMS = [
  { name: "Merchants", path: "/ops/merchants", icon: "Store" },
  { name: "Moderation", path: "/ops/moderation", icon: "Gavel" },
  { name: "Disputes", path: "/ops/disputes", icon: "AlertTriangle" },
  { name: "Payouts", path: "/ops/payouts", icon: "CreditCard" },
  { name: "Compliance", path: "/ops/compliance", icon: "Shield" },
  { name: "Support", path: "/ops/support", icon: "Headphones" },
];

export function OpsShell({
  children,
  title,
  description,
  actions,
}: OpsShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#142210] flex text-white font-sans selection:bg-red-500/30">
      {/* Sidebar */}
      <aside className="w-[300px] border-r border-white/5 flex flex-col fixed inset-y-0 bg-[#0b141a]/95  z-50">
        <div className="h-[72px] flex items-center px-6 border-b border-white/5 gap-3">
          <div className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center font-bold border border-red-500/30">
            O
          </div>
          <span className="font-bold text-lg tracking-tight">Vayva Ops</span>
          <span className="ml-auto px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider">
            Prod
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive ? "bg-white text-white" : "text-gray-500 hover:text-white hover:bg-white"}
                                `}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    className={isActive ? "text-white" : "text-gray-500"}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold truncate">John Doe</div>
              <div className="text-xs text-gray-500 truncate">
                Senior Risk Analyst
              </div>
            </div>
            <Icon
              name="LogOut"
              size={18}
              className="text-gray-500 hover:text-white cursor-pointer"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[300px] min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-[72px] border-b border-white/5 bg-[#142210]/90 backdrop-blur sticky top-0 z-40 px-8 flex items-center justify-between gap-8">
          {/* Search */}
          <div className="flex-1 max-w-2xl relative">
            <Icon
              name="Search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <Input className="w-full bg-white border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-gray-500 transition-all"
              type="search"
              aria-label="Search merchant, order ID, or transaction reference"
              placeholder="Search merchant, order ID, transaction reference..."
            />
            <div className="absolute right-2 top-1.5 flex gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-white/10 text-[10px] font-mono text-gray-500">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-white/10 text-[10px] font-mono text-gray-500">
                K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-white relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <Icon name="Bell" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] w-full mx-auto">
          {(title || description || actions) && (
            <div className="flex justify-between items-start mb-8">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-500">{description}</p>
                )}
              </div>
              {actions && <div className="flex gap-3">{actions}</div>}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
