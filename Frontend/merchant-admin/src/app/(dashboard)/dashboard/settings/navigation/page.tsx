"use client";

import { useMemo } from "react";
import { Button, Checkbox, Select } from "@vayva/ui";
import { toast } from "sonner";
import {
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowsClockwise as ResetIcon,
  EyeSlash as HideIcon,
} from "@phosphor-icons/react/ssr";
import {
  DEFAULT_MOBILE_NAV_CONFIG,
  MOBILE_NAV_AVAILABLE_TABS,
  MOBILE_NAV_TAB_DEFINITIONS,
  normalizeMobileNavConfig,
  type MobileNavConfig,
  type MobileNavTab,
  type MobileNavTabDefinition,
} from "@/config/mobile-nav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { normalizeSidebarHref } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function MobileNavigationSettingsPage() {
  const [savedConfig, setSavedConfig] = useLocalStorage<MobileNavConfig>(
    "vayva_mobile_nav_config",
    DEFAULT_MOBILE_NAV_CONFIG,
  );

  const config = normalizeMobileNavConfig(savedConfig);

  const selectableTabs = useMemo(
    () =>
      MOBILE_NAV_AVAILABLE_TABS.map((tabId: MobileNavTab) => ({
        ...MOBILE_NAV_TAB_DEFINITIONS[tabId],
      })),
    [],
  );

  const updateConfig = (next: MobileNavConfig, successMessage?: string) => {
    const normalized = normalizeMobileNavConfig(next);
    setSavedConfig(normalized);
    if (successMessage) toast.success(successMessage);
  };

  const handleReplaceSlot = (slotIndex: number, nextTab: MobileNavTab) => {
    const nextTabs = [...config.tabs] as MobileNavTab[];
    const existingIndex = nextTabs.indexOf(nextTab);

    if (existingIndex >= 0) {
      const current = nextTabs[slotIndex];
      nextTabs[slotIndex] = nextTabs[existingIndex];
      nextTabs[existingIndex] = current;
    } else {
      nextTabs[slotIndex] = nextTab;
    }

    updateConfig(
      {
        ...config,
        tabs: nextTabs.slice(0, 4) as MobileNavConfig["tabs"],
      },
      "Bottom tabs updated",
    );
  };

  const handleMoveSlot = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex > config.tabs?.length - 1) return;

    const nextTabs = [...config.tabs] as MobileNavTab[];
    const current = nextTabs[index];
    nextTabs[index] = nextTabs[targetIndex];
    nextTabs[targetIndex] = current;

    updateConfig(
      {
        ...config,
        tabs: nextTabs.slice(0, 4) as MobileNavConfig["tabs"],
      },
      "Tab order updated",
    );
  };

  const toggleHidden = (href: string, checked: boolean) => {
    const normalizedHref = normalizeSidebarHref(href);
    const nextHidden = checked
      ? [...config.hidden, normalizedHref]
      : config.hidden?.filter((item: string) => item !== normalizedHref);

    updateConfig({ ...config, hidden: Array.from(new Set(nextHidden)) });
  };

  const resetDefaults = () => {
    setSavedConfig(DEFAULT_MOBILE_NAV_CONFIG);
    toast.success("Navigation reset to defaults");
  };

  return (
    <div className="p-6 md:p-8">
      <Breadcrumbs />
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mobile Navigation</h1>
          <p className="text-text-secondary mt-1">
            Personalize your bottom tab bar and control what appears in More.
          </p>
        </div>

        <section className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Bottom Tabs (4 slots)</h2>
            <Button variant="ghost" size="sm" onClick={resetDefaults}>
              <ResetIcon size={16} className="mr-1" />
              Reset
            </Button>
          </div>

          <div className="space-y-3">
            {config?.tabs?.map((tab: any, index: number) => (
              <div
                key={`${tab}-${index}`}
                className="rounded-2xl border border-border/50 bg-background/50 p-3 flex flex-wrap items-center gap-3"
              >
                <div className="text-xs font-semibold text-text-tertiary w-14">
                  Slot {index + 1}
                </div>

                <Select
                  value={tab}
                  onChange={(event: any) =>
                    handleReplaceSlot(index, event.target?.value as MobileNavTab)
                  }
                  className="h-10 px-3 rounded-xl border border-border bg-background text-sm text-text-primary min-w-[180px]"
                  aria-label={`Choose tab for slot ${index + 1}`}
                >
                  {selectableTabs.map((option: MobileNavTabDefinition) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSlot(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move slot ${index + 1} up`}
                  >
                    <ArrowUpIcon size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSlot(index, 1)}
                    disabled={index === config.tabs?.length - 1}
                    aria-label={`Move slot ${index + 1} down`}
                  >
                    <ArrowDownIcon size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Hide from More</h2>
            <p className="text-xs text-text-secondary mt-1">
              Choose optional tabs to keep out of the More sheet when they are not pinned.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOBILE_NAV_AVAILABLE_TABS.filter((tabId: MobileNavTab) => tabId !== "home").map((tabId: MobileNavTab) => {
              const def = MOBILE_NAV_TAB_DEFINITIONS[tabId];
              const isPinned = config.tabs?.includes(tabId);
              const isHidden = config.hidden?.includes(normalizeSidebarHref(def.href));

              return (
                <label
                  key={tabId}
                  className="rounded-2xl border border-border/50 bg-background/50 p-3 flex items-start gap-3"
                >
                  <Checkbox
                    checked={isPinned ? false : isHidden}
                    disabled={isPinned}
                    onCheckedChange={(value) =>
                      toggleHidden(def.href, value === true)
                    }
                    aria-label={`Hide ${def.name} from More`}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      {def.name}
                      {isPinned && (
                        <span className="text-[10px] uppercase tracking-wide text-primary font-bold">
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                      <HideIcon size={12} />
                      {isPinned ? "Visible in bottom tabs" : "Hide from More"}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
