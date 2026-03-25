"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Avatar, Button, Icon, IconName, cn } from "@vayva/ui";
import {
  X,
  CaretDoubleLeft as PanelLeftClose,
  CaretDoubleRight as PanelLeftOpen,
  Lock,
  Eye,
  Spinner as Loader2,
  UploadSimple as Upload,
  ArrowSquareOut as ExternalLink,
  MagnifyingGlass as Search,
  CaretDown as ChevronDown,
  SignOut as LogOut,
  List as Menu
} from "@phosphor-icons/react/ssr";
import { useAuth } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { NotificationBell } from "./notifications/NotificationBell";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { GlobalBanner } from "./notifications/GlobalBanner";
import { Logo } from "./Logo";
import { SupportChat } from "./support/support-chat";
import { CommandPalette } from "./ai/CommandPalette";
import { extensionRegistry } from "@/lib/extensions/registry";
import { normalizeSidebarHref } from "@/lib/utils";
import { apiJson } from "@/lib/api-client-shared";
import { StatusPill } from "./wix-style/StatusPill";
import { Breadcrumbs } from "./ui/breadcrumbs";
import { getSidebar, SIDEBAR_GROUPS } from "@/config/sidebar";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { resolveDashboardPlanTier } from "@/config/dashboard-variants";
import { IndustrySlug, SidebarGroup } from "@/lib/templates/types";

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
  const _searchParams = useSearchParams();
  const { user, merchant, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);

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
              extensionRegistry.register(
                manifest as unknown as Parameters<
                  typeof extensionRegistry.register
                >[0],
              );
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

  const visibleGroups = baseGroups.map((group) => {
    let filteredItems = group.items;
    if (!isSocialsEnabled) {
      filteredItems = filteredItems.filter(
        (item) => normalizeSidebarHref(item?.href) !== "/dashboard/socials",
      );
    }
    if (!isTransactionsEnabled) {
      filteredItems = filteredItems.filter(
        (item) =>
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
        const items = (group.items || []).filter((item) => {
          const rawHref = String(item?.href || "");
          const key = normalizeSidebarHref(rawHref);
          if (!key) return false;
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });
        return { ...group, items };
      })
      .filter((g) => (g.items || []).length > 0);
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
      (i) => normalizeSidebarHref(i.href) === target,
    );
    if (!found) return fallback;
    return { name: found.name, icon: found.icon as IconName, href: found.href };
  };

  // Industry-aware bottom nav: show Bookings for service industries, Orders otherwise
  const industryConfig = industrySlug ? INDUSTRY_CONFIG[industrySlug] : null;
  const hasBookingsFeature = Boolean(
    industryConfig?.features?.bookings ||
    industryConfig?.features?.reservations ||
    industryConfig?.features?.viewings,
  );

  const bottomNavItems: { name: string; icon: IconName; href: string }[] = [
    { name: "Home", icon: "LayoutDashboard", href: "/dashboard" },
    // Slot 2: Bookings (service industries) or Orders (commerce industries)
    hasBookingsFeature
      ? ((): { name: string; icon: IconName; href: string } => {
          const bookingsRoute =
            industryConfig?.moduleRoutes?.bookings?.index ||
            "/dashboard/bookings";
          const bookingsLabel =
            industryConfig?.moduleLabels?.bookings || "Bookings";
          const bookingsIcon =
            industryConfig?.moduleIcons?.bookings || "Calendar";
          return resolveBottomItem(bookingsRoute, {
            name: bookingsLabel,
            icon: bookingsIcon as IconName,
            href: bookingsRoute,
          });
        })()
      : resolveBottomItem("/dashboard/orders", {
          name: "Orders",
          icon: "ShoppingBag",
          href: "/dashboard/orders",
        }),
    // Slot 3: Primary catalog (Products, Services, Menu Items, etc.)
    ((): { name: string; icon: IconName; href: string } => {
      const catalogRoute = industryConfig?.moduleRoutes?.catalog?.index;
      if (catalogRoute) {
        const catalogLabel =
          industryConfig?.moduleLabels?.catalog || "Products";
        const catalogIcon = industryConfig?.moduleIcons?.catalog || "Package";
        return resolveBottomItem(catalogRoute, {
          name: catalogLabel,
          icon: catalogIcon as IconName,
          href: catalogRoute,
        });
      }
      const catalog = flattened.find((i) => {
        const key = normalizeSidebarHref(i.href);
        return key === "/dashboard/products" || key === "/dashboard/menu-items";
      });
      if (catalog)
        return {
          name: catalog.name,
          icon: catalog.icon as IconName,
          href: catalog.href,
        };
      return { name: "Products", icon: "Package", href: "/dashboard/products" };
    })(),
    resolveBottomItem("/dashboard/finance", {
      name: "Earnings",
      icon: "Wallet",
      href: "/dashboard/finance",
    }),
  ];

  return (
    <StoreProvider>
      <div className="h-screen w-full overflow-hidden font-sans text-text-primary crm-canvas">
        <div className="relative h-full w-full overflow-hidden flex bg-background/40 backdrop-blur-[2px]">
          <AnimatePresence>
            {isMobile && mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              />
            )}
          </AnimatePresence>

          <motion.aside
            className={cn(
              "fixed md:relative h-full z-50 flex flex-col text-text-primary overflow-hidden",
              isMobile
                ? "top-0 left-0 bg-background/70 backdrop-blur-xl border-r border-border shadow-elevated w-[280px]"
                : "md:bg-background/40 md:backdrop-blur-xl md:border-r md:border-border/60 md:shadow-none md:rounded-tr-3xl md:rounded-br-3xl",
            )}
            variants={sidebarVariants}
            initial={false}
            animate={currentVariant}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="h-[60px] md:h-[72px] flex items-center justify-start px-4 shrink-0 relative">
              <Logo
                href="/dashboard"
                size="md"
                showText={isMobile || isSidebarExpanded}
                text="Merchant"
              />
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl hover:bg-white/40 text-text-secondary ml-auto"
                >
                  <X size={24} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="rounded-xl hover:bg-white/40 text-text-tertiary ml-auto transition-all"
                  title={
                    isSidebarPinned ? "Collapse sidebar" : "Pin sidebar open"
                  }
                  aria-label={
                    isSidebarPinned ? "Collapse sidebar" : "Pin sidebar open"
                  }
                >
                  {isSidebarPinned ? (
                    <PanelLeftClose size={18} />
                  ) : (
                    <PanelLeftOpen size={18} />
                  )}
                </Button>
              )}
            </div>

            <nav
              className="flex-1 flex flex-col gap-4 py-4 px-3 overflow-hidden custom-scrollbar overflow-y-auto"
              aria-label="Primary dashboard navigation"
            >
              {dedupedGroups.map((group: SidebarGroup, groupIdx: number) => (
                <div
                  key={group.name || groupIdx}
                  className="flex flex-col gap-1"
                >
                  {group.name && (
                    <div
                      className={cn(
                        "px-4 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-1 mt-1 transition-opacity duration-200",
                        !isSidebarExpanded && !isMobile
                          ? "opacity-0 h-0 overflow-hidden"
                          : "opacity-100",
                      )}
                    >
                      {group.name}
                    </div>
                  )}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {group.items.map((item) => {
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
                        href={isLocked ? "#" : item.href}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all text-sm font-semibold relative group whitespace-nowrap overflow-hidden shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          isActive && !isLocked
                            ? "bg-white/40 text-text-primary shadow-sm"
                            : isLocked
                              ? "text-text-tertiary cursor-not-allowed"
                              : "text-text-secondary hover:text-text-primary hover:bg-white/40",
                        )}
                        title={
                          !isSidebarExpanded && !isMobile
                            ? item.name
                            : undefined
                        }
                      >
                        <Icon
                          name={item.icon as IconName}
                          size={18}
                          className={cn(
                            "shrink-0 transition-colors",
                            isActive
                              ? "text-text-primary"
                              : "text-text-tertiary group-hover:text-text-secondary",
                          )}
                        />
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: isMobile || isSidebarExpanded ? 1 : 0,
                          }}
                          className="block truncate"
                        >
                          {item.name}
                        </motion.span>
                        {isLocked && (
                          <Lock
                            size={12}
                            className="ml-auto opacity-50 shrink-0"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </motion.aside>

          <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-transparent">
            <GlobalBanner />
            <header className="h-[60px] md:h-[72px] w-full mt-0 md:mt-4 px-4 md:px-6 shrink-0 relative z-30">
              <div className="h-full w-full bg-background/70 backdrop-blur-xl border border-border/60 shadow-card rounded-2xl flex items-center gap-4 justify-between px-4 md:px-6">
                <div className="flex items-center gap-4 md:gap-6 shrink-0">
                  <Logo
                    href="/dashboard"
                    size="sm"
                    showText={true}
                    text="Merchant"
                    className="md:hidden"
                  />
                  <div className="hidden md:block">
                    <div className="flex items-center gap-3">
                      <h1 className="text-base font-semibold text-text-primary truncate max-w-[240px]">
                        {storeDisplayName}
                      </h1>
                      <StatusPill
                        status={storeStatus === "live" ? "PUBLISHED" : "DRAFT"}
                        className="scale-90 origin-left"
                      />
                    </div>
                    <Breadcrumbs className="mt-0.5" />
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-center flex-1 px-4 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="rounded-xl h-9 px-4 gap-2 border-border/60 hover:bg-white/40 transition-all"
                  >
                    <Eye size={14} />
                    <span className="font-bold text-xs">Preview</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="rounded-xl h-9 px-5 gap-2 bg-text-primary text-text-inverse hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                  >
                    {isPublishing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span className="font-bold text-xs">Publish</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <a
                    href={storeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleVisitStore}
                    className={cn(
                      "hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm",
                      storeStatus === "live" && storeLink
                        ? "bg-primary text-text-inverse hover:bg-primary-hover shadow-card"
                        : "bg-white/40 text-text-tertiary cursor-not-allowed",
                    )}
                  >
                    Visit Store <ExternalLink size={12} />
                  </a>
                  <CommandPalette />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-text-tertiary hover:text-text-primary hover:bg-white/40 md:hidden"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        (
                          window as Window & {
                            triggerCommandPalette?: () => void;
                          }
                        ).triggerCommandPalette?.();
                      }
                    }}
                    aria-label="Search"
                    title="Search"
                  >
                    <Search size={20} />
                  </Button>
                  <NotificationBell
                    isOpen={isNotifOpen}
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                  />
                  <NotificationCenter
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                  />
                  <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
                  <div className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/40 transition-colors h-auto"
                      id="user-menu-button"
                      aria-label="User menu"
                      title="User menu"
                    >
                      <Avatar
                        src={storeLogo || undefined}
                        fallback={initials}
                        className="bg-primary"
                      />
                      <ChevronDown
                        size={16}
                        className="text-text-tertiary hidden sm:block"
                      />
                    </Button>
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-2xl shadow-elevated overflow-hidden z-50 py-1"
                        >
                          <div className="px-4 py-3 border-b border-border mb-1">
                            <p className="text-sm font-semibold text-text-primary">
                              {merchantName}
                            </p>
                            <p className="text-xs text-text-secondary truncate">
                              {user?.email || "Account"}
                            </p>
                          </div>
                          <div className="p-1">
                            {ACCOUNT_DROPDOWN_ITEMS.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() =>
                                  setTimeout(() => setShowUserMenu(false), 0)
                                }
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/40 rounded-xl transition-colors font-semibold cursor-pointer border-none bg-transparent"
                              >
                                <Icon name={item.icon} size={16} />
                                {item.name}
                              </Link>
                            ))}
                            <div className="h-px bg-border my-1" />
                            <Button
                              variant="ghost"
                              onClick={() => {
                                logout();
                                setShowUserMenu(false);
                              }}
                              className="w-full justify-start items-center gap-3 p-2 hover:bg-white/40 rounded-xl transition-colors text-left group font-normal h-auto"
                              title="Sign out"
                              aria-label="Sign out"
                            >
                              <LogOut size={16} />
                              Sign out
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 custom-scrollbar pb-24 md:pb-8">
              <div className="min-h-full w-full">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, translateY: "10px" }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: "-10px" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </div>
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border px-6 py-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] z-40 flex justify-between items-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.06)]">
              {bottomNavItems.map((item) => {
                const isActive =
                  normalizeSidebarHref(pathname) ===
                  normalizeSidebarHref(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center gap-0.5 min-w-[56px] relative"
                    aria-label={item.name}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-2xl transition-all duration-300",
                        isActive
                          ? "bg-primary text-text-inverse shadow-card scale-110 -translate-y-1"
                          : "text-text-tertiary hover:text-text-secondary",
                      )}
                    >
                      <Icon name={item.icon} size={22} />
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-tight transition-colors",
                        isActive ? "text-text-primary" : "text-text-tertiary",
                      )}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavActive"
                        className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                onClick={() => setMobileMenuOpen(true)}
                className="flex flex-col items-center gap-0.5 min-w-[56px] h-auto p-0 hover:bg-transparent"
              >
                <div
                  className={cn(
                    "p-2 rounded-2xl transition-colors",
                    mobileMenuOpen
                      ? "bg-primary text-text-inverse"
                      : "text-text-tertiary",
                  )}
                >
                  <Menu size={22} />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-tight",
                    mobileMenuOpen ? "text-text-primary" : "text-text-tertiary",
                  )}
                >
                  More
                </span>
              </Button>
            </div>
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
