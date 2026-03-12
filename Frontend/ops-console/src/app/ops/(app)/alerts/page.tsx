"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Bell, Warning as AlertTriangle, WarningCircle as AlertCircle, CheckCircle, Clock, HardDrives as Server, CreditCard, Users, ShoppingBag, ArrowCounterClockwise as RefreshCw, XCircle, Pulse as Activity, Lightning as Zap } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  category: string;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  metadata?: Record<string, any>;
}

interface SystemStatus {
  service: string;
  status: "operational" | "degraded" | "down";
  latency?: number;
  lastCheck: string;
}

interface AlertsData {
  alerts: Alert[];
  systemStatus: SystemStatus[];
  stats: {
    critical: number;
    warning: number;
    info: number;
    resolved24h: number;
  };
}

function AlertIcon({ type }: { type: string }) {
  switch (type) {
    case "critical":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Bell className="h-5 w-5 text-blue-500" />;
  }
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    payment: <CreditCard className="h-4 w-4" />,
    merchant: <Users className="h-4 w-4" />,
    order: <ShoppingBag className="h-4 w-4" />,
    system: <Server className="h-4 w-4" />,
    security: <AlertTriangle className="h-4 w-4" />,
  };
  return icons[category] || <Bell className="h-4 w-4" />;
}

function StatusIndicator({ status }: { status: string }) {
  const styles: Record<string, string> = {
    operational: "bg-green-500",
    degraded: "bg-yellow-500",
    down: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2.5 h-2.5 rounded-full ${styles[status] || "bg-gray-400"} animate-pulse`}
      />
      <span
        className={`text-xs font-bold capitalize ${
          status === "operational"
            ? "text-green-700"
            : status === "degraded"
              ? "text-yellow-700"
              : "text-red-700"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

export default function AlertsPage(): React.JSX.Element {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">(
    "all",
  );

  const { data, isLoading, refetch } = useOpsQuery<AlertsData>(
    ["alerts-data"],
    () => fetch("/api/ops/alerts").then((res) => res.json()),
  );

  const handleAcknowledge = async (alertId: string) => {
    try {
      await fetch(`/api/ops/alerts/${alertId}/acknowledge`, { method: "POST" });
      toast.success("Alert acknowledged");
      refetch();
    } catch {
      toast.error("Failed to acknowledge alert");
    }
  };

  const stats = data?.stats || {
    critical: 0,
    warning: 0,
    info: 0,
    resolved24h: 0,
  };
  const alerts = data?.alerts || [];
  const systemStatus = data?.systemStatus || [];

  const filteredAlerts =
    filter === "all" ? alerts : alerts.filter((a: Alert) => a.type === filter);

  return (
    <OpsPageShell
      title="Alerts & Incidents"
      description="Monitor platform health and respond to incidents"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      }
    >
      {/* Stats Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-4 gap-6">
        <Button
          variant="ghost"
          onClick={() => setFilter("critical")}
          className={`p-5 rounded-xl border-2 text-left transition-all ${
            filter === "critical"
              ? "bg-red-50 border-red-300"
              : "bg-white border-gray-100 shadow-sm hover:border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">Critical</span>
          </div>
          <div className="text-3xl font-black text-red-600">
            {stats.critical}
          </div>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setFilter("warning")}
          className={`p-5 rounded-xl border-2 text-left transition-all ${
            filter === "warning"
              ? "bg-yellow-50 border-yellow-300"
              : "bg-white border-gray-100 shadow-sm hover:border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Warnings</span>
          </div>
          <div className="text-3xl font-black text-yellow-600">
            {stats.warning}
          </div>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setFilter("info")}
          className={`p-5 rounded-xl border-2 text-left transition-all ${
            filter === "info"
              ? "bg-blue-50 border-blue-300"
              : "bg-white border-gray-100 shadow-sm hover:border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Info</span>
          </div>
          <div className="text-3xl font-black text-blue-600">{stats.info}</div>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setFilter("all")}
          className={`p-5 rounded-xl border-2 text-left transition-all ${
            filter === "all"
              ? "bg-green-50 border-green-300"
              : "bg-white border-gray-100 shadow-sm hover:border-green-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">
              Resolved (24h)
            </span>
          </div>
          <div className="text-3xl font-black text-green-600">
            {stats.resolved24h}
          </div>
        </Button>
      </div>
      </section>

      {/* System Status */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          System Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStatus.length === 0 ? (
            <>
              {["API Gateway", "Database", "Paystack", "WhatsApp"].map(
                (service) => (
                  <div
                    key={service}
                    className="p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">
                        {service}
                      </span>
                      <StatusIndicator status="operational" />
                    </div>
                    <div className="text-xs text-gray-500">
                      Last check: just now
                    </div>
                  </div>
                ),
              )}
            </>
          ) : (
            systemStatus.map((service: SystemStatus) => (
              <div
                key={service.service}
                className="p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    {service.service}
                  </span>
                  <StatusIndicator status={service.status} />
                </div>
                {service.latency && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap size={10} /> {service.latency}ms
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  {new Date(service.lastCheck).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </section>

      {/* Alerts List */}
      <section>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            {filter === "all"
              ? "All Alerts"
              : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Alerts`}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredAlerts.length} alerts
          </span>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
            <p className="font-medium">All clear!</p>
            <p className="text-sm">
              No {filter === "all" ? "" : filter} alerts at this time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAlerts.map((alert: Alert) => (
              <div
                key={alert.id}
                className={`p-4 flex items-start gap-4 hover:bg-white/60 transition-colors ${
                  alert.acknowledged ? "opacity-60" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    alert.type === "critical"
                      ? "bg-red-100"
                      : alert.type === "warning"
                        ? "bg-yellow-100"
                        : "bg-blue-100"
                  }`}
                >
                  <AlertIcon type={alert.type} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        alert.type === "critical"
                          ? "bg-red-100 text-red-700"
                          : alert.type === "warning"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {alert?.type?.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <CategoryIcon category={alert.category} />
                      {alert.category}
                    </span>
                    {alert.acknowledged && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Acknowledged
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>

                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock size={12} />
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>

                {!alert.acknowledged && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcknowledge(alert.id)}
                    className="text-xs h-8 shrink-0"
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </section>
    </OpsPageShell>
  );
}
