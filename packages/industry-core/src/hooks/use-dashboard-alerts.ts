'use client';

// ============================================================================
// useDashboardAlerts Hook
// ============================================================================
// Fetches and subscribes to dashboard alerts
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import type { Alert, IndustrySlug } from "../types";

interface UseDashboardAlertsOptions {
  storeId?: string;
  severity?: string[];
  enabled?: boolean;
}

interface UseDashboardAlertsReturn {
  alerts: Alert[];
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
}

/**
 * useDashboardAlerts - Hook for managing dashboard alerts
 *
 * Fetches active alerts for a dashboard and provides filtering by severity.
 * In production, this would also set up WebSocket subscriptions for real-time updates.
 *
 * @example
 * ```tsx
 * const { alerts, criticalCount, dismissAlert } = useDashboardAlerts('fashion', { storeId: '123' });
 * ```
 */
export function useDashboardAlerts(
  industry: IndustrySlug,
  options: UseDashboardAlertsOptions = {}
): UseDashboardAlertsReturn {
  const { storeId, severity, enabled = true } = options;
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!storeId) {
      setError(new Error("Store ID is required"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ storeId });
      if (severity) {
        severity.forEach((s) => params.append("severity", s));
      }

      const response = await fetch(
        `/api/v1/dashboard/${industry}/alerts?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [industry, storeId, severity]);

  useEffect(() => {
    if (enabled) {
      fetchAlerts();
    }
  }, [enabled, fetchAlerts]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;

  return {
    alerts,
    criticalCount,
    warningCount,
    infoCount,
    isLoading,
    error,
    refetch: fetchAlerts,
    dismissAlert,
  };
}
