"use client";

import { OpsSidebar } from "./OpsSidebar";
import { CommandMenu } from "./CommandMenu";
import { CriticalAlertsPanel } from "./ops/CriticalAlertsPanel";
import { ImpersonationBanner } from "./ops/ImpersonationBanner";
import { MagnifyingGlass as Search, Bell } from "@phosphor-icons/react/ssr";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vayva/ui";

interface OpsUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function OpsShell({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [density, setDensity] = useState<"relaxed" | "compact">("relaxed");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<OpsUser | null>(null);
  const [alertsPanelOpen, setAlertsPanelOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  // Load density from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const savedDensity = localStorage.getItem("ops-table-density") as "relaxed" | "compact";
    const savedCollapsed = localStorage.getItem("ops-sidebar-collapsed") === "true";
    queueMicrotask(() => {
      if (savedDensity) {
        setDensity(savedDensity);
      }
      setIsCollapsed(savedCollapsed);
      setMounted(true);
    });
  }, []);

  // Fetch current user identity in background
  useEffect(() => {
    fetch("/api/ops/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Silently fail - user will see generic initials
      });
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("ops-sidebar-collapsed", String(newState));
  };

  const toggleDensity = () => {
    const next = density === "relaxed" ? "compact" : "relaxed";
    setDensity(next);
    localStorage.setItem("ops-table-density", next);
  };

  // Generate initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 transition-all duration-300 ${isCollapsed ? "pl-20" : "pl-64"} ${density === "compact" ? "ops-density-compact" : ""}`}
    >
      <OpsSidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <CommandMenu />
      <CriticalAlertsPanel
        isOpen={alertsPanelOpen}
        onClose={() => setAlertsPanelOpen(false)}
        onUnreadCountChange={setUnreadAlertsCount}
      />

      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="w-96 relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const q = (form.elements.namedItem("q") as HTMLInputElement)?.value;
              if (!q) return;

              // Simple heuristic routing
              if (
                q.startsWith("ord_") ||
                q.startsWith("#") ||
                !isNaN(Number(q))
              ) {
                router.push(`/ops/orders?q=${encodeURIComponent(q)}`);
              } else if (q.includes("trk_") || q.startsWith("KWIK")) {
                router.push(`/ops/deliveries?q=${encodeURIComponent(q)}`);
              } else {
                router.push(`/ops/merchants?q=${encodeURIComponent(q)}`);
              }
            }}
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              name="q"
              placeholder="Search merchants, orders (ord_...), tracking..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </form>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={toggleDensity}
            className="text-xs font-bold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors uppercase h-auto"
            aria-label={mounted ? `Switch to ${density === "relaxed" ? "Compact" : "Relaxed"} View` : "Switch view density"}
            suppressHydrationWarning
          >
            <span suppressHydrationWarning>{mounted ? density : "relaxed"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAlertsPanelOpen(true)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black relative"
            aria-label="View critical alerts"
          >
            <Bell size={18} />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
          <div
            className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
            title={user ? `${user.name} (${user.role})` : "Loading..."}
          >
            {user ? getInitials(user.name) : "..."}
          </div>
        </div>
      </header>

      <main className="p-8 pb-20">{children}</main>
      
      <ImpersonationBanner />
    </div>
  );
}
