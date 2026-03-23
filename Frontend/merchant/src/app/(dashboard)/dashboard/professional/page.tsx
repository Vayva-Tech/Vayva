// @ts-nocheck
"use client";

import React from "react";
import { Card, Button } from "@vayva/ui";
import { toast } from "sonner";
import {
  Briefcase,
  Clock,
  FileText,
  Calendar,
  Users,
  TrendUp as TrendingUp,
  WarningCircle as AlertCircle,
  CheckCircle,
  Plus,
  ArrowsClockwise as RefreshCw,
  CurrencyDollar,
  File as Document,
  ShieldCheck,
  ChartBar,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useProfessionalDashboard, useProfessionalAnalytics } from "@/hooks/useProfessionalServices";
import { useThemedStyles } from "@/context/ThemeContext";
import { FirmOverview } from "@/components/professional/FirmOverview";
import { MatterPipeline } from "@/components/professional/MatterPipeline";
import { ClientPortfolio } from "@/components/professional/ClientPortfolio";

export default function ProfessionalDashboardPage() {
  const { data, loading, error, refresh, lastUpdated } = useProfessionalDashboard();
  const { data: analytics } = useProfessionalAnalytics('month');
  const { professionalCard, button, buttonOutline } = useThemedStyles('dashboard');

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading professional dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Error Loading Dashboard</p>
          <p className="text-sm mb-4">{error}</p>
          <Button onClick={() => void refresh()}>Retry</Button>
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
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Professional Services Dashboard
          </h1>
          <p className="text-gray-700 mt-1">
            Law Firm & Professional Services Management | {new Date().toLocaleDateString('en-US', { 
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
          <Button variant="outline" onClick={() => void refresh()} className={buttonOutline}>
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </Button>
          <Button className={button}>
            <Plus size={18} className="mr-2" />
            New Matter
          </Button>
          <Button variant="outline" className={buttonOutline}>
            <FileText size={18} className="mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Firm Status Bar */}
      {data && (
        <Card className={`${professionalCard} p-4 bg-gradient-to-r from-blue-950/30 to-purple-950/30 border-blue-500/20`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Briefcase size={24} className="text-blue-600" />
                <span className="font-medium text-gray-900">
                  {data.firmOverview.activeMatters} Active Matters
                </span>
              </div>
              <div className="text-gray-700">|</div>
              <div className="flex items-center gap-2">
                <ChartBar size={18} className="text-purple-600" />
                <span className="text-gray-700">
                  Utilization: {data.firmOverview.utilizationRate}%
                </span>
              </div>
              <div className="text-gray-700">|</div>
              <div className="flex items-center gap-2">
                <CurrencyDollar size={18} className="text-green-600" />
                <span className="text-gray-700">
                  Revenue MTD: ${(data.firmOverview.revenueMTD / 1000).toFixed(1)}K
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-700">
                New This Month: {data.firmOverview.newMattersThisMonth}
              </span>
              <span className="text-gray-700">
                Target: {data.firmOverview.utilizationTarget}%
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Grid - 3 Columns for Professional Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Core Operations */}
        <div className="space-y-6">
          <FirmOverview data={data?.firmOverview} />
          <MatterPipeline data={data?.matterPipeline} />
          <ClientPortfolio data={data?.clientPortfolio} />
        </div>

        {/* Middle Column - Documentation & Compliance */}
        <div className="space-y-6">
          <Card className={professionalCard}>
            <div className="p-6 text-center text-gray-700">
              <Document size={48} className="mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-medium mb-2">Time & Billing</h3>
              <p className="text-sm mb-4">Track billable hours and generate invoices</p>
              <Button variant="outline" className={buttonOutline}>Manage Time</Button>
            </div>
          </Card>
          
          <Card className={professionalCard}>
            <div className="p-6 text-center text-gray-700">
              <FileText size={48} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">Document Status</h3>
              <p className="text-sm mb-4">Monitor document workflows and signatures</p>
              <Button variant="outline" className={buttonOutline}>View Documents</Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Strategic & Compliance */}
        <div className="space-y-6">
          <Card className={professionalCard}>
            <div className="p-6 text-center text-gray-700">
              <ShieldCheck size={48} className="mx-auto mb-4 text-purple-500" />
              <h3 className="text-lg font-medium mb-2">Compliance & Conflicts</h3>
              <p className="text-sm mb-4">Manage conflicts and ensure compliance</p>
              <Button variant="outline" className={buttonOutline}>Check Conflicts</Button>
            </div>
          </Card>
          
          <Card className={`${professionalCard} border-l-4 border-l-yellow-500`}>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-yellow-600" />
                Action Required
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border border-yellow-100">
                  <span className="text-sm text-yellow-800">Review timesheets</span>
                  <span className="text-xs text-yellow-600">Due today</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-100">
                  <span className="text-sm text-blue-800">Approve invoice write-offs</span>
                  <span className="text-xs text-blue-600">3 pending</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-100">
                  <span className="text-sm text-red-800">Conflicts check review</span>
                  <span className="text-xs text-red-600">5 items</span>
                </div>
              </div>
              <Button className={`${button} w-full mt-4`}>View All Actions</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}