"use client";

import Link from "next/link";
import { Button, Icon, PageHeader, SectionCard } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";
import { DashboardSetupChecklist } from "@/components/dashboard/DashboardSetupChecklist";
import { StatWidget } from "./StatWidget";
import { extensionRegistry } from "@/lib/extensions/registry";
import type { IndustrySlug } from "@/lib/templates/types";
import type { MetricValue } from "@/types/dashboard";

// ─── Props ──────────────────────────────────────────────
export interface DashboardLegacyContentProps {
  storeName: string;
  industryDisplayName: string;
  industrySlug: IndustrySlug;
  ctaLabel: string;
  ctaLink: string;
  currency: string;
  metricsLoading: boolean;
  metrics: Record<string, MetricValue | undefined> & {
    revenue?: MetricValue;
    orders?: MetricValue;
    customers?: MetricValue;
    custom?: Record<string, number | string>;
  };
  dashboardWidgets: {
    id: string;
    title: string;
    type: string;
    w?: number;
    dataSource?: string;
  }[];
  enabledExtensionIds: string[];
}

export function DashboardLegacyContent(props: DashboardLegacyContentProps) {
  const {
    storeName,
    industryDisplayName,
    industrySlug,
    ctaLabel,
    ctaLink,
    currency,
    metricsLoading,
    metrics,
    dashboardWidgets,
    enabledExtensionIds,
  } = props;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Overview for ${storeName} • ${industryDisplayName.toLowerCase()}`}
        leadingIcon="LayoutDashboard"
        rightSlot={
          <Link href={ctaLink}>
            <Button size="lg" className="rounded-xl">
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              {ctaLabel}
            </Button>
          </Link>
        }
      />

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(dashboardWidgets || []).map((widget) => {
          if (widget.id === "setup_checklist") return null;
          if (widget.type === "stat") {
            let icon = "Activity";
            const title = widget.title;
            let value: string | number = "—";

            if (widget.id === "sales_today" || widget.id === "revenue_today") {
              const amount =
                metrics.revenue?.value || metrics[widget.id]?.value || 0;
              value = formatCurrency(Number(amount), currency);
              icon = "DollarSign";
            } else if (
              widget.id === "orders_pending" ||
              widget.id === "active_orders" ||
              widget.id === "total_orders"
            ) {
              value = metrics.orders?.value || metrics[widget.id]?.value || 0;
              icon = "ShoppingBag";
            } else if (
              widget.id === "customers_count" ||
              widget.id === "total_leads" ||
              widget.id === "total_inquiries"
            ) {
              value =
                metrics.customers?.value || metrics[widget.id]?.value || 0;
              icon = "Users";
            } else if (
              widget.id === "active_listings" ||
              widget.id === "active_stays" ||
              widget.id === "total_posts" ||
              widget.id === "active_services" ||
              widget.id === "active_assets" ||
              widget.id === "active_events" ||
              widget.id === "total_projects" ||
              widget.id === "active_campaigns"
            ) {
              value = metrics[widget.id]?.value || 0;
              icon = "FileText";
            } else if (
              widget.id === "upcoming_bookings" ||
              widget.id === "upcoming_reservations" ||
              widget.id === "total_viewings"
            ) {
              value = metrics[widget.id]?.value || 0;
              icon = "Calendar";
            } else if (
              widget.id === "tickets_sold" ||
              widget.id === "total_downloads" ||
              widget.id === "total_donations"
            ) {
              value = metrics[widget.id]?.value || 0;
              icon = "Activity";
            } else if (
              widget.id === "total_reads" ||
              widget.id === "total_views"
            ) {
              value = metrics[widget.id]?.value || 0;
              icon = "Eye";
            } else if (widget.id === "avg_read_time") {
              value = metrics.avg_read_time?.value
                ? `${metrics.avg_read_time.value}m`
                : "—";
              icon = "Clock";
            }

            return (
              <div key={widget.id} className={`md:col-span-${widget.w || 1}`}>
                <StatWidget
                  title={title}
                  value={value}
                  loading={metricsLoading}
                  icon={icon}
                />
              </div>
            );
          }
          return null;
        })}

        {/* Extension Widgets (P2) */}
        {extensionRegistry
          .getActiveForStore(industrySlug, enabledExtensionIds)
          .map((ext) =>
            (
              ext.dashboardWidgets as {
                id: string;
                label: string;
                gridCols?: number;
              }[]
            )?.map((widget) => (
              <div
                key={widget.id}
                className={`md:col-span-${widget.gridCols || 1}`}
              >
                <StatWidget
                  title={widget.label}
                  value={
                    metrics[widget.id]?.value ||
                    metrics.custom?.[widget.id] ||
                    "—"
                  }
                  loading={metricsLoading}
                />
              </div>
            )),
          )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SectionCard
          title="Setup"
          description="Complete the essentials to start selling"
          className="p-0"
        >
          <div className="p-6">
            <DashboardSetupChecklist />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
