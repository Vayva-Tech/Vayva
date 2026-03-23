// @ts-nocheck
import type { IndustryDashboardDefinition } from '@vayva/industry-core';

export const BLOG_MEDIA_DASHBOARD_CONFIG: IndustryDashboardDefinition = {
  industry: 'blog_media',
  title: 'Content Studio',
  subtitle: 'Publish consistently and grow your audience',
  primaryObjectLabel: 'Post',
  defaultTimeHorizon: 'week',
  sections: [
    'primary_object_health',
    'live_operations',
    'decision_kpis',
    'bottlenecks_alerts',
    'suggested_actions',
  ],

  primaryObjectHealth: [
    {
      key: 'publishedPosts',
      label: 'Published Posts',
      format: 'number',
      icon: 'FileText',
    },
    {
      key: 'draftPosts',
      label: 'Drafts',
      format: 'number',
      icon: 'PenLine',
    },
    {
      key: 'scheduledPosts',
      label: 'Scheduled',
      format: 'number',
      icon: 'Calendar',
    },
  ],

  liveOps: [
    {
      key: 'postsThisWeek',
      label: 'Posts This Week',
      format: 'number',
      icon: 'FileText',
      emptyText: 'No posts yet',
    },
    {
      key: 'subscriberCount',
      label: 'Subscribers',
      format: 'number',
      icon: 'Users',
      emptyText: 'No subscribers',
    },
    {
      key: 'pendingComments',
      label: 'Comments Pending',
      format: 'number',
      icon: 'MessageSquare',
      emptyText: 'All caught up',
    },
  ],

  alertThresholds: [
    {
      key: 'daysSinceLastPost',
      label: 'Publishing Gap',
      operator: 'gte',
      value: 7,
      severity: 'warning',
      message: '{count} days since last post — consistency matters',
    },
    {
      key: 'lowEngagementRate',
      label: 'Low Engagement',
      operator: 'lte',
      value: 30,
      severity: 'info',
      message: 'Engagement rate at {value}% — consider content review',
    },
    {
      key: 'highUnsubscribeRate',
      label: 'High Unsubscribes',
      operator: 'gte',
      value: 5,
      severity: 'warning',
      message: 'Unsubscribe rate at {value}% this week',
    },
  ],

  suggestedActionRules: [
    {
      id: 'publish_draft',
      title: 'Publish a draft',
      reason: 'Keep your audience engaged',
      conditionKey: 'hasDraftPosts',
      severity: 'info',
      href: '/dashboard/posts',
      icon: 'Send',
    },
    {
      id: 'moderate_comments',
      title: 'Review pending comments',
      reason: 'Engage with your readers',
      conditionKey: 'hasPendingComments',
      severity: 'info',
      href: '/dashboard/comments',
      icon: 'MessageSquare',
    },
    {
      id: 'schedule_content',
      title: 'Schedule upcoming content',
      reason: 'Maintain publishing consistency',
      conditionKey: 'hasEmptyCalendarDays',
      severity: 'info',
      href: '/dashboard/calendar',
      icon: 'Calendar',
    },
    {
      id: 'send_newsletter',
      title: 'Send weekly digest',
      reason: 'Keep subscribers engaged',
      conditionKey: 'hasRecentPosts',
      severity: 'info',
      href: '/dashboard/newsletter',
      icon: 'Mail',
    },
  ],

  failureModes: [
    'Inconsistent publishing',
    'Audience stagnation',
    'Low engagement rates',
    'Poor monetization',
  ],
};

// Premium Glass Theme Configuration
export const BLOG_MEDIA_THEMES = {
  professionalBlue: {
    name: 'Professional Blue',
    colors: {
      backgroundPrimary: '#0F0F1A',
      backgroundSecondary: '#1A1A2E',
      backgroundTertiary: 'rgba(255, 255, 255, 0.03)',
      accentPrimary: '#4A90E2',
      accentSecondary: '#5BA0F2',
      accentTertiary: '#7BB3F0',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.5)',
    },
    statusColors: {
      published: '#10B981',
      draft: '#F59E0B',
      scheduled: '#3B82F6',
      idea: '#6B7280',
    },
  },
  contentCreatorPurple: {
    name: 'Content Creator Purple',
    colors: {
      backgroundPrimary: '#1A142A',
      backgroundSecondary: '#2D2440',
      backgroundTertiary: 'rgba(167, 139, 250, 0.05)',
      accentPrimary: '#A78BFA',
      accentSecondary: '#C4B5FD',
      accentTertiary: '#DDD6FE',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.5)',
    },
    statusColors: {
      published: '#10B981',
      draft: '#F59E0B',
      scheduled: '#3B82F6',
      idea: '#6B7280',
    },
  },
  writersGreen: {
    name: "Writer's Green",
    colors: {
      backgroundPrimary: '#0A1F0F',
      backgroundSecondary: '#14331F',
      backgroundTertiary: 'rgba(16, 185, 129, 0.05)',
      accentPrimary: '#10B981',
      accentSecondary: '#34D399',
      accentTertiary: '#6EE7B7',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.5)',
    },
    statusColors: {
      published: '#10B981',
      draft: '#F59E0B',
      scheduled: '#3B82F6',
      idea: '#6B7280',
    },
  },
  mediaOrange: {
    name: 'Media Orange',
    colors: {
      backgroundPrimary: '#1A0F0A',
      backgroundSecondary: '#331A14',
      backgroundTertiary: 'rgba(249, 115, 22, 0.05)',
      accentPrimary: '#F97316',
      accentSecondary: '#FB923C',
      accentTertiary: '#FDBA74',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.5)',
    },
    statusColors: {
      published: '#10B981',
      draft: '#F59E0B',
      scheduled: '#3B82F6',
      idea: '#6B7280',
    },
  },
  publishersTeal: {
    name: "Publisher's Teal",
    colors: {
      backgroundPrimary: '#0A1F1A',
      backgroundSecondary: '#14332E',
      backgroundTertiary: 'rgba(20, 184, 166, 0.05)',
      accentPrimary: '#14B8A6',
      accentSecondary: '#2DD4BF',
      accentTertiary: '#5EEAD4',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.5)',
    },
    statusColors: {
      published: '#10B981',
      draft: '#F59E0B',
      scheduled: '#3B82F6',
      idea: '#6B7280',
    },
  },
};
