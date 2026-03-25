'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TravelAnalyticsService as _TravelAnalyticsService,
  TravelPropertyService as _TravelPropertyService,
  ReviewService,
  PerformanceBenchmarkingService
} from '../services';
import {
  OccupancyMetrics,
  RevenueReport,
  GuestDemographics,
  BenchmarkData,
  AnalyticsQueryOptions
} from '../services/analytics-service';
import { TravelProperty } from '../types';
import { Review } from '../services/review-service';

// Note: These services would normally be injected via React Context or API routes
// For client-side usage, they should call API endpoints instead of direct DB access
const reviewService = new ReviewService();
const benchmarkService = new PerformanceBenchmarkingService();

// Hook return types
interface UseTravelDashboardDataReturn {
  // Analytics Data
  occupancyMetrics: OccupancyMetrics | null;
  revenueReport: RevenueReport | null;
  guestDemographics: GuestDemographics | null;
  benchmarkData: BenchmarkData | null;
  
  // Property Data
  properties: TravelProperty[];
  propertyLoading: boolean;
  
  // Review Data
  recentReviews: Review[];
  reviewLoading: boolean;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Refresh Functions
  refreshAll: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshProperties: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  
  // Real-time Updates
  subscribeToUpdates: (callback: () => void) => () => void;
}

export const useTravelDashboardData = (tenantId?: string): UseTravelDashboardDataReturn => {
  const [occupancyMetrics, setOccupancyMetrics] = useState<OccupancyMetrics | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [guestDemographics, setGuestDemographics] = useState<GuestDemographics | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [properties, setProperties] = useState<TravelProperty[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [propertyLoading, setPropertyLoading] = useState<boolean>(true);
  const [reviewLoading, setReviewLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers] = useState<Set<() => void>>(new Set());

  // Analytics query options
  const _analyticsOptions: AnalyticsQueryOptions = {
    propertyIds: tenantId ? undefined : undefined, // Filter by tenant if provided
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    }
  };

  // Fetch analytics data - would call API endpoints in production
  const fetchAnalyticsData = useCallback(async () => {
    try {
      // In production, replace with actual API calls:
      // const response = await fetch(`/api/travel/analytics?tenantId=${tenantId}`);
      // For now, using placeholder data
      setOccupancyMetrics(null);
      setRevenueReport(null);
      setGuestDemographics(null);
      setBenchmarkData(await benchmarkService.getBenchmarkData(tenantId));
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    }
  }, [tenantId]);

  // Fetch properties - would call API endpoints in production
  const fetchProperties = useCallback(async () => {
    try {
      setPropertyLoading(true);
      // In production, replace with actual API call:
      // const response = await fetch(`/api/travel/properties?tenantId=${tenantId}`);
      // const data = await response.json();
      setProperties([]);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setPropertyLoading(false);
    }
  }, [tenantId]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setReviewLoading(true);
      const { reviews } = await reviewService.getReviews(
        { status: 'approved' },
        1,
        10
      );
      setRecentReviews(reviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setReviewLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchAnalyticsData(),
          fetchProperties(),
          fetchReviews()
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchAnalyticsData, fetchProperties, fetchReviews]);

  // Real-time updates subscription
  const subscribeToUpdates = useCallback((callback: () => void) => {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  }, [subscribers]);

  // Notify all subscribers
  const notifySubscribers = useCallback(() => {
    subscribers.forEach(callback => callback());
  }, [subscribers]);

  // Refresh functions
  const refreshAll = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([
        fetchAnalyticsData(),
        fetchProperties(),
        fetchReviews()
      ]);
      notifySubscribers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  }, [fetchAnalyticsData, fetchProperties, fetchReviews, notifySubscribers]);

  const refreshAnalytics = useCallback(async () => {
    setError(null);
    try {
      await fetchAnalyticsData();
      notifySubscribers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics');
    }
  }, [fetchAnalyticsData, notifySubscribers]);

  const refreshProperties = useCallback(async () => {
    setError(null);
    try {
      await fetchProperties();
      notifySubscribers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh properties');
    }
  }, [fetchProperties, notifySubscribers]);

  const refreshReviews = useCallback(async () => {
    setError(null);
    try {
      await fetchReviews();
      notifySubscribers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh reviews');
    }
  }, [fetchReviews, notifySubscribers]);

  // Polling for real-time updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAnalytics(); // Refresh key metrics periodically
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  return {
    // Data
    occupancyMetrics,
    revenueReport,
    guestDemographics,
    benchmarkData,
    properties,
    recentReviews,
    
    // Loading states
    isLoading,
    propertyLoading,
    reviewLoading,
    
    // Error
    error,
    
    // Refresh functions
    refreshAll,
    refreshAnalytics,
    refreshProperties,
    refreshReviews,
    
    // Real-time updates
    subscribeToUpdates
  };
};