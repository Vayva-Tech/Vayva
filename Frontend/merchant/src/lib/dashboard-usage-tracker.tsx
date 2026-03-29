// ============================================================================
// Dashboard Usage Analytics Tracker
// ============================================================================
// Tracks dashboard interactions, widget engagement, and feature usage
// Provides insights for optimizing dashboard experience across industries
// ============================================================================

'use client';

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';
import { trackEvents } from '@/lib/analytics';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface DashboardInteraction {
  eventType: 'dashboard_view' | 'widget_interaction' | 'metric_click' | 'filter_change' | 'export_action';
  dashboardType: string;
  industry: string;
  widgetId?: string;
  widgetType?: string;
  metricName?: string;
  filterType?: string;
  exportFormat?: string;
  timestamp?: Date;
  duration?: number; // Time spent in milliseconds
  metadata?: Record<string, unknown>;
}

export interface WidgetEngagement {
  widgetId: string;
  widgetType: string;
  viewCount: number;
  interactionCount: number;
  avgViewDuration: number;
  lastInteracted: Date;
  conversionActions?: number; // Clicks on CTAs within widget
}

export interface DashboardUsageMetrics {
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  mostUsedWidgets: string[];
  leastUsedWidgets: string[];
  popularFilters: string[];
  exportCount: number;
  peakUsageHours: number[];
}

// ============================================================================
// Analytics Service
// ============================================================================

export interface DashboardTrackerUser {
  id: string;
  fullName?: string;
  storeId: string;
}

class DashboardUsageTracker {
  private static instance: DashboardUsageTracker;
  private sessionStartTime: Date | null = null;
  private interactions: DashboardInteraction[] = [];
  private widgetEngagement: Map<string, WidgetEngagement> = new Map();
  private user: DashboardTrackerUser | null = null;
  private storeId: string | null = null;
  private flushInterval: ReturnType<typeof setTimeout> | null = null;
  private readonly FLUSH_INTERVAL_MS = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): DashboardUsageTracker {
    if (!DashboardUsageTracker.instance) {
      DashboardUsageTracker.instance = new DashboardUsageTracker();
    }
    return DashboardUsageTracker.instance;
  }

  // Initialize tracker with user context
  initialize(user: DashboardTrackerUser, storeId: string): void {
    this.user = user;
    this.storeId = storeId;
    this.sessionStartTime = new Date();
    
    // Start periodic flush
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
    
    logger.info('[DASHBOARD_ANALYTICS] Initialized', { userId: user.id, storeId });
  }

  // Track dashboard view
  trackDashboardView(industry: string, dashboardType: string): void {
    if (!this.sessionStartTime) {
      logger.warn('[DASHBOARD_ANALYTICS] Not initialized');
      return;
    }

    const interaction: DashboardInteraction = {
      eventType: 'dashboard_view',
      dashboardType,
      industry,
      timestamp: new Date(),
      metadata: {
        sessionId: this.generateSessionId(),
      },
    };

    this.interactions.push(interaction);
    this.sendToAnalytics('Dashboard Viewed', {
      userId: this.user?.id,
      industry,
      dashboardType,
      storeId: this.storeId,
    });
  }

  // Track widget interaction
  trackWidgetInteraction(
    widgetId: string,
    widgetType: string,
    industry: string,
    dashboardType: string,
    action?: string,
    metadata?: Record<string, unknown>
  ): void {
    const interaction: DashboardInteraction = {
      eventType: 'widget_interaction',
      dashboardType,
      industry,
      widgetId,
      widgetType,
      timestamp: new Date(),
      metadata,
    };

    this.interactions.push(interaction);
    this.updateWidgetEngagement(widgetId, widgetType, 'interaction');
    
    this.sendToAnalytics('Widget Interacted', {
      userId: this.user?.id,
      widgetId,
      widgetType,
      industry,
      action,
      storeId: this.storeId,
    });
  }

  // Track metric click
  trackMetricClick(metricName: string, widgetId: string, industry: string): void {
    const interaction: DashboardInteraction = {
      eventType: 'metric_click',
      dashboardType: industry,
      industry,
      widgetId,
      metricName,
      timestamp: new Date(),
    };

    this.interactions.push(interaction);
    this.sendToAnalytics('Metric Clicked', {
      userId: this.user?.id,
      metricName,
      widgetId,
      industry,
      storeId: this.storeId,
    });
  }

  // Track filter change
  trackFilterChange(filterType: string, filterValue: string, industry: string): void {
    const interaction: DashboardInteraction = {
      eventType: 'filter_change',
      dashboardType: industry,
      industry,
      filterType,
      timestamp: new Date(),
      metadata: { filterValue },
    };

    this.interactions.push(interaction);
    this.sendToAnalytics('Filter Changed', {
      userId: this.user?.id,
      filterType,
      filterValue,
      industry,
      storeId: this.storeId,
    });
  }

  // Track export action
  trackExport(exportFormat: string, dataType: string, industry: string): void {
    const interaction: DashboardInteraction = {
      eventType: 'export_action',
      dashboardType: industry,
      industry,
      exportFormat,
      timestamp: new Date(),
      metadata: { dataType },
    };

    this.interactions.push(interaction);
    this.sendToAnalytics('Data Exported', {
      userId: this.user?.id,
      exportFormat,
      dataType,
      industry,
      storeId: this.storeId,
    });
  }

  // Update widget engagement metrics
  private updateWidgetEngagement(
    widgetId: string,
    widgetType: string,
    action: 'view' | 'interaction'
  ): void {
    const now = new Date();
    const existing = this.widgetEngagement.get(widgetId);

    if (existing) {
      if (action === 'interaction') {
        existing.interactionCount++;
        existing.lastInteracted = now;
      } else {
        existing.viewCount++;
      }
      // Update average view duration
      existing.avgViewDuration = this.calculateAvgViewDuration(existing);
    } else {
      this.widgetEngagement.set(widgetId, {
        widgetId,
        widgetType,
        viewCount: action === 'view' ? 1 : 0,
        interactionCount: action === 'interaction' ? 1 : 0,
        avgViewDuration: 0,
        lastInteracted: now,
      });
    }
  }

  // Calculate average view duration
  private calculateAvgViewDuration(widget: WidgetEngagement): number {
    if (!this.sessionStartTime || widget.viewCount === 0) return 0;
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    return sessionDuration / widget.viewCount;
  }

  // Send event to analytics provider (Mixpanel/Amplitude)
  private async sendToAnalytics(eventName: string, properties: Record<string, unknown>): Promise<void> {
    try {
      await trackEvents.featureUsed(
        this.user?.id || 'anonymous',
        eventName,
        properties
      );
    } catch (error) {
      logger.error('[DASHBOARD_ANALYTICS] Failed to send event:', error);
    }
  }

  // Flush accumulated interactions
  async flush(): Promise<void> {
    if (this.interactions.length === 0) return;

    try {
      // Batch send interactions
      await fetch('/analytics/dashboard-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: this.storeId,
          userId: this.user?.id,
          interactions: this.interactions,
          widgetEngagement: Object.fromEntries(this.widgetEngagement),
          timestamp: new Date().toISOString(),
        }),
      });

      logger.info(`[DASHBOARD_ANALYTICS] Flushed ${this.interactions.length} interactions`);
      this.interactions = [];
    } catch (error) {
      logger.error('[DASHBOARD_ANALYTICS] Flush failed:', error);
    }
  }

  // Get usage metrics
  getUsageMetrics(): DashboardUsageMetrics {
    const widgets = Array.from(this.widgetEngagement.values());
    
    return {
      totalViews: this.interactions.filter(i => i.eventType === 'dashboard_view').length,
      uniqueVisitors: 1, // Simplified - would need server-side aggregation
      avgSessionDuration: this.sessionStartTime 
        ? Date.now() - this.sessionStartTime.getTime() 
        : 0,
      mostUsedWidgets: widgets
        .sort((a, b) => b.interactionCount - a.interactionCount)
        .slice(0, 5)
        .map(w => w.widgetId),
      leastUsedWidgets: widgets
        .sort((a, b) => a.interactionCount - b.interactionCount)
        .slice(0, 5)
        .map(w => w.widgetId),
      popularFilters: [], // Would require aggregation
      exportCount: this.interactions.filter(i => i.eventType === 'export_action').length,
      peakUsageHours: [], // Would require historical data
    };
  }

  // Cleanup on unmount
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// React Hook for Dashboard Tracking
// ============================================================================

function useTrackerUser(): DashboardTrackerUser | null {
  const { user, merchant } = useAuth();
  return useMemo(() => {
    if (!user?.id) return null;
    const storeId = merchant?.storeId ?? user.storeId ?? '';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined;
    return { id: user.id, fullName, storeId };
  }, [user, merchant]);
}

export function useDashboardTracking(
  industry: string,
  dashboardType: string,
  enabled = true
) {
  const trackerUser = useTrackerUser();
  const trackerRef = useRef<DashboardUsageTracker | null>(null);

  useEffect(() => {
    if (!enabled || !trackerUser) return;

    const tracker = DashboardUsageTracker.getInstance();
    tracker.initialize(trackerUser, trackerUser.storeId);
    trackerRef.current = tracker;

    // Track initial view
    tracker.trackDashboardView(industry, dashboardType);

    // Cleanup on unmount
    return () => {
      tracker.destroy();
      trackerRef.current = null;
    };
  }, [enabled, industry, dashboardType, trackerUser]);

  // Return tracking functions
  return {
    trackWidgetInteraction: useCallback(
      (widgetId: string, widgetType: string, action?: string, metadata?: Record<string, unknown>) => {
        trackerRef.current?.trackWidgetInteraction(
          widgetId,
          widgetType,
          industry,
          dashboardType,
          action,
          metadata
        );
      },
      [industry, dashboardType]
    ),

    trackMetricClick: useCallback(
      (metricName: string, widgetId: string) => {
        trackerRef.current?.trackMetricClick(metricName, widgetId, industry);
      },
      [industry]
    ),

    trackFilterChange: useCallback(
      (filterType: string, filterValue: string) => {
        trackerRef.current?.trackFilterChange(filterType, filterValue, industry);
      },
      [industry]
    ),

    trackExport: useCallback(
      (exportFormat: string, dataType: string) => {
        trackerRef.current?.trackExport(exportFormat, dataType, industry);
      },
      [industry]
    ),

    getMetrics: useCallback(() => {
      return trackerRef.current?.getUsageMetrics();
    }, []),
  };
}

// ============================================================================
// Higher-Order Component for Auto-Tracking
// ============================================================================

export function withDashboardTracking<P extends object & { industry?: string }>(
  WrappedComponent: React.ComponentType<P>,
  dashboardType: string
) {
  return function TrackedDashboard(props: P) {
    const industry = props.industry ?? 'retail';
    const tracking = useDashboardTracking(industry, dashboardType);

    // Auto-track render
    useEffect(() => {
      tracking.trackWidgetInteraction('dashboard', 'container', 'render');
    }, [tracking]);

    return <WrappedComponent {...props} {...tracking} />;
  };
}

export default DashboardUsageTracker;
