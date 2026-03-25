"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@vayva/ui";
import { retailDashboardConfig } from "../dashboard/config";
import { registerRetailWidgets } from "../widgets/registry";

export interface RetailDashboardProps {
  industry: string;
  variant?: string;
  userId: string;
  businessId: string;
  designCategory?: "signature" | "glass" | "bold" | "dark" | "natural";
  planTier?: "basic" | "standard" | "advanced" | "pro";
}

interface DashboardShellState {
  businessId: string;
  userId: string;
  lastRefreshed: string;
  widgetsLoaded: number;
}

/**
 * Package-local retail dashboard shell. Host apps can wrap this with their own
 * universal layout and data hooks; this component stays free of app-only imports.
 */
export function RetailDashboard({
  industry: _industry,
  variant: _variant = "default",
  userId,
  businessId,
  designCategory: _designCategory = "signature",
  planTier: _planTier = "standard",
}: RetailDashboardProps) {
  const [state, setState] = useState<DashboardShellState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    registerRetailWidgets();
  }, []);

  const refreshMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setState({
        businessId,
        userId,
        lastRefreshed: new Date().toISOString(),
        widgetsLoaded: retailDashboardConfig.widgets.length,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [businessId, userId]);

  useEffect(() => {
    void refreshMetrics();
  }, [refreshMetrics]);

  const subscribeToUpdates = useCallback(() => {
    return () => {};
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToUpdates();
    return () => {
      unsubscribe();
    };
  }, [subscribeToUpdates]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground">Loading retail dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md text-center">
          <h3 className="mb-2 text-lg font-semibold">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button variant="primary" onClick={() => void refreshMetrics()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{retailDashboardConfig.title}</h1>
        <p className="text-muted-foreground mt-1">{retailDashboardConfig.subtitle}</p>
      </div>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          {retailDashboardConfig.primaryObjectLabel}: {state?.widgetsLoaded ?? 0} widgets in config
          {state?.lastRefreshed ? ` · last refresh ${state.lastRefreshed}` : ""}
        </p>
        <Button variant="secondary" className="mt-4" onClick={() => void refreshMetrics()}>
          Refresh
        </Button>
      </Card>
    </div>
  );
}
