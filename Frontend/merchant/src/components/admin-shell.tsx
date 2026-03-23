// @ts-nocheck
"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Icon, IconName, cn } from "@vayva/ui";
import {
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Eye,
  Loader2,
  Upload,
  ExternalLink,
  Search,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { NotificationBell } from "./notifications/NotificationBell";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { GlobalBanner } from "./notifications/GlobalBanner";
import { TrialBanner } from "./dashboard/TrialBanner";
import { Logo } from "./Logo";
import { SupportChat } from "./support/support-chat";
import { CommandPalette } from "./ai/CommandPalette";
import { extensionRegistry, type ExtensionManifest } from "@/lib/extensions/registry";
import { normalizeSidebarHref } from "@/lib/utils";
import { apiJson } from "@/lib/api-client-shared";
import { StatusPill } from "./wix-style/StatusPill";
import { Breadcrumbs } from "./ui/breadcrumbs";
import { getSidebar, SIDEBAR_GROUPS } from "@/config/sidebar";
import { resolveDashboardPlanTier } from "@/config/dashboard-variants";
import {
  DEFAULT_MOBILE_NAV_CONFIG,
  MOBILE_NAV_TAB_DEFINITIONS,
  normalizeMobileNavConfig,
  type MobileNavConfig,
  type MobileNavTab,
} from "@/config/mobile-nav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { IndustrySlug, SidebarGroup } from "@/lib/templates/types";
import { CreditBalanceWidget } from "./billing/CreditBalanceWidget";

const ACCOUNT_DROPDOWN_ITEMS: { name: string; href: string; icon: IconName }[] =
  [
    { name: "Account", href: "/dashboard/account", icon: "User" },
    {
      name: "Settings",
      href: "/dashboard/settings/overview",
      icon: "Settings",
    },
    {
      name: "Billing",
      href: "/dashboard/settings/billing",
      icon: "CreditCard",
    },
  ];

export interface AdminShellProps {
  children: React.ReactNode;
  _title?: string;
  _breadcrumb?: { label: string; href?: string }[];
  mode?: "admin" | "onboarding";
}

interface BootstrapResponse {
  data?: {
    merchant?: {
      industrySlug?: string;
      enabledExtensionIds?: string[];
      externalManifests?: Record<string, unknown>[];
      logoUrl?: string;
      features?: {
        socials?: { enabled: boolean };
        transactions?: { enabled: boolean };
      };
    };
    store?: {
      name?: string;
      branding?: {
        logoUrl?: string;
      };
    };
    features?: {
      socials?: { enabled: boolean };
      transactions?: { enabled: boolean };
    };
  };
  // Fallback for flat structure if API returns it that way
  merchant?: {
    industrySlug?: string;
    enabledExtensionIds?: string[];
    externalManifests?: Record<string, unknown>[];
    logoUrl?: string;
    features?: {
      socials?: { enabled: boolean };
      transactions?: { enabled: boolean };
    };
  };
  store?: {
    name?: string;
    branding?: {
      logoUrl?: string;
    };
  };
  features?: {
    socials?: { enabled: boolean };
    transactions?: { enabled: boolean };
  };
}

interface StorefrontUrlResponse {
  url: string;
}

interface StorefrontStatusResponse {
  status: "live" | "draft";
}

export const AdminShell = ({
  children,
  _title,
  _breadcrumb,
  mode = "admin",
}: AdminShellProps): React.JSX.Element => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, merchant, logout } = useAuth();
  const isPaidPlan = (() => {
    const v = String((merchant as any)?.plan || "")
      .trim()
      .toLowerCase();

    return (
      v === "starter" ||
      v === "pro" ||
      v === "growth" ||
      v === "business" ||
      v === "enterprise" ||
      v === "professional" ||
      v === "premium"
    );
  })();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  // Initialize sidebar from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vayva_sidebar_pinned");
      if (saved !== null) {
        const pinned = saved === "true";
        setIsSidebarPinned(pinned);
        setIsSidebarExpanded(pinned);
      }
    }
  }, []);

  const toggleSidebar = () => {
    const nextPinned = !isSidebarPinned;
    setIsSidebarPinned(nextPinned);
    setIsSidebarExpanded(nextPinned);
    localStorage.setItem("vayva_sidebar_pinned", String(nextPinned));
  };

  const [industrySlug, setIndustrySlug] = useState<IndustrySlug | null>(null);
  const [enabledExtensionIds, setEnabledExtensionIds] = useState<string[]>([]);
  const [_isLoadingIndustry, setIsLoadingIndustry] = useState(true);
  const [isSocialsEnabled, setIsSocialsEnabled] = useState(false);
  const [isTransactionsEnabled, setIsTransactionsEnabled] = useState(false);

  // Mobile State
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [savedMobileNavConfig] = useLocalStorage<MobileNavConfig>(
    "vayva_mobile_nav_config",
    DEFAULT_MOBILE_NAV_CONFIG,
  );
  const mobileNavConfig = normalizeMobileNavConfig(savedMobileNavConfig);

  // Sidebar notification counts
  const counts = useSidebarCounts();

  // Notification UI State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Store logic
  const [storeLink, setStoreLink] = useState<string>("");
  const [storeStatus, setStoreStatus] = useState<"live" | "draft">("draft");
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [storeDisplayName, setStoreDisplayName] = useState<string>(
    merchant?.store?.name || merchant?.businessName || "My Store",
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const bootstrap = async () => {
      try {
        const data = await apiJson<BootstrapResponse>("/api/auth/merchant/me", {
          signal: controller.signal,
        });
        const payload = data?.data || data;
        const merchantData = payload?.merchant || {};
        const storeData = payload?.store || {};
        const branding = storeData?.branding || {};

        if (typeof storeData?.name === "string" && storeData.name.trim()) {
          setStoreDisplayName(storeData.name.trim());
        }

        setIsSocialsEnabled(
          Boolean(
            payload?.features?.socials?.enabled ??
            merchantData?.features?.socials?.enabled,
          ),
        );
        setIsTransactionsEnabled(
          Boolean(
            payload?.features?.transactions?.enabled ??
            merchantData?.features?.transactions?.enabled,
          ),
        );

        if (branding.logoUrl || merchantData.logoUrl) {
          setStoreLogo(branding.logoUrl || merchantData.logoUrl || null);
        }

        setIndustrySlug(
          (merchantData.industrySlug || null) as IndustrySlug | null,
        );

        if (merchantData.enabledExtensionIds) {
          setEnabledExtensionIds(merchantData.enabledExtensionIds);
        }

        if (merchantData.externalManifests) {
          merchantData.externalManifests.forEach(
            (manifest: Record<string, unknown>) => {
              // Type guard to safely cast unknown manifest to ExtensionManifest
              const extManifest = manifest as unknown as ExtensionManifest;
              if (extManifest.id && extManifest.name) {
                extensionRegistry.register(extManifest);
              }
            },
          );
        }
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.warn("[ADMIN_SHELL_BOOTSTRAP_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setIsLoadingIndustry(false);
      }

      try {
        const data = await apiJson<StorefrontUrlResponse>(
          "/api/storefront/url",
          { signal: controller.signal },
        );
        setStoreLink(data?.url || "");
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          logger.error("[FETCH_STORE_URL_ERROR]", {
            error: _errMsg,
            app: "merchant",
          });
        }
      }

      try {
        const data = await apiJson<StorefrontStatusResponse>(
          "/api/storefront/status",
          { signal: controller.signal },
        );
        setStoreStatus(data?.status || "draft");
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          logger.error("[FETCH_STORE_STATUS_ERROR]", {
            error: _errMsg,
            app: "merchant",
          });
        }
      }
    };

    void bootstrap();
    return () => controller.abort();
  }, [merchant]);

  useEffect(() => {
    if (_isLoadingIndustry) return;
    if (
      !industrySlug &&
      !merchant?.onboardingCompleted &&
      !pathname.startsWith("/onboarding")
    ) {
      router.push("/onboarding");
    }
  }, [_isLoadingIndustry, industrySlug, pathname, router, merchant]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileMoreOpen(false);
  }, [pathname]);

  const handleVisitStore = (e: React.MouseEvent) => {
    if (!storeLink) {
      e.preventDefault();
      toast.error("Store URL not yet generated. Please complete onboarding.");
    }
  };

  const handlePublish = async () => {
    toast.info("Publishing your store...");
    setIsPublishing(true);
    try {
      await apiJson<{ success: boolean }>(
        "/api/merchant/store/publish/go-live",
        { method: "POST" },
      );

      setStoreStatus("live");
      toast.success("Published successfully!", {
        action: {
          label: "View Site",
          onClick: () => window.open(`https://${storeLink}`, "_blank"),
        },
      });
    } catch {
      toast.error("Publish failed — please try again or contact support");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = () => {
    if (storeLink) {
      window.open(storeLink, "_blank");
    } else {
      toast.error("Store link not available yet.");
    }
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "FD";
  const merchantName = merchant?.firstName || user?.firstName || "Merchant";

  const baseGroups = _isLoadingIndustry
    ? [
        {
          name: "General",
          items: [
            { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
          ],
        },
      ]
    : industrySlug
      ? getSidebar(
          industrySlug,
          enabledExtensionIds,
          resolveDashboardPlanTier(merchant?.plan),
        )
      : SIDEBAR_GROUPS;

  const visibleGroups = baseGroups.map((group: SidebarGroup) => {
    let filteredItems = group.items;
    if (!isSocialsEnabled) {
      filteredItems = filteredItems.filter(
        (item: any) => normalizeSidebarHref(item?.href) !== "/dashboard/socials",
      );
    }
    if (!isTransactionsEnabled) {
      filteredItems = filteredItems.filter(
        (item: any) =>
          normalizeSidebarHref(item?.href) !==
          "/dashboard/finance/transactions",
      );
    }
    return { ...group, items: filteredItems };
  });

  const dedupedGroups = (() => {
    const seenKeys = new Set<string>();
    return visibleGroups
      .map((group: SidebarGroup) => {
        const items = (group.items || []).filter(
          (item: { href?: string; name?: string; icon?: string }) => {
            const rawHref = String(item?.href || "");
            const key = normalizeSidebarHref(rawHref);
            if (!key) return false;
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
            return true;
          },
        );
        return { ...group, items };
      })
      .filter((g: any) => (g.items || []).length > 0);
  })();

  const sidebarVariants = {
    desktopCollapsed: { width: 80, x: 0 },
    desktopExpanded: { width: 220, x: 0 },
    mobileHidden: { width: 280, x: "-100%" },
    mobileVisible: { width: 280, x: 0 },
  };

  const currentVariant = isMobile
    ? mobileMenuOpen
      ? "mobileVisible"
      : "mobileHidden"
    : isSidebarExpanded
      ? "desktopExpanded"
      : "desktopCollapsed";

  const flattened = dedupedGroups.flatMap((g: SidebarGroup) => g.items || []);
  const resolveBottomItem = (
    href: string,
    fallback: { name: string; icon: IconName; href: string },
  ) => {
    const target = normalizeSidebarHref(href);
    const found = flattened.find(
      (i: any) => normalizeSidebarHref(i.href) === target,
    );
    if (!found) return fallback;
    return { name: found.name, icon: found.icon as IconName, href: found.href };
  };

  const bottomNavItems: { name: string; icon: IconName; href: string }[] =
    mobileNavConfig.tabs.map((tabId: MobileNavTab) => {
      const fallback = MOBILE_NAV_TAB_DEFINITIONS[tabId];
      return resolveBottomItem(fallback.href, {
        name: fallback.name,
        icon: fallback.icon,
        href: fallback.href,
      });
    });

  const moreSheetGroups = dedupedGroups
    .map((group: SidebarGroup) => ({
      name: group.name,
      items: (group.items || []).filter(
        (item: { href?: string; name?: string; icon?: string }) => {
          const href = normalizeSidebarHref(item?.href);
          if (!href) return false;
          if (mobileNavConfig.hidden.includes(href)) return false;
          return !bottomNavItems.some(
            (b) => normalizeSidebarHref(b.href) === normalizeSidebarHref(href),
          );
        },
      ),
    }))
    .filter((g: any) => (g.items || []).length > 0);

  return (
    <StoreProvider>
      <div className="h-screen w-full overflow-hidden font-sans text-gray-900 bg-white">
        <div className="relative h-full w-full overflow-hidden flex bg-white">
          {/* Mobile overlay */}
          {isMobile && mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Clean white sidebar - permanently expanded on desktop */}
          <aside
            className={cn(
              "fixed md:relative h-full z-50 flex flex-col text-gray-900 overflow-hidden bg-white border-r border-gray-100",
              isMobile ? "top-0 left-0 w-[280px]" : "w-[220px]",
            )}
          >
            {/* Top branding block */}
            <div className="h-14 flex items-center justify-start px-3 shrink-0 border-b border-gray-50">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
                  <Logo href="/dashboard" size="sm" showText={false} />
                </div>
                {(isMobile || isSidebarExpanded) && (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      Merchant
                    </span>
                    {storeLink && (
                      <a
                        href={storeLink.startsWith("http") ? storeLink : `https://${storeLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-500 hover:text-green-600 truncate"
                      >
                        {storeLink.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {!storeLink && (
                      <span className="text-xs text-gray-400 truncate">
                        {storeDisplayName}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl hover:bg-gray-100 text-gray-500 ml-auto"
                >
                  <X size={20} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="rounded-xl hover:bg-gray-100 text-gray-400 ml-auto"
                  title={isSidebarPinned ? "Collapse sidebar" : "Pin sidebar"}
                  aria-label={isSidebarPinned ? "Collapse sidebar" : "Pin sidebar"}
                >
                  {isSidebarPinned ? (
                    <PanelLeftClose size={16} />
                  ) : (
                    <PanelLeftOpen size={16} />
                  )}
                </Button>
              )}
            </div>

            {/* Navigation groups with collapsible sections */}
            <nav
              className="flex-1 flex flex-col py-3 px-2 overflow-y-auto overflow-x-hidden"
              aria-label="Primary dashboard navigation"
            >
              {dedupedGroups.map((group: SidebarGroup, groupIdx: number) => {
                // Filter out Settings from scrollable nav — it's pinned at the bottom
                const navItems = (group.items || []).filter(
                  (item: any) => normalizeSidebarHref(item?.href) !== "/dashboard/settings/profile",
                );
                if (navItems.length === 0) return null;
                
                return (
                  <div key={group.name || groupIdx} className="mb-4">
                    {group.name && (isMobile || isSidebarExpanded) && (
                      <div className="px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {group.name}
                        </span>
                        <ChevronDown size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 mt-1">
                      {navItems.map((item: { href?: string; name?: string; icon?: string }) => {
                        const itemHrefKey = normalizeSidebarHref(item.href);
                        const pathKey = normalizeSidebarHref(pathname);
                        const isActive =
                          pathKey === itemHrefKey ||
                          (itemHrefKey !== "/dashboard" &&
                            pathKey.startsWith(itemHrefKey));
                        const isLocked = mode === "onboarding";

                        return (
                          <Link
                            key={`${String(item.href || "")}::${String(item.name || "")}`}
                            href={isLocked ? "#" : (item.href ?? "#") as string}
                            onClick={() => isMobile && setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-sm font-medium whitespace-nowrap overflow-hidden shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2",
                              isActive && !isLocked
                                ? "text-green-600 bg-green-50"
                                : isLocked
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                            )}
                            title={!isSidebarExpanded && !isMobile ? item.name : undefined}
                          >
                            <span className="relative shrink-0">
                              <Icon
                                name={item.icon as IconName}
                                size={20}
                                className={cn(
                                  "shrink-0",
                                  isActive ? "text-green-600" : "text-gray-400",
                                )}
                              />
                              {!isMobile && !isSidebarExpanded && counts[normalizeSidebarHref(item.href)] > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
                              )}
                            </span>
                            {(isMobile || isSidebarExpanded) && (
                              <span className="block truncate">{item.name}</span>
                            )}
                            {(isMobile || isSidebarExpanded) && counts[normalizeSidebarHref(item.href)] > 0 && !isLocked && (
                              <span className="ml-auto bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                                {counts[normalizeSidebarHref(item.href)]}
                              </span>
                            )}
                            {isLocked && (
                              <Lock size={14} className="ml-auto text-gray-400" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Bottom footer section */}
            <div className="shrink-0 px-2 pb-3 pt-2 border-t border-gray-100">
              {/* Help, Settings, Invite teams */}
              <div className="mb-3 space-y-0.5">
                <a
                  href="https://vayva.ng/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Icon name="CircleHelp" size={20} className="text-gray-400" />
                  {(isMobile || isSidebarExpanded) && (
                    <span className="truncate">Help Center</span>
                  )}
                </a>
                <Link
                  href="/dashboard/settings/profile"
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-xl text-sm transition-colors",
                    normalizeSidebarHref(pathname).startsWith("/dashboard/settings")
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <Icon name="Settings" size={20} className={cn(normalizeSidebarHref(pathname).startsWith("/dashboard/settings") ? "text-green-600" : "text-gray-400")} />
                  {(isMobile || isSidebarExpanded) && <span className="truncate">Settings</span>}
                </Link>
                <button
                  onClick={() => router.push('/dashboard/settings/team?invite=true')}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors w-full"
                >
                  <Icon name="UsersThree" size={20} className="text-gray-400" />
                  {(isMobile || isSidebarExpanded) && <span className="truncate">Invite Team</span>}
                </button>
              </div>
              
              {/* User profile section */}
              <div className="pt-3 border-t border-gray-100 px-2">
                <Link
                  href="/dashboard/settings/profile"
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-1.5 transition-colors"
                >
                  <Avatar
                    src={storeLogo || undefined}
                    fallback={initials}
                    className="w-8 h-8 rounded-full bg-green-500 text-white"
                  />
                  {(isMobile || isSidebarExpanded) && (
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {merchantName}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </span>
                    </div>
                  )}
                </Link>
                {(isMobile || isSidebarExpanded) && (
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-2 py-2 mt-1 rounded-xl text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={18} className="text-red-400" />
                    <span className="truncate">Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-white">
            <TrialBanner />
            <GlobalBanner />
            {/* Clean white header - h-14 (56px) */}
            <header className="h-14 w-full px-6 shrink-0 relative z-30 bg-white border-b border-gray-100">
              <div className="h-full flex items-center justify-between gap-4">
                {/* Left: Back button + Breadcrumbs */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Back button - shows on sub-pages only */}
                  {pathname !== '/dashboard' && (
                    <button
                      onClick={() => router.back()}
                      className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                      aria-label="Go back"
                    >
                      <Icon name="ArrowLeft" size={18} />
                    </button>
                  )}
                  {/* Breadcrumb trail */}
                  <Breadcrumbs className="flex items-center gap-2 text-sm text-gray-400" />
                </div>

                {/* Center: Search bar */}
                <div className="hidden md:flex items-center justify-center flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          (window as Window & { triggerCommandPalette?: () => void }).triggerCommandPalette?.();
                        }
                      }}
                      className="w-full bg-gray-50 rounded-xl h-9 pl-10 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-400 focus:bg-white transition-colors cursor-pointer"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 border border-gray-200 rounded px-1">
                      ⌘K
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreview} className="rounded-xl h-9 px-3 gap-2">
                    <Eye size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Preview</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="rounded-full h-9 px-4 gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium"
                  >
                    {isPublishing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>Publish</span>
                  </Button>
                  {/* Credit Balance Widget */}
                  <CreditBalanceWidget />
                  
                  <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
                  <NotificationBell
                    isOpen={isNotifOpen}
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                  />
                  <NotificationCenter
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                  />
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors"
                      id="user-menu-button"
                      aria-label="User menu"
                    >
                      <Avatar
                        src={storeLogo || undefined}
                        fallback={initials}
                        className="w-8 h-8 rounded-full bg-green-500 text-white"
                      />
                      <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
                    </button>
                    {showUserMenu && (
                      <div
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-50 py-1"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {merchantName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user?.email || "Account"}
                          </p>
                        </div>
                        <div className="p-1 space-y-0.5">
                          {ACCOUNT_DROPDOWN_ITEMS.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() =>
                                setTimeout(() => setShowUserMenu(false), 0)
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Icon name={item.icon} size={16} className="text-gray-400" />
                              {item.name}
                            </Link>
                          ))}
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer border-none bg-transparent"
                            title="Sign out"
                            aria-label="Sign out"
                          >
                            <LogOut size={16} />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Content area with proper padding */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 pb-24 md:pb-8">
              <div className="min-h-full w-full">
                {children}
              </div>
            </div>

            {/* Mobile bottom navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-2 pb-safe z-40 flex justify-between items-center">
              {bottomNavItems.map((item) => {
                const isActive =
                  normalizeSidebarHref(pathname) ===
                  normalizeSidebarHref(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center gap-0.5 min-w-[58px] min-h-[52px] relative"
                    aria-label={item.name}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div
                      className={cn(
                        "p-2.5 rounded-2xl transition-colors",
                        isActive
                          ? "bg-green-500 text-white"
                          : "text-gray-400",
                      )}
                    >
                      <Icon name={item.icon} size={20} />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        isActive ? "text-green-600" : "text-gray-400",
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                onClick={() => setMobileMoreOpen(true)}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[58px] min-h-[52px] h-auto p-0 hover:bg-transparent"
                aria-expanded={mobileMoreOpen}
                aria-controls="mobile-more-sheet"
                aria-label="Open more navigation"
              >
                <div
                  className={cn(
                    "p-2.5 rounded-2xl transition-colors",
                    mobileMoreOpen
                      ? "bg-green-500 text-white"
                      : "text-gray-400",
                  )}
                >
                  <Menu size={22} />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-tight",
                    mobileMoreOpen ? "text-gray-900" : "text-gray-400",
                  )}
                >
                  More
                </span>
              </Button>
            </div>

            {/* Mobile more navigation sheet */}
            {isMobile && mobileMoreOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-50"
                  onClick={() => setMobileMoreOpen(false)}
                />

                <div
                  id="mobile-more-sheet"
                  className="fixed left-0 right-0 bottom-0 z-[60] bg-white border-t border-gray-100 rounded-t-2xl"
                  role="dialog"
                  aria-modal="true"
                  aria-label="More navigation"
                >
                    <div className="px-5 pt-3 pb-2">
                      <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900">
                          More
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMobileMoreOpen(false)}
                          className="rounded-xl"
                        >
                          Close
                        </Button>
                      </div>
                    </div>

                    <div className="px-3 pb-safe pb-4 max-h-[70vh] overflow-y-auto overscroll-contain custom-scrollbar">
                      {moreSheetGroups.map((group: any, idx: number) => (
                        <div key={group.name || idx} className="mb-4">
                          {group.name && (
                            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 mt-3">
                              {group.name}
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            {group.items.map(
                              (item: { href: string; name: string; icon: string }) => (
                                <Link
                                  key={`${String(item.href || "")}::${String(item.name || "")}`}
                                  href={item.href}
                                  onClick={() => setMobileMoreOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                >
                                  <Icon
                                    name={item.icon as IconName}
                                    size={18}
                                    className="shrink-0 text-gray-400"
                                  />
                                  <span className="truncate">{item.name}</span>
                                </Link>
                              ),
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </>
            )}
          </main>
          {showUserMenu && (
            <div
              className="fixed inset-0 z-20 md:hidden"
              onClick={() => setShowUserMenu(false)}
            />
          )}
          <SupportChat />
        </div>
      </div>
    </StoreProvider>
  );
};
