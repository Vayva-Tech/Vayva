"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Icon } from "@vayva/ui";

declare global {
  interface Window {
    triggerCommandPalette?: () => void;
  }
}

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  path: string;
  section: string;
}

const commands: CommandItem[] = [
  { id: "new-product", label: "New Product", icon: "PlusCircle", path: "/dashboard/products/new", section: "Quick Actions" },
  { id: "new-order", label: "New Order", icon: "ShoppingCart", path: "/dashboard/orders/new", section: "Quick Actions" },
  { id: "home", label: "Dashboard Home", icon: "LayoutDashboard", path: "/dashboard", section: "Navigation" },
  { id: "orders", label: "Orders", icon: "ShoppingBag", path: "/dashboard/orders", section: "Navigation" },
  { id: "products", label: "Products", icon: "Package", path: "/dashboard/catalog/products", section: "Navigation" },
  { id: "collections", label: "Collections", icon: "Folder", path: "/dashboard/catalog/collections", section: "Navigation" },
  { id: "customers", label: "Customers", icon: "Users", path: "/dashboard/customers", section: "Navigation" },
  { id: "analytics", label: "Analytics", icon: "BarChart3", path: "/dashboard/analytics", section: "Navigation" },
  { id: "transactions", label: "Transactions", icon: "CreditCard", path: "/dashboard/finance/transactions", section: "Finance" },
  { id: "payouts", label: "Payouts", icon: "Banknote", path: "/dashboard/finance/payouts", section: "Finance" },
  { id: "billing", label: "Billing", icon: "Receipt", path: "/dashboard/billing", section: "Finance" },
  { id: "campaigns", label: "Campaigns", icon: "Megaphone", path: "/dashboard/marketing/campaigns", section: "Marketing" },
  { id: "bundles", label: "Bundles", icon: "Gift", path: "/dashboard/marketing/bundles", section: "Marketing" },
  { id: "coupons", label: "Coupons", icon: "Ticket", path: "/dashboard/marketing/coupons", section: "Marketing" },
  { id: "control-center", label: "Control Center", icon: "Store", path: "/dashboard/control-center", section: "Storefront" },
  { id: "templates", label: "Templates", icon: "Layout", path: "/dashboard/templates", section: "Storefront" },
  { id: "seo", label: "SEO Settings", icon: "Search", path: "/dashboard/settings/seo", section: "Storefront" },
  { id: "account", label: "Account", icon: "User", path: "/dashboard/account", section: "Settings" },
  { id: "security", label: "Security", icon: "Shield", path: "/dashboard/settings/security", section: "Settings" },
  { id: "kyc", label: "KYC Verification", icon: "BadgeCheck", path: "/dashboard/settings/kyc", section: "Settings" },
  { id: "team", label: "Team Members", icon: "Users", path: "/dashboard/settings/team", section: "Settings" },
  { id: "integrations", label: "Integrations", icon: "Plug", path: "/dashboard/settings/integrations", section: "Settings" },
  { id: "audit-log", label: "Audit Log", icon: "ClipboardList", path: "/dashboard/settings/audit-log", section: "Settings" },
  { id: "calendar", label: "Calendar", icon: "Calendar", path: "/dashboard/calendar", section: "Tools" },
  { id: "inbox", label: "Inbox", icon: "Inbox", path: "/dashboard/inbox", section: "Tools" },
  { id: "support", label: "Support", icon: "LifeBuoy", path: "/dashboard/support", section: "Tools" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.triggerCommandPalette = () => setOpen((prev) => !prev);

    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
      delete window.triggerCommandPalette;
    };
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    setSearch("");
    router.push(path);
  }, [router]);

  const grouped = commands.reduce((acc: Record<string, CommandItem[]>, cmd) => {
    if (!acc[cmd.section]) acc[cmd.section] = [];
    acc[cmd.section].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const filtered = search
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(search.toLowerCase()) ||
          cmd.section.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  const filteredGrouped = search
    ? filtered.reduce((acc: Record<string, CommandItem[]>, cmd) => {
        if (!acc[cmd.section]) acc[cmd.section] = [];
        acc[cmd.section].push(cmd);
        return acc;
      }, {} as Record<string, CommandItem[]>)
    : grouped;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/40 "
        onClick={() => setOpen(false)}
      />
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-[640px] px-4">
        <Command
          className="bg-white  rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
          loop
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            <Icon name="Search" size={20} className="text-gray-400" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-base"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs font-mono bg-gray-50 border border-gray-100 rounded text-gray-400">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <Icon name="SearchX" size={32} className="opacity-50" />
                <p>No results found for &quot;{search}&quot;</p>
              </div>
            </Command.Empty>

            {Object.entries(filteredGrouped).map(([section, items]) =>
              items.length > 0 ? (
                <Command.Group
                  key={section}
                  heading={section}
                  className="px-2 py-2"
                >
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 py-1.5 mb-1">
                    {section}
                  </div>
                  {items.map((item: CommandItem) => (
                    <Command.Item
                      key={item.id}
                      onSelect={() => handleSelect(item.path)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 data-[selected=true]:bg-green-50 data-[selected=true]:text-green-700"
                    >
                      {item.icon && (
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                          <Icon name={item.icon} size={18} className="text-gray-500" />
                        </div>
                      )}
                      <span className="flex-1 text-sm font-medium text-gray-900">
                        {item.label}
                      </span>
                      {item.shortcut && (
                        <kbd className="px-2 py-0.5 text-xs font-mono bg-gray-50 border border-gray-100 rounded text-gray-400">
                          {item.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null
            )}
          </Command.List>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono bg-gray-50 border border-gray-100 rounded">
                  ↑↓
                </kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono bg-gray-50 border border-gray-100 rounded">
                  Enter
                </kbd>
                to select
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {filtered.length} commands
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
