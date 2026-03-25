"use client";

import React from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { VayvaThemeProvider, type DesignCategory } from "@/components/vayva-ui/VayvaThemeProvider";
import { EventHeader, type Event as EventRecord } from "./EventHeader";
import type { Metrics as EventsMetrics } from "./EventsKpiRow";
import { EventsKpiRow } from "./EventsKpiRow";
import { LiveTicketSales } from "./LiveTicketSales";
import { EventTimeline } from "./EventTimeline";
import { AttendeeCheckIn } from "./AttendeeCheckIn";
import { SponsorShowcase } from "./SponsorShowcase";
import { VendorsLogistics } from "./VendorsLogistics";
import { MarketingPerformance } from "./MarketingPerformance";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { apiJson } from "@/lib/api-client-shared";

/** API envelope for `/api/dashboard/events` */
interface EventsDashboardApiResponse {
  data?: {
    hasActiveEvent?: boolean;
    event?: EventRecord;
    metrics?: EventsMetrics;
    eventTimeline?: {
      eventDate?: string;
      daysUntilEvent?: number;
      schedule?: unknown[];
      venueCapacity?: number;
      venueLayout?: string;
    };
  };
}

type JsonEnvelope = { data?: unknown };

interface EventsDashboardProps {
  eventId?: string;
  planTier?: "basic" | "standard" | "advanced" | "pro";
}

const fetcher = <T,>(url: string) => apiJson<T>(url);

export function EventsDashboard({ eventId, planTier = "basic" }: EventsDashboardProps) {
  const designCategory: DesignCategory = "bold";
  const isPro = planTier === "advanced" || planTier === "pro";

  // Fetch dashboard data
  const { data: dashboardData, error: dashboardError } = useSWR<EventsDashboardApiResponse>(
    eventId ? `/api/dashboard/events?eventId=${eventId}` : "/api/dashboard/events",
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch live sales
  const { data: liveSalesData, error: liveSalesError } = useSWR<JsonEnvelope>(
    eventId ? `/api/events/tickets/sales/live?eventId=${eventId}&limit=5` : null,
    fetcher,
    { refreshInterval: 10000 } // Refresh every 10 seconds for live feel
  );

  // Fetch check-in stats
  const { data: checkInData, error: checkInError } = useSWR<JsonEnvelope>(
    eventId ? `/api/events/attendees/checkins/stats?eventId=${eventId}` : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  // Fetch sponsors
  const { data: sponsorsData, error: sponsorsError } = useSWR<JsonEnvelope>(
    eventId ? `/api/events/sponsors?eventId=${eventId}` : null,
    fetcher
  );

  // Fetch vendors
  const { data: vendorsData, error: vendorsError } = useSWR<JsonEnvelope>(
    eventId ? `/api/events/vendors?eventId=${eventId}` : null,
    fetcher
  );

  // Fetch marketing performance
  const { data: marketingData, error: marketingError } = useSWR<JsonEnvelope>(
    eventId ? `/api/events/marketing/performance?eventId=${eventId}` : null,
    fetcher
  );

  // Fetch AI insights (Pro only)
  const { data: aiData, error: aiError } = useSWR<JsonEnvelope>(
    isPro && eventId ? `/api/events/ai/insights?eventId=${eventId}` : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  const isLoading = !dashboardData && !dashboardError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" aria-hidden />
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
    <VayvaThemeProvider defaultCategory={designCategory}>
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
                    data={liveSalesData?.data as any}
                    dashboardData={dashboardData?.data}
                  />

                  {/* Attendee Check-in */}
                  <AttendeeCheckIn 
                    data={checkInData?.data as any}
                  />

                  {/* Vendors & Logistics */}
                  <VendorsLogistics 
                    data={vendorsData?.data as any}
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
                    data={sponsorsData?.data as any}
                  />

                  {/* Marketing Performance */}
                  <MarketingPerformance 
                    data={marketingData?.data as any}
                  />
                </div>
              </div>

              {/* AI Insights Panel (Pro Tier Only) */}
              {isPro && (
                <AIInsightsPanel 
                  data={aiData?.data as any}
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
