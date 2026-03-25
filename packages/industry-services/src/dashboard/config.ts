// ============================================================================
// Services Dashboard Configuration
// ============================================================================
// Industry-native dashboard for service-based businesses
// Primary Object: Service/Booking
// Focus: Calendar management, bookings, staff utilization
// ============================================================================

import type { DashboardEngineConfig } from "@vayva/industry-core";

export const servicesDashboardConfig: DashboardEngineConfig = {
  industry: "services",
  title: "Bookings & Calendar",
  subtitle: "Fill calendar capacity profitably",
  primaryObjectLabel: "Service",
  defaultTimeHorizon: "today",

  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],

  widgets: [
    // Primary Object Health - Services
    {
      id: "top-booked-services",
      type: "list",
      title: "Top Booked",
      industry: "services",
      dataSource: {
        type: "entity",
        entity: "Service",
        query: "topBooked",
        params: { limit: 5, timeHorizon: "today" },
      },
      permissions: ["read:services"],
    },
    {
      id: "underperforming-services",
      type: "list",
      title: "Underperforming",
      industry: "services",
      dataSource: {
        type: "analytics",
        query: "underperformingServices",
        params: { threshold: 0.3 },
      },
      permissions: ["read:analytics"],
    },

    // Live Operations - Today's Activity
    {
      id: "todays-bookings",
      type: "kpi-card",
      title: "Today's Bookings",
      industry: "services",
      dataSource: {
        type: "entity",
        entity: "Booking",
        query: "countToday",
      },
      permissions: ["read:bookings"],
    },
    {
      id: "cancellations-today",
      type: "kpi-card",
      title: "Cancellations",
      industry: "services",
      dataSource: {
        type: "entity",
        entity: "Booking",
        query: "countCancelled",
        params: { date: "today" },
      },
      permissions: ["read:bookings"],
    },
    {
      id: "no-shows-today",
      type: "kpi-card",
      title: "No-Shows",
      industry: "services",
      dataSource: {
        type: "entity",
        entity: "Booking",
        query: "countNoShows",
        params: { date: "today" },
      },
      permissions: ["read:bookings"],
    },

    // Calendar Widget
    {
      id: "calendar-view",
      type: "calendar",
      title: "Today's Schedule",
      industry: "services",
      dataSource: {
        type: "entity",
        entity: "Booking",
        query: "todaySchedule",
        params: { includeStaff: true },
      },
      permissions: ["read:bookings"],
    },

    // Staff Utilization
    {
      id: "staff-utilization",
      type: "gauge",
      title: "Staff Utilization Rate",
      industry: "services",
      dataSource: {
        type: "analytics",
        query: "staffUtilizationRate",
        params: { timeHorizon: "today" },
      },
      permissions: ["read:staff"],
    },
  ],

  layouts: [
    {
      id: "services-default",
      name: "Services Default",
      breakpoints: {
        lg: [
          { i: "todays-bookings", x: 0, y: 0, w: 4, h: 2 },
          { i: "cancellations-today", x: 4, y: 0, w: 4, h: 2 },
          { i: "no-shows-today", x: 8, y: 0, w: 4, h: 2 },
          { i: "top-booked-services", x: 0, y: 2, w: 6, h: 4 },
          { i: "underperforming-services", x: 6, y: 2, w: 6, h: 4 },
          { i: "calendar-view", x: 0, y: 6, w: 8, h: 6 },
          { i: "staff-utilization", x: 8, y: 6, w: 4, h: 3 },
        ],
      },
    },
  ],

  kpiCards: [
    {
      id: "bookings-today",
      label: "Bookings Today",
      format: "number",
      icon: "Calendar",
    },
    {
      id: "revenue",
      label: "Revenue",
      format: "currency",
      icon: "DollarSign",
    },
    {
      id: "utilization-rate",
      label: "Utilization Rate",
      format: "percent",
      icon: "Gauge",
    },
    {
      id: "avg-service-value",
      label: "Avg Service Value",
      format: "currency",
      icon: "TrendingUp",
    },
  ],

  alertRules: [
    {
      id: "empty-slots-alert",
      name: "Empty Slots Tomorrow",
      condition: {
        metric: "emptySlotsNextDay",
        operator: "gte",
        value: 3,
      },
      severity: "warning",
      message: "{count} empty slots tomorrow",
      enabled: true,
    },
    {
      id: "high-no-show-risk",
      name: "High No-Show Risk",
      condition: {
        metric: "noShowRate",
        operator: "gte",
        value: 15,
      },
      severity: "warning",
      message: "No-show rate at {value}% — consider reminders",
      enabled: true,
    },
    {
      id: "low-utilization",
      name: "Low Staff Utilization",
      condition: {
        metric: "staffUtilizationRate",
        operator: "lt",
        value: 50,
      },
      severity: "info",
      message: "Staff utilization at {value}% — optimize scheduling",
      enabled: true,
    },
  ],

  actions: [
    {
      id: "add-availability",
      label: "Add Availability",
      icon: "CalendarPlus",
      href: "/dashboard/bookings",
      description: "Fill empty calendar slots",
      permissions: ["write:bookings"],
    },
    {
      id: "send-reminders",
      label: "Send Booking Reminders",
      icon: "Bell",
      href: "/dashboard/marketing/discounts",
      description: "Reduce no-show rate",
      permissions: ["write:marketing"],
    },
    {
      id: "promote-service",
      label: "Promote Underperforming Service",
      icon: "Megaphone",
      href: "/dashboard/marketing/campaigns",
      description: "Increase utilization",
      permissions: ["write:marketing"],
    },
  ],

  failureModes: ["Empty calendar", "Low utilization", "High no-shows"],
};
