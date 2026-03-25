"use client";
import { Button } from "@vayva/ui";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Calculator,
  Plus,
  Storefront,
  Package,
  Users,
  ChartLineUp,
  Gear,
  Bell,
  Question,
  ArrowSquareOut,
  Star,
  ClockCounterClockwise,
  TrendUp,
} from "@phosphor-icons/react";
import { apiJson } from "@/lib/api-client-shared";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, Role, Permission } from "@/lib/permissions";

interface CommandAction {
  id: string;
  title: string;
  shortcut?: string;
  icon?: React.ComponentType<{ className?: string }>;
  category: string;
  action: () => void;
  permissions?: readonly Permission[];
  keywords?: string[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

interface RecentAction {
  id: string;
  title: string;
  timestamp: string;
  count: number;
}

export function EnhancedCommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [starredActions, setStarredActions] = useState<string[]>([]);
  const [personalized, setPersonalized] = useState<CommandAction[]>([]);
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || "merchant";

  // Load user preferences and recent actions
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await apiJson<{
          starred: string[];
          recent: RecentAction[];
          personalized: CommandAction[];
        }>("/api/command-palette/preferences", { method: "GET" });
        
        if (data.starred) setStarredActions(data.starred);
        if (data.recent) setRecentActions(data.recent);
        if (data.personalized) setPersonalized(data.personalized);
      } catch {
        // Use defaults if fetch fails
        const saved = localStorage.getItem("cmd-palette-starred");
        if (saved) setStarredActions(JSON.parse(saved));
      }
    };

    if (open) {
      loadPreferences();
    }
  }, [open]);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Save starred actions
  const toggleStar = useCallback((actionId: string) => {
    setStarredActions((prev) => {
      const newStarred = prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId];
      localStorage.setItem("cmd-palette-starred", JSON.stringify(newStarred));
      return newStarred;
    });
  }, []);

  // Track action usage for personalization
  const trackAction = useCallback((actionId: string) => {
    setRecentActions((prev) => {
      const existing = prev.find((a) => a.id === actionId);
      const newRecent = existing
        ? prev.map((a) =>
            a.id === actionId
              ? { ...a, count: a.count + 1, timestamp: new Date().toISOString() }
              : a
          )
        : [
            ...prev,
            {
              id: actionId,
              title: actionId,
              timestamp: new Date().toISOString(),
              count: 1,
            },
          ];
      
      // Keep only last 20
      return newRecent.slice(-20);
    });
  }, []);

  // Define all available actions
  const allActions: CommandAction[] = useMemo(() => {
    const role = (userRole as Role) || "staff";
    
    return [
      // Navigation
      {
        id: "goto-dashboard",
        title: "Go to Dashboard",
        shortcut: "G D",
        icon: Storefront,
        category: "Navigation",
        action: () => router.push("/dashboard"),
      },
      {
        id: "goto-products",
        title: "Go to Products",
        shortcut: "G P",
        icon: Package,
        category: "Navigation",
        action: () => router.push("/dashboard/products"),
        permissions: ["products:view"] as const,
      },
      {
        id: "goto-orders",
        title: "Go to Orders",
        shortcut: "G O",
        icon: Storefront,
        category: "Navigation",
        action: () => router.push("/dashboard/orders"),
        permissions: ["orders:view"] as const,
      },
      {
        id: "goto-customers",
        title: "Go to Customers",
        shortcut: "G C",
        icon: Users,
        category: "Navigation",
        action: () => router.push("/dashboard/customers"),
        permissions: ["customers:view"] as const,
      },
      {
        id: "goto-analytics",
        title: "Go to Analytics",
        shortcut: "G A",
        icon: ChartLineUp,
        category: "Navigation",
        action: () => router.push("/dashboard/analytics"),
        permissions: ["analytics:view"] as const,
      },
      {
        id: "goto-settings",
        title: "Go to Settings",
        shortcut: "G S",
        icon: Gear,
        category: "Navigation",
        action: () => router.push("/dashboard/settings"),
        permissions: ["settings:view"] as const,
      },

      // Quick Actions
      {
        id: "create-product",
        title: "Create Product",
        shortcut: "C P",
        icon: Plus,
        category: "Quick Actions",
        action: () => router.push("/dashboard/products/new"),
        permissions: ["products:create"] as const,
        keywords: ["add", "new", "product"],
      },
      {
        id: "create-order",
        title: "Create Manual Order",
        shortcut: "C O",
        icon: Plus,
        category: "Quick Actions",
        action: () => router.push("/dashboard/orders/new"),
        permissions: ["orders:manage"] as const,
        keywords: ["add", "new", "order"],
      },
      {
        id: "open-calculator",
        title: "Open Calculator",
        shortcut: "C C",
        icon: Calculator,
        category: "Quick Actions",
        action: () => window.open("/dashboard/calculator", "_blank"),
      },

      // Help
      {
        id: "help-docs",
        title: "Documentation",
        icon: Question,
        category: "Help",
        action: () => window.open("https://docs.vayva.ng", "_blank"),
      },
      {
        id: "help-support",
        title: "Contact Support",
        icon: ArrowSquareOut,
        category: "Help",
        action: () => window.open("https://support.vayva.ng", "_blank"),
      },
    ].filter((action) => {
      if (!action.permissions) return true;
      return action.permissions.some((p) => hasPermission(role, p));
    });
  }, [router, userRole]);

  // Filter actions based on search
  const filteredActions = useMemo(() => {
    if (!search) return allActions;
    
    const searchLower = search.toLowerCase();
    return allActions.filter((action) => {
      const matchesTitle = action.title.toLowerCase().includes(searchLower);
      const matchesCategory = action.category.toLowerCase().includes(searchLower);
      const matchesKeywords = action.keywords?.some((k) =>
        k.toLowerCase().includes(searchLower)
      );
      return matchesTitle || matchesCategory || matchesKeywords;
    });
  }, [allActions, search]);

  // Group actions by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};
    filteredActions.forEach((action) => {
      if (!groups[action.category]) groups[action.category] = [];
      groups[action.category].push(action);
    });
    return groups;
  }, [filteredActions]);

  // Execute action and close
  const executeAction = (action: CommandAction) => {
    trackAction(action.id);
    action.action();
    setOpen(false);
    setSearch("");
  };

  // Get frequently used actions for personalized suggestions
  const frequentActions = useMemo(() => {
    const sorted = [...recentActions].sort((a, b) => b.count - a.count);
    return sorted.slice(0, 5).map((ra) =>
      allActions.find((a) => a.id === ra.id)
    ).filter(Boolean) as CommandAction[];
  }, [recentActions, allActions]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search... (⌘K)"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Personalized: Starred */}
        {starredActions.length > 0 && !search && (
          <CommandGroup heading="Starred">
            {starredActions
              .map((id) => allActions.find((a) => a.id === id))
              .filter((a): a is CommandAction => a !== undefined)
              .map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => executeAction(action)}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  <span>{action.title}</span>
                  <Star
                    className="ml-auto h-4 w-4 fill-yellow-400 text-yellow-400"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toggleStar(action.id);
                    }}
                  />
                </CommandItem>
              ))}
          </CommandGroup>
        )}

        {/* Personalized: Frequently Used */}
        {frequentActions.length > 0 && !search && (
          <CommandGroup heading="Frequently Used">
            {frequentActions.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={() => executeAction(action)}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                <span>{action.title}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {recentActions.find((ra) => ra.id === action.id)?.count} uses
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Recent */}
        {recentActions.length > 0 && !search && (
          <CommandGroup heading="Recent">
            {recentActions
              .slice(-5)
              .reverse()
              .map((ra) => {
                const action = allActions.find((a) => a.id === ra.id);
                if (!action) return null;
                return (
                  <CommandItem
                    key={ra.id}
                    onSelect={() => executeAction(action)}
                  >
                    <ClockCounterClockwise className="mr-2 h-4 w-4" />
                    <span>{action.title}</span>
                  </CommandItem>
                );
              })}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Grouped Actions */}
        {Object.entries(groupedActions).map(([category, actions]) => (
          <CommandGroup key={category} heading={category}>
            {actions.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={() => executeAction(action)}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                <span>{action.title}</span>
                {action.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500">
                    {action.shortcut}
                  </kbd>
                )}
                <Star
                  className={`ml-2 h-4 w-4 cursor-pointer ${
                    starredActions.includes(action.id)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-500 opacity-0 hover:opacity-100"
                  }`}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    toggleStar(action.id);
                  }}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Quick Actions Panel - Shows top 4 quick actions
 */
export function QuickActionsPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || "merchant";

  const quickActions: QuickAction[] = useMemo(() => {
    const role = (userRole as Role) || "staff";
    
    const actions: (QuickAction & { permission?: Permission })[] = [
      {
        id: "new-product",
        title: "New Product",
        description: "Add a new product to your store",
        icon: Package,
        action: () => router.push("/dashboard/products/new"),
        permission: "products:create",
      },
      {
        id: "view-orders",
        title: "Orders",
        description: "Check recent orders",
        icon: Storefront,
        action: () => router.push("/dashboard/orders"),
        permission: "orders:view",
      },
      {
        id: "analytics",
        title: "Analytics",
        description: "View sales insights",
        icon: TrendUp,
        action: () => router.push("/dashboard/analytics"),
        permission: "analytics:view",
      },
      {
        id: "notifications",
        title: "Notifications",
        description: "View unread messages",
        icon: Bell,
        action: () => router.push("/dashboard/notifications"),
      },
    ];

    return actions
      .filter((a) => !a.permission || hasPermission(role, a.permission))
      .map(({ id, title, description, icon, action }) => ({
        id,
        title,
        description,
        icon,
        action,
      }));
  }, [router, userRole]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {quickActions.map((action) => (
        <Button
          key={action.id}
          onClick={action.action}
          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-100 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <action.icon className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="font-medium">{action.title}</p>
            <p className="text-xs text-gray-500">{action.description}</p>
          </div>
        </Button>
      ))}
    </div>
  );
}

