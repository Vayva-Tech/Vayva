"use client";

import Link from "next/link";
import { Icon, cn, type IconName } from "@vayva/ui";
import type { SuggestedAction } from "@/services/dashboard-actions";
import type { DashboardAlert } from "@/services/dashboard-alerts";

// ---------------------------------------------------------------------------
// Shared shells for industry-native dashboard sections
// ---------------------------------------------------------------------------

interface SectionShellProps {
  title: string;
  icon?: IconName;
  children: React.ReactNode;
  className?: string;
}

function SectionShell({ title, icon, children, className }: SectionShellProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-6 pt-6 pb-2">
        {icon && (
          <Icon
            name={icon}
            size={16}
            className="text-text-tertiary"
          />
        )}
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="px-6 pb-6 pt-2">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Primary Object Health
// ---------------------------------------------------------------------------

interface ProductHealthItem {
  id: string;
  title: string;
  unitsSold?: number;
  stock?: number;
}

interface PrimaryObjectHealthProps {
  label: string;
  topSelling: ProductHealthItem[];
  lowStock: ProductHealthItem[];
  deadStock: ProductHealthItem[];
  isLoading?: boolean;
}

export function PrimaryObjectHealth({
  label,
  topSelling,
  lowStock,
  deadStock,
  isLoading,
}: PrimaryObjectHealthProps) {
  if (isLoading) {
    return (
      <SectionShell title={`${label} Health`} icon="Activity">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 rounded-2xl bg-surface-2/50 animate-pulse"
            />
          ))}
        </div>
      </SectionShell>
    );
  }

  const hasData =
    topSelling.length > 0 || lowStock.length > 0 || deadStock.length > 0;

  return (
    <SectionShell title={`${label} Health`} icon="Activity">
      {!hasData ? (
        <div className="rounded-2xl border border-border/60 bg-background/60 p-5 text-sm text-text-secondary">
          No {label.toLowerCase()} data yet. Start adding {label.toLowerCase()}s
          to see health metrics.
        </div>
      ) : (
        <div className="space-y-4">
          {topSelling.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon
                  name="TrendingUp"
                  size={14}
                  className="text-status-success"
                />
                <span className="text-xs font-semibold text-text-secondary">
                  Top Selling Today
                </span>
              </div>
              <div className="space-y-1.5">
                {topSelling.slice(0, 5).map((item: any, i: number) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-text-tertiary w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm text-text-primary truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-status-success shrink-0">
                      {item.unitsSold} sold
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowStock.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon
                  name="AlertTriangle"
                  size={14}
                  className="text-status-warning"
                />
                <span className="text-xs font-semibold text-text-secondary">
                  Low Stock
                </span>
              </div>
              <div className="space-y-1.5">
                {lowStock.slice(0, 5).map((item: ProductHealthItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-status-warning/20 bg-status-warning/10 px-3 py-2"
                  >
                    <span className="text-sm text-text-primary truncate">
                      {item.title}
                    </span>
                    <span className="text-xs font-bold text-status-warning shrink-0">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deadStock.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="PackageX" size={14} className="text-status-danger" />
                <span className="text-xs font-semibold text-text-secondary">
                  Not Selling (14d)
                </span>
              </div>
              <div className="space-y-1.5">
                {deadStock.slice(0, 3).map((item: ProductHealthItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-status-danger/20 bg-status-danger/10 px-3 py-2"
                  >
                    <span className="text-sm text-text-primary truncate">
                      {item.title}
                    </span>
                    <span className="text-xs font-bold text-status-danger shrink-0">
                      {item.stock} in stock
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// Live Operations
// ---------------------------------------------------------------------------

interface LiveOpsItem {
  key: string;
  label: string;
  value: number | string | null;
  icon: string;
  emptyText?: string;
}

interface LiveOperationsProps {
  title: string;
  items: LiveOpsItem[];
  isLoading?: boolean;
}

export function LiveOperations({
  title,
  items,
  isLoading,
}: LiveOperationsProps) {
  if (isLoading) {
    return (
      <SectionShell title={title} icon="Radio">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-surface-2/50 animate-pulse"
            />
          ))}
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title={title} icon="Radio">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item: LiveOpsItem) => {
          const numVal = typeof item.value === "number" ? item.value : 0;
          const isEmpty =
            item.value === null || item.value === 0 || item.value === "0";
          const isCritical =
            numVal > 0 &&
            (item.key === "delayedShipments" || item.key === "kitchenBacklog");

          return (
            <div
              key={item.key}
              className={cn(
                "rounded-2xl border p-4 text-center",
                isCritical
                  ? "border-status-danger/20 bg-status-danger/10"
                  : "border-border/60 bg-background/60",
              )}
            >
              <Icon
                name={item.icon as IconName}
                size={18}
                className={cn(
                  "mx-auto mb-2",
                  isCritical ? "text-status-danger" : "text-text-tertiary",
                )}
              />
              <div
                className={cn(
                  "text-2xl font-bold",
                  isCritical ? "text-status-danger" : "text-text-primary",
                )}
              >
                {isEmpty ? "—" : item.value}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {isEmpty ? item.emptyText || item.label : item.label}
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// Bottlenecks & Alerts
// ---------------------------------------------------------------------------

interface AlertsListProps {
  alerts: DashboardAlert[];
  isLoading?: boolean;
}

const SEVERITY_STYLES: Record<
  string,
  { border: string; bg: string; icon: string; iconColor: string }
> = {
  critical: {
    border: "border-status-danger/20",
    bg: "bg-status-danger/10",
    icon: "AlertOctagon",
    iconColor: "text-status-danger",
  },
  warning: {
    border: "border-status-warning/20",
    bg: "bg-status-warning/10",
    icon: "AlertTriangle",
    iconColor: "text-status-warning",
  },
  info: {
    border: "border-status-info/20",
    bg: "bg-status-info/10",
    icon: "Info",
    iconColor: "text-status-info",
  },
};

export function AlertsList({ alerts, isLoading }: AlertsListProps) {
  if (isLoading) {
    return (
      <SectionShell title="Bottlenecks & Alerts" icon="ShieldAlert">
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-14 rounded-2xl bg-surface-2/50 animate-pulse"
            />
          ))}
        </div>
      </SectionShell>
    );
  }

  if (alerts.length === 0) {
    return (
      <SectionShell title="Bottlenecks & Alerts" icon="ShieldAlert">
        <div className="rounded-2xl border border-status-success/20 bg-status-success/10 p-4 flex items-center gap-3">
          <Icon
            name="CheckCircle"
            size={18}
            className="text-status-success shrink-0"
          />
          <span className="text-sm text-text-primary">
            All clear — no bottlenecks detected.
          </span>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Bottlenecks & Alerts" icon="ShieldAlert">
      <div className="space-y-2">
        {alerts.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
          return (
            <div
              key={alert.id}
              className={cn(
                "rounded-2xl border p-4 flex items-start gap-3",
                style.border,
                style.bg,
              )}
            >
              <Icon
                name={style.icon as IconName}
                size={18}
                className={cn("shrink-0 mt-0.5", style.iconColor)}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text-primary">
                  {alert.title}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {alert.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// Suggested Actions
// ---------------------------------------------------------------------------

interface SuggestedActionsListProps {
  actions: SuggestedAction[];
  isLoading?: boolean;
}

const ACTION_SEVERITY_STYLES: Record<
  string,
  { border: string; bg: string; hoverBg: string }
> = {
  critical: {
    border: "border-status-danger/20",
    bg: "bg-status-danger/5",
    hoverBg: "hover:bg-status-danger/10",
  },
  warning: {
    border: "border-status-warning/20",
    bg: "bg-status-warning/5",
    hoverBg: "hover:bg-status-warning/10",
  },
  info: {
    border: "border-border/60",
    bg: "bg-background/60",
    hoverBg: "hover:bg-surface-2/50",
  },
};

export function SuggestedActionsList({
  actions,
  isLoading,
}: SuggestedActionsListProps) {
  if (isLoading) {
    return (
      <SectionShell title="Suggested Actions" icon="Lightbulb">
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-surface-2/50 animate-pulse"
            />
          ))}
        </div>
      </SectionShell>
    );
  }

  if (actions.length === 0) {
    return (
      <SectionShell title="Suggested Actions" icon="Lightbulb">
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-text-secondary">
          No actions needed right now. You're on track.
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Suggested Actions" icon="Lightbulb">
      <div className="space-y-2">
        {actions.map((action) => {
          const style =
            ACTION_SEVERITY_STYLES[action.severity || "info"] ||
            ACTION_SEVERITY_STYLES.info;
          return (
            <Link
              key={action.id}
              href={action.href || "#"}
              className={cn(
                "rounded-2xl border p-4 flex items-center gap-3 transition-colors",
                style.border,
                style.bg,
                style.hoverBg,
              )}
            >
              <div className="h-10 w-10 rounded-2xl bg-surface-2/50 flex items-center justify-center shrink-0">
                <Icon
                  name={action.icon as IconName}
                  size={18}
                  className="text-text-secondary"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text-primary">
                  {action.title}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {action.reason || action.description}
                </div>
              </div>
              <Icon
                name="ChevronRight"
                size={16}
                className="text-text-tertiary shrink-0"
              />
            </Link>
          );
        })}
      </div>
    </SectionShell>
  );
}
