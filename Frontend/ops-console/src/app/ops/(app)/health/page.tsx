"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  HardDrives as Server,
  Database,
  ArrowCounterClockwise as RefreshCw,
  Pulse as Activity,
  CheckCircle,
  XCircle,
  Warning as AlertTriangle,
  Spinner as Loader2,
  Lightning,
  Globe,
  EnvelopeSimple,
  CreditCard,
  Brain,
  FileText,
  Layout,
  ChatCircle,
  Clock,
  Gear,
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface ServiceCheck {
  name: string;
  status: "UP" | "DOWN" | "DEGRADED" | "NOT_CONFIGURED";
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

interface HealthReport {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  timestamp: string;
  uptime: string;
  services: {
    core: ServiceCheck[];
    external: ServiceCheck[];
    integrations: ServiceCheck[];
  };
  summary: {
    total: number;
    up: number;
    down: number;
    degraded: number;
    notConfigured: number;
  };
}

const categoryIcons = {
  core: Database,
  external: Globe,
  integrations: Lightning,
};

const categoryTitles = {
  core: "Core Infrastructure",
  external: "External Services",
  integrations: "Integrations",
};

const serviceIcons: Record<
  string,
  React.ComponentType<{ size?: number | string; className?: string }>
> = {
  "PostgreSQL Database": Database,
  "Redis Cache": Server,
  "File Storage": FileText,
  "Email Service": EnvelopeSimple,
  "Paystack Payments": CreditCard,
  "Groq AI": Brain,
  "Fraud Webhook": ShieldCheck,
  "Merchant Admin": Layout,
  "WhatsApp Gateway": ChatCircle,
  "Evolution Manager": Gear,
};

export default function SystemHealthPage(): React.JSX.Element {
  const [data, setData] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ops/health/detailed");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        setData(json);
        setError(json.error || "Health check returned an error");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : String(err) || "Failed to reach health endpoint",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "UP":
        return <CheckCircle className="text-green-500" size={20} />;
      case "DEGRADED":
        return <AlertTriangle className="text-amber-500" size={20} />;
      case "NOT_CONFIGURED":
        return <AlertTriangle className="text-gray-400" size={20} />;
      default:
        return <XCircle className="text-red-500" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      UP: "bg-green-50 text-green-700 border-green-200",
      DOWN: "bg-red-50 text-red-700 border-red-200",
      DEGRADED: "bg-amber-50 text-amber-700 border-amber-200",
      NOT_CONFIGURED: "bg-gray-100 text-gray-600 border-gray-300",
    };
    const labels = {
      UP: "Operational",
      DOWN: "Down",
      DEGRADED: "Degraded",
      NOT_CONFIGURED: "Not Configured",
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[status as keyof typeof styles] || styles.DOWN}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "bg-green-50 text-green-700 border-green-200";
      case "DEGRADED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const renderServiceCard = (service: ServiceCheck) => {
    const Icon = serviceIcons[service.name] || Server;
    return (
      <div
        key={service.name}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow gap-3"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
            <Icon size={20} className="text-gray-600" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <h4 className="font-medium text-gray-900 text-sm break-words">{service.name}</h4>
            {service.message && (
              <p className="text-xs text-gray-500 break-words mt-0.5">{service.message}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 mt-2 sm:mt-0">
          {service.responseTime && service.status === "UP" && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              {service.responseTime}ms
            </span>
          )}
          <div className="flex items-center gap-2">
            {getStatusIcon(service.status)}
            {getStatusBadge(service.status)}
          </div>
        </div>
      </div>
    );
  };

  const renderCategory = (category: keyof HealthReport["services"], services: ServiceCheck[]) => {
    const Icon = categoryIcons[category];
    const upCount = services.filter((s) => s.status === "UP").length;
    const totalCount = services.length;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon size={20} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-900">{categoryTitles[category]}</h2>
          </div>
          <span className="text-sm text-gray-500">
            {upCount}/{totalCount} operational
          </span>
        </div>
        <div className="space-y-3">
          {services.map(renderServiceCard)}
        </div>
      </div>
    );
  };

  return (
    <OpsPageShell
      title="System Health"
      description="Real-time infrastructure status and service monitoring"
      headerActions={
        <Button
          variant="outline"
          size="icon"
          onClick={fetchHealth}
          disabled={loading}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Refresh system health status"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
        </Button>
      }
    >
      {/* Loading State */}
      {loading && !data && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error State */}
      {error && !data && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <XCircle className="mx-auto text-red-400 mb-3" size={32} />
          <p className="text-sm font-medium text-red-700">{error}</p>
          <Button
            variant="link"
            onClick={fetchHealth}
            className="mt-3 text-xs text-red-600 h-auto p-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Health Report */}
      {data && (
        <div className="space-y-6">
          {/* Overall Status Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Status */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={24} className="text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Platform Status</h2>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase border ${getOverallStatusColor(data.status)}`}
                >
                  {data.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Service Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg min-h-[80px]">
                  <div className="text-2xl font-bold text-green-600 leading-none">{data?.summary?.up}</div>
                  <div className="text-xs text-green-700 mt-1">Operational</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg min-h-[80px]">
                  <div className="text-2xl font-bold text-red-600 leading-none">{data?.summary?.down}</div>
                  <div className="text-xs text-red-700 mt-1">Down</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-lg min-h-[80px]">
                  <div className="text-2xl font-bold text-amber-600 leading-none">{data?.summary?.degraded}</div>
                  <div className="text-xs text-amber-700 mt-1">Degraded</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg min-h-[80px]">
                  <div className="text-2xl font-bold text-gray-600 leading-none">{data?.summary?.notConfigured}</div>
                  <div className="text-xs text-gray-700 mt-1">Not Configured</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => window.open("/ops/alerts", "_self")}
                >
                  <AlertTriangle size={16} className="mr-2" />
                  View Alerts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => window.open("/ops/tools/health", "_self")}
                >
                  <Activity size={16} className="mr-2" />
                  Advanced Diagnostics
                </Button>
              </div>
            </div>
          </div>

          {/* Service Categories */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {renderCategory("core", data.services?.core)}
            {renderCategory("external", data.services?.external)}
            {renderCategory("integrations", data.services?.integrations)}
          </div>
        </div>
      )}
    </OpsPageShell>
  );
}
