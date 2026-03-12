"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@vayva/ui";
import { toast } from "sonner";
import {
  TrendingUp,
  Users,
  UserStar,
  Wine,
  Activity,
  Calendar,
  Plus,
  FileText,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
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
      // In production, use actual venueId and eventId from context
      const venueId = "venue_123";
      const eventId = "event_456";
      
      const data = await apiJson<{
        metrics: NightlifeMetrics;
        venueStatus?: VenueStatus;
      }>(
        `/api/nightlife/dashboard?venueId=${venueId}&eventId=${eventId}`
      );
      
      if (data?.metrics) {
        setDashboardData({
          metrics: data.metrics,
          venueStatus: data.venueStatus || {
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
      console.error("[LOAD_NIGHTLIFE_DASHBOARD_ERROR]", _errMsg);
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
          <p className="text-text-secondary">Loading nightlife dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs />
          <h1 className="text-3xl font-bold text-text-primary mt-2">
            Nightlife Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            Elysium Nightclub | {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadDashboardData()}>
            <TrendingUp size={18} className="mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus size={18} className="mr-2" />
            New Reservation
          </Button>
          <Button variant="outline">
            <FileText size={18} className="mr-2" />
            Night Report
          </Button>
        </div>
      </div>

      {/* Venue Status Bar */}
      {dashboardData?.venueStatus && (
        <Card className="p-4 bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium text-text-primary">
                  {dashboardData.venueStatus.isOpen ? "Open Now" : "Closed"}
                </span>
              </div>
              <div className="text-text-secondary">|</div>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" />
                <span className="text-text-secondary">
                  Capacity: {Math.round(
                    (dashboardData.venueStatus.currentOccupancy / dashboardData.venueStatus.capacity) * 100
                  )}% ({dashboardData.venueStatus.currentOccupancy}/{dashboardData.venueStatus.capacity})
                </span>
              </div>
              {dashboardData.venueStatus.nextEvent && (
                <>
                  <div className="text-text-secondary">|</div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-purple-400" />
                    <span className="text-text-secondary">
                      Next Event: {dashboardData.venueStatus.nextEvent.name} at{" "}
                      {dashboardData.venueStatus.nextEvent.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-text-secondary">
                Staff: {dashboardData.venueStatus.staffOnDuty} on duty
              </span>
              <span className="text-text-secondary">
                Security: {dashboardData.venueStatus.securityActive ? "● Active" : "○ Inactive"}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Row */}
      {dashboardData?.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <NightlifeKPICard
            label="Revenue"
            value={`₦${dashboardData.metrics.revenue.toLocaleString()}`}
            change={`${dashboardData.metrics.revenueChange > 0 ? '+' : ''}${dashboardData.metrics.revenueChange}%`}
            trend={dashboardData.metrics.revenueChange >= 0 ? 'up' : 'down'}
            icon={<Wine size={24} className="text-cyan-400" />}
            live
          />
          <NightlifeKPICard
            label="Covers"
            value={dashboardData.metrics.covers.toString()}
            change={`${dashboardData.metrics.coversChange > 0 ? '+' : ''}${dashboardData.metrics.coversChange}%`}
            trend={dashboardData.metrics.coversChange >= 0 ? 'up' : 'down'}
            icon={<Users size={24} className="text-purple-400" />}
            live
          />
          <NightlifeKPICard
            label="VIP Guests"
            value={dashboardData.metrics.vipCount.toString()}
            change={`${dashboardData.metrics.vipCountChange > 0 ? '+' : ''}${dashboardData.metrics.vipCountChange}%`}
            trend={dashboardData.metrics.vipCountChange >= 0 ? 'up' : 'down'}
            icon={<UserStar size={24} className="text-yellow-400" />}
            live
          />
          <NightlifeKPICard
            label="Bottle Sales"
            value={dashboardData.metrics.bottleSales.toString()}
            change={`${dashboardData.metrics.bottleSalesChange > 0 ? '+' : ''}${dashboardData.metrics.bottleSalesChange}%`}
            trend={dashboardData.metrics.bottleSalesChange >= 0 ? 'up' : 'down'}
            icon={<Wine size={24} className="text-pink-400" />}
            live
          />
          <NightlifeKPICard
            label="Occupancy"
            value={`${dashboardData.metrics.occupancyRate}%`}
            change={`${dashboardData.metrics.occupancyChange > 0 ? '+' : ''}${dashboardData.metrics.occupancyChange}%`}
            trend={dashboardData.metrics.occupancyChange >= 0 ? 'up' : 'down'}
            icon={<Activity size={24} className="text-green-400" />}
            live
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <TableReservations />
          <BottleService />
          <DoorActivity />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <VIPGuestList />
          <PromoterPerformance />
          <SecurityLog />
        </div>
      </div>

      {/* AI Insights Panel (Pro Tier) */}
      <AIInsightsPanel planTier="pro" />
    </div>
  );
}
