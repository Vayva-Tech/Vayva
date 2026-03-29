"use client";

import { useState, useEffect } from "react";
import { Card, Button, Icon, Badge, cn } from "@vayva/ui";
import { BeautyMetricCard } from "./BeautyMetricCard";
import { StylistAvailability } from "./StylistAvailability";
import { TodaysSchedule } from "./TodaysSchedule";
import { ServiceMenuPerformance } from "./ServiceMenuPerformance";
import { ProductRecommendations } from "./ProductRecommendations";
import { ClientInsights } from "./ClientInsights";
import { BeforeAfterGallery } from "./BeforeAfterGallery";
import { AIInsightsPanel } from "./AIInsightsPanel";
import type { IndustryOverviewDefinition } from "@/types/dashboard";

interface BeautyDashboardProps {
  definition: IndustryOverviewDefinition;
  designCategory?: string;
}

interface OverviewData {
  revenue: number;
  appointments: number;
  completedAppointments: number;
  currentClients: number;
  stylistsOnDuty: number;
  totalStylists?: number;
  productSales: number;
  walkins?: number;
  noShows?: number;
  lowStockCount?: number;
  revenueGrowth?: number;
  appointmentsGrowth?: number;
  clientsGrowth?: number;
  stylistsGrowth?: number;
  productSalesGrowth?: number;
}

export function BeautyDashboard({ definition, designCategory = "glass" }: BeautyDashboardProps) {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [stylistsData, setStylistsData] = useState<any>(null);
  const [servicesData, setServicesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch overview data
        const overviewRes = await fetch("/beauty/dashboard/overview");
        const overviewJson = await overviewRes.json();
        if (overviewJson.success) {
          setOverviewData({
            ...overviewJson.data,
            revenueGrowth: 15.3,
            appointmentsGrowth: 22.1,
            clientsGrowth: 18.4,
            stylistsGrowth: 0,
            productSalesGrowth: 12.5,
          });
        }

        // Fetch stylist availability
        const stylistsRes = await fetch("/beauty/stylists/availability");
        const stylistsJson = await stylistsRes.json();
        if (stylistsJson.success) {
          setStylistsData(stylistsJson.data);
        }

        // Fetch service performance
        const servicesRes = await fetch("/beauty/services/performance");
        const servicesJson = await servicesRes.json();
        if (servicesJson.success) {
          setServicesData(servicesJson.data);
        }
      } catch (error) {
        console.error("Error fetching beauty dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const salonName = definition?.title || "Salon";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{salonName}</h1>
          <p className="text-gray-500">{today}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-button">
            <Icon name="FileText" className="w-4 h-4 mr-2" />
            Today's Report
          </Button>
          <Button className="bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white border-0">
            <Icon name="Plus" className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="glass-panel p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="success" className="bg-green-500/20 text-green-300 border-green-500/30">
              Open Now
            </Badge>
            <span className="text-gray-500">
              Next Availability: <span className="text-white font-medium">2:30 PM</span>
            </span>
            <span className="text-gray-500">
              Stylists on Duty: <span className="text-white font-medium">{overviewData?.stylistsOnDuty || 0}/{overviewData?.totalStylists || 0}</span>
            </span>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <BeautyMetricCard
          title="Revenue"
          value={`$${(overviewData?.revenue || 0).toLocaleString()}`}
          trend={overviewData?.revenueGrowth || 0}
          icon="DollarSign"
          isLoading={isLoading}
        />
        <BeautyMetricCard
          title="Appointments"
          value={(overviewData?.appointments || 0).toString()}
          trend={overviewData?.appointmentsGrowth || 0}
          icon="Calendar"
          isLoading={isLoading}
        />
        <BeautyMetricCard
          title="Clients"
          value={(overviewData?.currentClients || 0).toString()}
          trend={overviewData?.clientsGrowth || 0}
          icon="Users"
          isLoading={isLoading}
        />
        <BeautyMetricCard
          title="Stylists"
          value={`${overviewData?.stylistsOnDuty || 0}/${overviewData?.totalStylists || 0}`}
          trend={overviewData?.stylistsGrowth || 0}
          icon="Star"
          isLoading={isLoading}
        />
        <BeautyMetricCard
          title="Retail Sales"
          value={`$${(overviewData?.productSales || 0).toLocaleString()}`}
          trend={overviewData?.productSalesGrowth || 0}
          icon="ShoppingBag"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <TodaysSchedule
            appointments={overviewData?.appointments || 0}
            currentClients={overviewData?.currentClients || 0}
            walkins={overviewData?.walkins || 0}
            noShows={overviewData?.noShows || 0}
            isLoading={isLoading}
          />

          {/* Service Menu Performance */}
          <ServiceMenuPerformance
            topServices={servicesData?.topServices || []}
            categoryBreakdown={servicesData?.categoryBreakdown || {}}
            isLoading={isLoading}
          />

          {/* Product Recommendations */}
          <ProductRecommendations
            products={[]}
            lowStockCount={overviewData?.lowStockCount || 0}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stylist Availability */}
          <StylistAvailability
            stylists={stylistsData?.stylists || []}
            summary={stylistsData?.summary || { total: 0, busy: 0, available: 0 }}
            stationStatus={stylistsData?.stationStatus || { busy: 0, free: 0, soon: 0 }}
            topPerformer={stylistsData?.topPerformer}
            utilization={stylistsData?.overallUtilization || 0}
            isLoading={isLoading}
          />

          {/* Before/After Gallery */}
          <BeforeAfterGallery
            photos={[]}
            pendingApproval={0}
            isLoading={isLoading}
          />

          {/* Client Insights */}
          <ClientInsights
            newClients={32}
            regularClients={48}
            vipClients={20}
            retentionRate={78}
            avgLifetimeValue={1842}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* AI Insights Panel (Pro Tier) */}
      <AIInsightsPanel
        insights={[
          {
            type: "recommendation",
            title: "Promote balayage for spring season",
            reason: "Based on: 45% increase in requests, seasonal trend",
            predictedImpact: "+$2,400 revenue in next 30 days",
            actions: ["Create Promotion", "View Details"],
          },
        ]}
        isProTier={true}
      />
    </div>
  );
}
