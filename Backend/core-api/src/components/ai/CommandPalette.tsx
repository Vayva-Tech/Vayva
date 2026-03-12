"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Button } from "@vayva/ui";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    // Expose trigger globally for button clicks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).triggerCommandPalette = () => setOpen((prev) => !prev);

    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).triggerCommandPalette;
    };
  }, []);

  type PaletteItem = {
    name: string;
    href: string;
    icon: string;
    shortcut?: string;
  };

  const quickActions: PaletteItem[] = [
    {
      name: "New Product",
      href: "/dashboard/products/new",
      icon: "PlusCircle",
      shortcut: "N",
    },
    {
      name: "View Orders",
      href: "/dashboard/orders",
      icon: "ShoppingBag",
      shortcut: "G O",
    },
    {
      name: "View Products",
      href: "/dashboard/products",
      icon: "Package",
      shortcut: "G P",
    },
  ];

  const navItems: PaletteItem[] = [
    { name: "Home", href: "/dashboard", icon: "LayoutDashboard" },
    { name: "Products", href: "/dashboard/products", icon: "Package" },
    { name: "Orders", href: "/dashboard/orders", icon: "ShoppingBag" },
    { name: "Customers", href: "/dashboard/customers", icon: "Users" },
    {
      name: "Settings",
      href: "/dashboard/settings/overview",
      icon: "Settings",
    },
    { name: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
    { name: "Finance", href: "/dashboard/finance", icon: "Wallet" },
    { name: "Help", href: "/dashboard/help", icon: "HelpCircle" },
  ];

  const allItems: PaletteItem[] = [...quickActions, ...navItems];
  const filteredItems = query
    ? allItems.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      )
    : allItems;

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-lg bg-background rounded-xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border/40 px-3">
          <Icon name="Search" className="mr-2 h-5 w-5 shrink-0 opacity-50" />
          <input
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            autoFocus
          />
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <kbd className="bg-white/40 px-1.5 py-0.5 rounded border border-border">
              ESC
            </kbd>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="p-4 text-center text-sm text-text-tertiary">
              No results found.
            </p>
          ) : (
            <div className="space-y-1">
              {!query && (
                <p className="px-2 py-1.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Quick Actions
                </p>
              )}
              {filteredItems.map((item) => (
                <Button
                  key={`${item.name}-${item.href}`}
                  onClick={() => handleSelect(item.href)}
                  variant="ghost"
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm text-text-secondary hover:bg-white/40 hover:text-black rounded-lg transition-colors text-left group"
                >
                  <Icon
                    name={item.icon}
                    size={16}
                    className="text-text-tertiary"
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.shortcut && (
                    <span className="text-[10px] text-text-tertiary font-mono">
                      {item.shortcut.split(" ").map((k, i) => (
                        <kbd
                          key={i}
                          className="bg-white/40 px-1 py-0.5 rounded border border-border/40 mx-0.5"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
