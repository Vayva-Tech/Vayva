"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect, useRef } from "react";
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
  Globe,
  Plus,
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
      businessName?: string;
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
    businessName?: string;
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

/** Title-case a storefront subdomain (e.g. luxe-fashion → Luxe Fashion) for sidebar fallback. */
function storeTitleFromSubdomain(storeLink: string): string {
  const host =
    storeLink.replace(/^https?:\/\//, "").split("/")[0]?.split(":")[0] ?? "";
  const sub = host.split(".")[0]?.trim() ?? "";
  if (!sub || sub === "www") return "";
  return sub
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  const userMenuRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!showUserMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowUserMenu(false);
    };
    const onDown = (e: MouseEvent) => {
      const el = userMenuRef.current;
      if (el && !el.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [showUserMenu]);

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
  const [mobileStoreSheetOpen, setMobileStoreSheetOpen] = useState(false);
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
    if (!merchant) return;
    const m = merchant as {
      store?: { name?: string };
      businessName?: string;
    };
    const fromStore =
      typeof m.store?.name === "string" ? m.store.name.trim() : "";
    const fromBusiness =
      typeof m.businessName === "string" ? m.businessName.trim() : "";
    const next = fromStore || fromBusiness;
    if (next) setStoreDisplayName(next);
  }, [merchant]);

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
        } else if (
          typeof merchantData.businessName === "string" &&
          merchantData.businessName.trim()
        ) {
          setStoreDisplayName(merchantData.businessName.trim());
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
      pathname &&
      !pathname.startsWith("/onboarding")
    ) {
      router.push("/onboarding");
    }
  }, [_isLoadingIndustry, industrySlug, pathname, router, merchant]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileMoreOpen(false);
    setMobileStoreSheetOpen(false);
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

  const canAddProduct =
    normalizeSidebarHref(pathname) === "/dashboard/products" ||
    normalizeSidebarHref(pathname).startsWith("/dashboard/products/");

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "FD";
  const merchantName = merchant?.firstName || user?.firstName || "Merchant";

  const sidebarStoreTitle =
    storeDisplayName.trim() ||
    storeTitleFromSubdomain(storeLink) ||
    "My Store";

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

          {/* Clean white sidebar */}
          <aside
            className={cn(
              "fixed md:relative h-full z-50 flex flex-col text-gray-900 overflow-hidden bg-white border-r border-gray-100",
              isMobile ? "top-0 left-0 w-[280px]" : "w-[220px]",
            )}
          >
            {/* Top branding block */}
            <div className="px-3 py-2 shrink-0 border-b border-gray-50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white">
                  <Logo href="/dashboard" size="sm" showText={false} />
                </div>
                {(isMobile || isSidebarExpanded) && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {sidebarStoreTitle}
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
                        {sidebarStoreTitle}
                      </span>
                    )}
                    <Breadcrumbs className="mt-1 text-[11px] text-gray-400" />
                  </div>
                )}
                {!(isMobile || isSidebarExpanded) && (
                  <span className="sr-only">{sidebarStoreTitle}</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-end">
                {isMobile ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl hover:bg-transparent text-green-600"
                    aria-label="Close navigation"
                  >
                    <X size={20} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="rounded-xl hover:bg-gray-100 text-gray-400"
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
                      <div className="px-2 py-1.5">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {group.name}
                        </span>
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
                <Button
                  onClick={() => router.push('/dashboard/settings/team?invite=true')}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors w-full"
                >
                  <Icon name="UsersThree" size={20} className="text-gray-400" />
                  {(isMobile || isSidebarExpanded) && <span className="truncate">Invite Team</span>}
                </Button>
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
                  <Button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-2 py-2 mt-1 rounded-xl text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={18} className="text-red-400" />
                    <span className="truncate">Sign out</span>
                  </Button>
                )}
              </div>
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-white">
            <TrialBanner />
            <GlobalBanner />
            {/* Header: safe-area inset above the bar; frosted glass on small screens */}
            <header className="w-full shrink-0 relative z-30 sticky top-0 border-b border-gray-100/80 bg-white/90 backdrop-blur-md md:bg-white md:backdrop-blur-none">
              <div className="pt-safe-top md:pt-0">
                <div className="h-14 w-full px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4">
                {/* Left: Menu + Back */}
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  {isMobile && (
                    <Button
                      type="button"
                      onClick={() => setMobileMenuOpen(true)}
                      className="min-w-[44px] min-h-[44px] shrink-0 rounded-xl flex items-center justify-center text-green-600 hover:bg-transparent transition-colors"
                      aria-label="Open navigation menu"
                    >
                      <PanelLeftOpen size={22} strokeWidth={2} />
                    </Button>
                  )}
                  {pathname !== "/dashboard" && (
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      className="min-w-[44px] min-h-[44px] shrink-0 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                      aria-label="Go back"
                    >
                      <Icon name="ArrowLeft" size={20} />
                    </Button>
                  )}
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
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                  <Button
                    type="button"
                    className="md:hidden min-w-[44px] min-h-[44px] rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center"
                    onClick={() =>
                      typeof window !== "undefined" &&
                      (window as Window & { triggerCommandPalette?: () => void }).triggerCommandPalette?.()
                    }
                    aria-label="Search"
                  >
                    <Search size={20} className="text-gray-600" />
                  </Button>
                  {storeLink ? (
                    <a
                      href={
                        storeLink.startsWith("http")
                          ? storeLink
                          : `https://${storeLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleVisitStore}
                      className="md:hidden inline-flex items-center gap-1.5 rounded-xl h-9 px-3 border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                      aria-label="Open merchant website"
                    >
                      <Globe size={16} className="text-gray-500" />
                      <span>Website</span>
                    </a>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMobileStoreSheetOpen(true)}
                      className="md:hidden rounded-xl h-9 px-3 gap-1.5 border-gray-200"
                      aria-label="Store and publishing"
                    >
                      <ExternalLink size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-800">
                        Store
                      </span>
                    </Button>
                  )}

                  {canAddProduct && (
                    <Link
                      href="/dashboard/products/new"
                      className="hidden md:inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 h-9 text-sm font-medium text-white shadow-sm hover:bg-green-600 transition-colors"
                      aria-label="Add product"
                    >
                      <Plus size={16} />
                      Add Product
                    </Link>
                  )}

                  {storeLink ? (
                    <a
                      href={
                        storeLink.startsWith("http")
                          ? storeLink
                          : `https://${storeLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleVisitStore}
                      className="hidden md:inline-flex items-center gap-2 rounded-xl h-9 px-3 border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      aria-label="Open merchant website"
                      title="Open website"
                    >
                      <Globe size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Website
                      </span>
                    </a>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="hidden md:inline-flex rounded-xl h-9 px-3 gap-2"
                  >
                    <Eye size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Preview</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="hidden md:inline-flex rounded-full h-9 px-4 gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium"
                  >
                    {isPublishing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>Publish</span>
                  </Button>
                  <div className="hidden md:block">
                    <CreditBalanceWidget />
                  </div>

                  <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
                  <NotificationBell
                    isOpen={isNotifOpen}
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                  />
                  <NotificationCenter
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                  />
                  <div className="relative" ref={userMenuRef}>
                    <Button
                      type="button"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 p-1 rounded-xl hover:bg-gray-100 transition-colors"
                      id="user-menu-button"
                      aria-label="User menu"
                      aria-expanded={showUserMenu}
                    >
                      <Avatar
                        src={storeLogo || undefined}
                        fallback={initials}
                        className="w-8 h-8 rounded-full bg-green-500 text-white"
                      />
                      <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
                    </Button>
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
                          <Button
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
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </header>

            {/* Content: tinted canvas on mobile, extra bottom padding for tab bar */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6 md:py-6 pb-28 md:pb-8 bg-gray-50 md:bg-white">
              <div className="min-h-full w-full dashboard-page">
                <div className="mx-auto w-full max-w-[1600px]">{children}</div>
              </div>
            </div>

            {/* Mobile bottom navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-between items-center border-t border-gray-100/90 bg-white/95 backdrop-blur-lg px-4 pt-2 pb-safe-bottom shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.12)]">
              {bottomNavItems.map((item) => {
                const isActive =
                  normalizeSidebarHref(pathname) ===
                  normalizeSidebarHref(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] max-h-[52px] relative touch-manipulation active:opacity-80"
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
                className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] !min-h-[48px] max-h-[52px] h-auto p-0 hover:bg-transparent touch-manipulation"
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
                    "text-[10px] font-bold uppercase tracking-tight",
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

                    <div className="px-3 pb-4 pb-safe-bottom max-h-[70vh] overflow-y-auto overscroll-contain custom-scrollbar">
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

            {/* Mobile storefront: preview, publish, credits */}
            {isMobile && mobileStoreSheetOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-50"
                  onClick={() => setMobileStoreSheetOpen(false)}
                  aria-hidden
                />
                <div
                  className="fixed left-0 right-0 bottom-0 z-[60] bg-white border-t border-gray-100 rounded-t-2xl shadow-[0_-12px_40px_-16px_rgba(15,23,42,0.18)]"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Store and publishing"
                >
                  <div className="px-5 pt-3 pb-2">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">
                        Storefront
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileStoreSheetOpen(false)}
                        className="rounded-xl"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                  <div className="px-4 pb-safe-bottom pb-6 space-y-3">
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full rounded-xl h-11 justify-center gap-2"
                      onClick={() => {
                        handlePreview();
                        setMobileStoreSheetOpen(false);
                      }}
                    >
                      <Eye size={18} />
                      Preview site
                    </Button>
                    <Button
                      type="button"
                      className="w-full rounded-xl h-11 justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        void handlePublish();
                        setMobileStoreSheetOpen(false);
                      }}
                      disabled={isPublishing}
                    >
                      {isPublishing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Upload size={18} />
                      )}
                      Publish changes
                    </Button>
                    {storeLink ? (
                      <a
                        href={
                          storeLink.startsWith("http")
                            ? storeLink
                            : `https://${storeLink}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleVisitStore}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <ExternalLink size={16} />
                        Open live store
                      </a>
                    ) : null}
                    <div className="pt-3 border-t border-gray-100 w-full min-w-0">
                      <CreditBalanceWidget />
                    </div>
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
