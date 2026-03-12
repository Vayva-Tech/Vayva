"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  SquaresFour as LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  ShieldWarning as ShieldAlert,
  Gear as Settings,
  Truck,
  MagnifyingGlass as Search,
  Lifebuoy as LifeBuoy,
  Lightning as Zap,
  Brain,
  FileText,
  Pulse as Activity,
  Chat as MessageSquare,
  Robot,
  Shield,
  ClockCounterClockwise as History,
  Terminal,
  ToggleLeft,
  Ticket,
  Package,
} from "@phosphor-icons/react/ssr";

interface SearchResult {
  url: string;
  label: string;
  type: string;
  subLabel: string;
}

export function CommandMenu(): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);

  // Debounce Search
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/ops/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.results) setSearchResults(json.results);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 p-0"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
    >
      <div className="flex items-center border-b border-gray-100 px-4">
        <Search className="mr-2 h-5 w-5 shrink-0 text-gray-400" />
        <Command.Input
          placeholder="Type a command or search..."
          value={query}
          onValueChange={setQuery}
          className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
        <Command.Empty className="py-6 text-center text-sm text-gray-500">
          No results found.
        </Command.Empty>

        <Command.Group
          heading="Navigation"
          className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase"
        >
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops"))}
            icon={LayoutDashboard}
          >
            Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/merchants"))}
            icon={Users}
          >
            Merchants
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/orders"))}
            icon={ShoppingBag}
          >
            Orders
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/deliveries"))}
            icon={Truck}
          >
            Deliveries
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/ops/financials/subscriptions"))
            }
            icon={CreditCard}
          >
            Billing Monitor
          </CommandItem>
        </Command.Group>

        <Command.Group heading="Platform Admin">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/admin/team"))}
            icon={Shield}
          >
            Team Management
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/admin/audit"))}
            icon={History}
          >
            System Audit
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/admin/system"))}
            icon={Terminal}
          >
            Environment
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/admin/feature-flags"))}
            icon={ToggleLeft}
          >
            Feature Flags
          </CommandItem>
        </Command.Group>

        <Command.Group
          heading="Tools & Settings"
          className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase mt-2"
        >
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/rescue"))}
            icon={ShieldAlert}
          >
            Rescue Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/tools"))}
            icon={Settings}
          >
            System Tools
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/support"))}
            icon={LifeBuoy}
          >
            Support Center
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/support/tickets"))}
            icon={Ticket}
          >
            All Support Tickets
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/ai"))}
            icon={Brain}
          >
            AI Intelligence
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/approvals"))}
            icon={FileText}
          >
            Approval Center
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/payouts"))}
            icon={CreditCard}
          >
            Payouts Operation
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/ops/communications"))
            }
            icon={MessageSquare}
          >
            Communications Logs
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/webhooks"))}
            icon={Activity}
          >
            WebhookLogo as Webhook Inspector
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/ops/security/sessions"))
            }
            icon={ShieldAlert}
          >
            Session Manager
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/ai/quality"))}
            icon={Robot}
          >
            AI Quality Lab
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/ops/marketplace"))}
            icon={ShoppingBag}
          >
            Marketplace Manager
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/ops/growth/campaigns"))
            }
            icon={Zap}
          >
            Campaign Monitor
          </CommandItem>
        </Command.Group>

        {searchResults.length > 0 && (
          <Command.Group
            heading="Search Results"
            className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase mt-2"
          >
            {searchResults.map((res, i) => (
              <CommandItem
                key={i}
                onSelect={() => runCommand(() => router.push(res.url))}
                icon={Search}
              >
                <div className="flex flex-col">
                  <span>{res.label}</span>
                  <span className="text-[10px] text-gray-400 capitalize">
                    {res.type} • {res.subLabel}
                  </span>
                </div>
              </CommandItem>
            ))}
          </Command.Group>
        )}
      </Command.List>

      <div className="border-t border-gray-100 py-2 px-4 text-xs text-gray-400 flex justify-between">
        <span>Use ↑↓ to navigate</span>
        <span>ESC to close</span>
      </div>
    </Command.Dialog>
  );
}

function CommandItem({
  children,
  onSelect,
  icon: Icon,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon: React.ElementType;
}): React.JSX.Element {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center px-4 py-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors aria-selected:bg-gray-100 aria-selected:text-gray-900"
    >
      <Icon className="mr-3 h-4 w-4 text-gray-500" />
      {children}
    </Command.Item>
  );
}

// Global styles for cmdk (if needed, but inline classes usually sufficient)
// cmdk uses data attributes for styling
