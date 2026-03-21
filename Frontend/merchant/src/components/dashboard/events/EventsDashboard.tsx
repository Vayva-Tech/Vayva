// @ts-nocheck
"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import { VayvaThemeProvider, type DesignCategory } from "@/components/vayva-ui/VayvaThemeProvider";
import { EventHeader } from "./EventHeader";
import { EventsKpiRow } from "./EventsKpiRow";
import { LiveTicketSales } from "./LiveTicketSales";
import { EventTimeline } from "./EventTimeline";
import { AttendeeCheckIn } from "./AttendeeCheckIn";
import { SponsorShowcase } from "./SponsorShowcase";
import { VendorsLogistics } from "./VendorsLogistics";
import { MarketingPerformance } from "./MarketingPerformance";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { apiJson } from "@/lib/api-client-shared";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface EventsDashboardProps {
  eventId?: string;
  planTier?: "basic" | "standard" | "advanced" | "pro";
}

const fetcher = <T,>(url: string) => apiJson<T>(url);

export function EventsDashboard({ eventId, planTier = "basic" }: EventsDashboardProps) {
  const designCategory: DesignCategory = "bold";
  const isPro = planTier === "advanced" || planTier === "pro";

  // Fetch dashboard data
  const { data: dashboardData, error: dashboardError } = useSWR(
    eventId ? `/api/dashboard/events?eventId=${eventId}` : "/api/dashboard/events",
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch live sales
  const { data: liveSalesData, error: liveSalesError } = useSWR(
    eventId ? `/api/events/tickets/sales/live?eventId=${eventId}&limit=5` : null,
    fetcher,
    { refreshInterval: 10000 } // Refresh every 10 seconds for live feel
  );

  // Fetch check-in stats
  const { data: checkInData, error: checkInError } = useSWR(
    eventId ? `/api/events/attendees/checkins/stats?eventId=${eventId}` : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  // Fetch sponsors
  const { data: sponsorsData, error: sponsorsError } = useSWR(
    eventId ? `/api/events/sponsors?eventId=${eventId}` : null,
    fetcher
  );

  // Fetch vendors
  const { data: vendorsData, error: vendorsError } = useSWR(
    eventId ? `/api/events/vendors?eventId=${eventId}` : null,
    fetcher
  );

  // Fetch marketing performance
  const { data: marketingData, error: marketingError } = useSWR(
    eventId ? `/api/events/marketing/performance?eventId=${eventId}` : null,
    fetcher
  );

  // Fetch AI insights (Pro only)
  const { data: aiData, error: aiError } = useSWR(
    isPro && eventId ? `/api/events/ai/insights?eventId=${eventId}` : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !dashboardData && !dashboardError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-bold text-lg">Failed to load dashboard</p>
        <p className="text-gray-600 mt-2">{dashboardError.message}</p>
      </div>
    );
  }

  const hasActiveEvent = dashboardData?.data?.hasActiveEvent;

  return (
    <VayvaThemeProvider designCategory={designCategory}>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Header */}
          <EventHeader 
            event={dashboardData?.data?.event} 
            planTier={planTier}
          />

          {!hasActiveEvent ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Active Events
              </h2>
              <p className="text-gray-500 mb-4">
                Create your first event to see the dashboard
              </p>
            </div>
          ) : (
            <>
              {/* KPI Row */}
              <EventsKpiRow 
                metrics={dashboardData?.data?.metrics} 
                planTier={planTier}
              />

              {/* Main Content Grid - 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Live Ticket Sales */}
                  <LiveTicketSales 
                    data={liveSalesData?.data}
                    dashboardData={dashboardData?.data}
                  />

                  {/* Attendee Check-in */}
                  <AttendeeCheckIn 
                    data={checkInData?.data}
                  />

                  {/* Vendors & Logistics */}
                  <VendorsLogistics 
                    data={vendorsData?.data}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Event Timeline */}
                  <EventTimeline 
                    data={dashboardData?.data?.eventTimeline}
                  />

                  {/* Sponsor Showcase */}
                  <SponsorShowcase 
                    data={sponsorsData?.data}
                  />

                  {/* Marketing Performance */}
                  <MarketingPerformance 
                    data={marketingData?.data}
                  />
                </div>
              </div>

              {/* AI Insights Panel (Pro Tier Only) */}
              {isPro && (
                <AIInsightsPanel 
                  data={aiData?.data}
                  loading={!aiData && !aiError}
                />
              )}
            </>
          )}
        </div>
      </div>
    </VayvaThemeProvider>
  );
}
