"use client";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Card, Button } from "@vayva/ui";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import {
  TrendUp as TrendingUp,
  Users,
  UserCirclePlus as UserStar,
  Wine,
  Pulse as Activity,
  Calendar,
  Plus,
  FileText,
} from "@phosphor-icons/react";
import { apiJson } from "@/lib/api-client-shared";
import type { NightlifeMetrics, VenueStatus } from "@/types/nightlife";
import { NightlifeKPICard } from "@/components/nightlife/NightlifeKPICard";
import { TableReservations } from "@/components/nightlife/TableReservations";
import { VIPGuestList } from "@/components/nightlife/VIPGuestList";
import { BottleService } from "@/components/nightlife/BottleService";
import { PromoterPerformance } from "@/components/nightlife/PromoterPerformance";
import { DoorActivity } from "@/components/nightlife/DoorActivity";
import { SecurityLog } from "@/components/nightlife/SecurityLog";
import { AIInsightsPanel } from "@/components/nightlife/AIInsightsPanel";
import { PageHeader } from "@/components/layout/PageHeader";

interface DashboardData {
  metrics: NightlifeMetrics;
  venueStatus?: VenueStatus;
}

export default function NightlifeDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    void loadDashboardData();
    // Refresh data every 60 seconds
    const interval = setInterval(() => {
      void loadDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const result = await apiJson<{
        success?: boolean;
        data?: { metrics: NightlifeMetrics; venueStatus?: VenueStatus };
      }>("/nightlife/dashboard");

      const payload = result?.data;
      if (result?.success !== false && payload?.metrics) {
        setDashboardData({
          metrics: payload.metrics,
          venueStatus: payload.venueStatus ?? {
            isOpen: true,
            capacity: 500,
            currentOccupancy: 342,
            nextEvent: {
              name: "DJ Nexus Live",
              startTime: new Date(),
            },
            staffOnDuty: 24,
            securityActive: true,
          },
        });
        setLastUpdated(new Date());
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_NIGHTLIFE_DASHBOARD_ERROR]", { error: _errMsg });
      toast.error("Failed to load nightlife dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading nightlife dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header - Mobile Responsive */}
      <PageHeader
        title="Nightlife Dashboard"
        subtitle={
          <>
            Elysium Nightclub ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {lastUpdated ? (
              <span className="ml-2 text-[10px] sm:text-xs">• Updated {lastUpdated.toLocaleTimeString()}</span>
            ) : null}
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadDashboardData()}>
              <TrendingUp size={16} className="mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              <span className="hidden sm:inline">New Reservation</span>
              <span className="sm:hidden">New</span>
            </Button>
            <Button variant="outline" size="sm">
              <FileText size={16} className="mr-2" />
              <span className="hidden sm:inline">Night Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </div>
        }
      />

      {/* Venue Status Bar - Mobile Responsive */}
      {dashboardData?.venueStatus && (
        <Card className="p-3 sm:p-4 bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border-cyan-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {dashboardData.venueStatus.isOpen ? "Open Now" : "Closed"}
                </span>
              </div>
              <div className="hidden sm:block text-gray-700">|</div>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-cyan-400 sm:size-18" />
                <span className="text-xs sm:text-sm text-gray-700">
                  Capacity: {Math.round(
                    (dashboardData.venueStatus.currentOccupancy / dashboardData.venueStatus.capacity) * 100
                  )}% ({dashboardData.venueStatus.currentOccupancy}/{dashboardData.venueStatus.capacity})
                </span>
              </div>
              {dashboardData.venueStatus.nextEvent && (
                <>
                  <div className="hidden sm:block text-gray-700">|</div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-purple-400" />
                    <span className="text-xs sm:text-sm text-gray-700">
                      Next: {dashboardData.venueStatus.nextEvent.name} at{" "}
                      {dashboardData.venueStatus.nextEvent.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <span className="text-gray-700">
                Staff: {dashboardData.venueStatus.staffOnDuty}
              </span>
              <span className="text-gray-700">
                Security: {dashboardData.venueStatus.securityActive ? "● On" : "○ Off"}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Row - Mobile Responsive Grid */}
      {dashboardData?.metrics && (
        <ErrorBoundary serviceName="NightlifeKPIs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <NightlifeKPICard
              label="Revenue"
              value={`₦${dashboardData.metrics.revenue.toLocaleString()}`}
              change={`${(dashboardData.metrics.revenueChange ?? 0) > 0 ? '+' : ''}${dashboardData.metrics.revenueChange ?? 0}%`}
              trend={(dashboardData.metrics.revenueChange ?? 0) >= 0 ? 'up' : 'down'}
              icon={<Wine size={24} className="text-cyan-400" />}
              live
            />
            <NightlifeKPICard
              label="Covers"
              value={dashboardData.metrics.covers.toString()}
              change={`${(dashboardData.metrics.coversChange ?? 0) > 0 ? '+' : ''}${dashboardData.metrics.coversChange ?? 0}%`}
              trend={(dashboardData.metrics.coversChange ?? 0) >= 0 ? 'up' : 'down'}
              icon={<Users size={24} className="text-purple-400" />}
              live
            />
            <NightlifeKPICard
              label="VIP Guests"
              value={dashboardData.metrics.vipCount.toString()}
              change={`${(dashboardData.metrics.vipCountChange ?? 0) > 0 ? '+' : ''}${dashboardData.metrics.vipCountChange ?? 0}%`}
              trend={(dashboardData.metrics.vipCountChange ?? 0) >= 0 ? 'up' : 'down'}
              icon={<UserStar size={24} className="text-yellow-400" />}
              live
            />
            <NightlifeKPICard
              label="Bottle Sales"
              value={dashboardData.metrics.bottleSales.toString()}
              change={`${(dashboardData.metrics.bottleSalesChange ?? 0) > 0 ? '+' : ''}${dashboardData.metrics.bottleSalesChange ?? 0}%`}
              trend={(dashboardData.metrics.bottleSalesChange ?? 0) >= 0 ? 'up' : 'down'}
              icon={<Wine size={24} className="text-pink-400" />}
              live
            />
            <NightlifeKPICard
              label="Occupancy"
              value={`${dashboardData.metrics.occupancyRate}%`}
              change={`${(dashboardData.metrics.occupancyChange ?? 0) > 0 ? '+' : ''}${dashboardData.metrics.occupancyChange ?? 0}%`}
              trend={(dashboardData.metrics.occupancyChange ?? 0) >= 0 ? 'up' : 'down'}
              icon={<Activity size={24} className="text-green-400" />}
              live
            />
          </div>
        </ErrorBoundary>
      )}

      {/* Main Content Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-6">
          <ErrorBoundary serviceName="TableReservations">
            <TableReservations />
          </ErrorBoundary>
          <ErrorBoundary serviceName="BottleService">
            <BottleService />
          </ErrorBoundary>
          <ErrorBoundary serviceName="DoorActivity">
            <DoorActivity />
          </ErrorBoundary>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          <ErrorBoundary serviceName="VIPGuestList">
            <VIPGuestList />
          </ErrorBoundary>
          <ErrorBoundary serviceName="PromoterPerformance">
            <PromoterPerformance />
          </ErrorBoundary>
          <ErrorBoundary serviceName="SecurityLog">
            <SecurityLog />
          </ErrorBoundary>
        </div>
      </div>

      {/* AI Insights Panel (Pro Tier) */}
      <ErrorBoundary serviceName="AIInsightsPanel">
        <AIInsightsPanel planTier="pro" />
      </ErrorBoundary>
    </motion.div>
  );
}
