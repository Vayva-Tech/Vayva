"use client";
import { Button } from "@vayva/ui";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import "@/styles/real-estate-glass.css";
import { DashboardHeader } from "@/components/real-estate/DashboardHeader";
import { KPIRow } from "@/components/real-estate/KPIRow";
import { ActiveListingsMap } from "@/components/real-estate/ActiveListingsMap";
import { LeadPipeline } from "@/components/real-estate/LeadPipeline";
import { CMAGenerator } from "@/components/real-estate/CMAGenerator";
import { AgentPerformance } from "@/components/real-estate/AgentPerformance";
import { UpcomingShowings } from "@/components/real-estate/UpcomingShowings";
import { MarketTrends } from "@/components/real-estate/MarketTrends";
import { AIInsightsPanel } from "@/components/real-estate/AIInsightsPanel";

interface DashboardMetrics {
  revenue: {
    value: number;
    growth: number;
    transactions: number;
  };
  listings: {
    value: number;
    growth: number;
  };
  leads: {
    value: number;
    growth: number;
    byStatus: Record<string, number>;
  };
  showings: {
    value: number;
    growth: number;
  };
  conversion: {
    value: number;
    growth: number;
  };
}

export default function RealEstateDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState("professional-blue");

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/realestate/dashboard/aggregate");
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("An error occurred while fetching dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.body.className = `theme-${newTheme}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[var(--re-bg-green-500)] text-[var(--re-text-green-600)] re-scrollbar"
    >
      {/* Header */}
      <DashboardHeader 
        onThemeChange={handleThemeChange}
        currentTheme={theme}
      />

      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Market Overview */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Market Overview</h2>
              <p className="text-[var(--re-text-secondary)]">
                Downtown Metro Area - March 2026
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="btn-gradient">
                + New Listing
              </Button>
              <Button className="glass-card px-4 py-2 text-[var(--re-text-secondary)] hover:text-white">
                📊 Generate CMA
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="skeleton h-8 w-full" />
          ) : metrics ? (
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-[var(--re-text-tertiary)]">Active Listings:</span>
                <span className="ml-2 font-semibold">{metrics.listings.value}</span>
              </div>
              <div>
                <span className="text-[var(--re-text-tertiary)]">Pending:</span>
                <span className="ml-2 font-semibold">{Math.round(metrics.listings.value * 0.25)}</span>
              </div>
              <div>
                <span className="text-[var(--re-text-tertiary)]">Closed This Month:</span>
                <span className="ml-2 font-semibold">{Math.round(metrics.revenue.transactions)}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* KPI Row */}
        {!loading && metrics && (
          <KPIRow metrics={metrics} />
        )}

        {/* Main Content Grid */}
        <div className="re-grid-2 mt-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Active Listings Map */}
            <ActiveListingsMap />

            {/* CMA Generator */}
            <CMAGenerator />

            {/* Upcoming Showings */}
            <UpcomingShowings />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Lead Pipeline */}
            <LeadPipeline initialData={metrics?.leads.byStatus || {}} />

            {/* Agent Performance */}
            <AgentPerformance />

            {/* Market Trends */}
            <MarketTrends />
          </div>
        </div>

        {/* AI Insights Panel (Pro Tier) */}
        <div className="mt-6">
          <AIInsightsPanel />
        </div>
      </div>
    </motion.div>
  );
}

