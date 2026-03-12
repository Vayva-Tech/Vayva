'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UseBlogDashboardOptions {
  range?: 'today' | 'week' | 'month';
  enabled?: boolean;
  refetchInterval?: number;
}

interface BlogDashboardData {
  metrics: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    postsThisWeek: number;
    postsThisMonth: number;
    totalSubscribers: number;
    activeSubscribers: number;
    newSubscribers: number;
    unsubscribers: number;
    subscriberGrowthRate: number;
    totalPageviews: number;
    uniqueVisitors: number;
    avgEngagementRate: number;
    totalComments: number;
    pendingComments: number;
    avgTimeOnPage: number;
    totalRevenue: number;
    revenueFromContent: number;
    avgRevenuePerPost: number;
    conversionRate: number;
    organicTraffic: number;
    avgKeywordPosition: number;
    topKeywords: any[];
    totalSocialFollowers: number;
    socialEngagements: number;
    socialClicks: number;
  };
  calendarOverview: {
    upcomingPosts: any[];
    publishingStreak: number;
    consistencyScore: number;
    editorialGoals: {
      target: number;
      completed: number;
      percentage: number;
    };
    pipelineStats: {
      ideas: number;
      drafts: number;
      editing: number;
      scheduled: number;
    };
  };
  topContent: {
    posts: any[];
    categories: any[];
  };
}

/**
 * Hook for fetching blog dashboard data with caching and real-time updates
 */
export function useBlogDashboard({
  range = 'month',
  enabled = true,
  refetchInterval = 300000, // 5 minutes
}: UseBlogDashboardOptions = {}) {
  const [cacheStatus, setCacheStatus] = useState<'HIT' | 'MISS' | 'STALE' | null>(null);

  const {
    data,
    isLoading,
    error,
    isRefetching,
    refetch,
  } = useQuery<{ data: BlogDashboardData }>({
    queryKey: ['blog-dashboard', range],
    queryFn: async () => {
      const startTime = Date.now();
      const response = await fetch(`/api/blog/dashboard?range=${range}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      // Determine cache status based on response time
      const fetchTime = Date.now() - startTime;
      setCacheStatus(fetchTime < 100 ? 'HIT' : 'MISS');

      return result;
    },
    enabled,
    refetchInterval,
    staleTime: 60000, // 1 minute
    retry: 2,
  });

  return {
    data: data?.data,
    isLoading,
    isRefetching,
    error,
    cacheStatus,
    refetch,
  };
}

/**
 * Hook for managing real-time dashboard updates via WebSocket
 */
export function useBlogDashboardRealtime() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In production, this would connect to WebSocket
    // For now, we'll simulate with polling
    const pollInterval = setInterval(async () => {
      try {
        // Check for updates
        await queryClient.invalidateQueries({
          queryKey: ['blog-dashboard'],
          exact: false,
        });
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [queryClient]);

  return { isConnected };
}

/**
 * Hook for blog post operations with optimistic updates
 */
export function useBlogPost(storeId: string, postId?: string) {
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', postId],
    queryFn: async () => {
      if (!postId) return null;
      const response = await fetch(`/api/blog/posts/${postId}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const result = await response.json();
      return result.data;
    },
    enabled: !!postId,
  });

  const updatePost = async (data: any) => {
    // Optimistic update
    queryClient.setQueryData(['blog-post', postId], (old: any) => ({
      ...old,
      ...data,
    }));

    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Rollback on error
        queryClient.invalidateQueries({ queryKey: ['blog-post', postId] });
        throw new Error('Failed to update post');
      }

      return await response.json();
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['blog-post', postId] });
      throw error;
    }
  };

  const publishPost = async () => {
    queryClient.setQueryData(['blog-post', postId], (old: any) => ({
      ...old,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    }));

    try {
      const response = await fetch(`/api/blog/posts/${postId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        queryClient.invalidateQueries({ queryKey: ['blog-post', postId] });
        throw new Error('Failed to publish post');
      }

      // Invalidate dashboard to refresh metrics
      queryClient.invalidateQueries({ queryKey: ['blog-dashboard'] });

      return await response.json();
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['blog-post', postId] });
      throw error;
    }
  };

  return {
    post,
    isLoading,
    updatePost,
    publishPost,
  };
}

/**
 * Hook for content calendar with drag-and-drop support
 */
export function useContentCalendar(storeId: string) {
  const queryClient = useQueryClient();

  const { data: calendar, isLoading } = useQuery({
    queryKey: ['content-calendar', storeId],
    queryFn: async () => {
      const response = await fetch('/api/blog/calendar');
      if (!response.ok) throw new Error('Failed to fetch calendar');
      const result = await response.json();
      return result.data;
    },
  });

  const createEvent = async (data: any) => {
    const response = await fetch('/api/blog/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create event');

    queryClient.invalidateQueries({ queryKey: ['content-calendar'] });
    queryClient.invalidateQueries({ queryKey: ['blog-dashboard'] });

    return await response.json();
  };

  const updateEvent = async (id: string, data: any) => {
    const response = await fetch(`/api/blog/calendar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update event');

    queryClient.invalidateQueries({ queryKey: ['content-calendar'] });

    return await response.json();
  };

  const deleteEvent = async (id: string) => {
    const response = await fetch(`/api/blog/calendar/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete event');

    queryClient.invalidateQueries({ queryKey: ['content-calendar'] });
    queryClient.invalidateQueries({ queryKey: ['blog-dashboard'] });

    return await response.json();
  };

  return {
    calendar,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

/**
 * Hook for newsletter subscribers management
 */
export function useNewsletterSubscribers(storeId: string) {
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['newsletter-subscribers', storeId],
    queryFn: async () => {
      const response = await fetch('/api/blog/newsletter/subscribers');
      if (!response.ok) throw new Error('Failed to fetch subscribers');
      const result = await response.json();
      return result.data;
    },
  });

  const addSubscriber = async (data: any) => {
    const response = await fetch('/api/blog/newsletter/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to add subscriber');

    queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    queryClient.invalidateQueries({ queryKey: ['blog-dashboard'] });

    return await response.json();
  };

  const unsubscribe = async (email: string) => {
    const response = await fetch('/api/blog/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) throw new Error('Failed to unsubscribe');

    queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });

    return await response.json();
  };

  return {
    subscribers,
    isLoading,
    addSubscriber,
    unsubscribe,
  };
}
