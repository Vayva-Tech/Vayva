'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiJson } from '@/lib/api-client';

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  category: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  channels: string[];
}

interface NotificationStats {
  total: number;
  unread: number;
  critical: number;
}

interface NotificationPreferences {
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    slack: boolean;
    whatsapp: boolean;
  };
  categories: {
    orders: boolean;
    inventory: boolean;
    payments: boolean;
    appointments: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

interface NotificationRuleContext {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: {
    type: 'event' | 'threshold' | 'schedule' | 'ai-insight';
    event?: string;
    threshold?: {
      metric: string;
      operator: 'greater-than' | 'less-than' | 'equals';
      value: number;
    };
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      days?: string[];
    };
  };
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains';
    value: string | number | boolean;
  }>;
  actions: Array<{
    type: string;
    template: string;
    variables: Record<string, string>;
  }>;
}

interface NotificationContextType {
  // State
  notifications: Notification[];
  stats: NotificationStats;
  preferences: NotificationPreferences;
  rules: NotificationRuleContext[];
  loading: boolean;
  unreadCount: number;
  
  // Methods
  fetchNotifications: (filters?: { unreadOnly?: boolean; category?: string }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (payload: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  addRule: (rule: Omit<NotificationRuleContext, 'id'>) => Promise<NotificationRuleContext>;
  updateRule: (id: string, updates: Partial<NotificationRuleContext>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  fetchRules: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, critical: 0 });
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    channels: {
      email: true,
      sms: false,
      push: true,
      inApp: true,
      slack: false,
      whatsapp: false
    },
    categories: {
      orders: true,
      inventory: true,
      payments: true,
      appointments: true,
      system: true
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC'
    }
  });
  const [rules, setRules] = useState<NotificationRuleContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters: { unreadOnly?: boolean; category?: string } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.unreadOnly) params.append('unread', 'true');
      if (filters.category) params.append('category', filters.category);
      
      const data = await apiJson<{
        items: Notification[];
        total: number;
        unread: number;
      }>(`/api/notifications?${params.toString()}`);
      
      setNotifications(data.items || []);
      setUnreadCount(data.unread || 0);
    } catch (error) {
      console.error('[FETCH_NOTIFICATIONS_ERROR]', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiJson('/api/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ notificationId: id })
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[MARK_AS_READ_ERROR]', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiJson('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('[MARK_ALL_READ_ERROR]', error);
    }
  }, []);

  // Send notification
  const sendNotification = useCallback(async (payload: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      await apiJson('/api/notifications/engine', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('[SEND_NOTIFICATION_ERROR]', error);
      throw error;
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    try {
      const updatedPrefs = { ...preferences, ...prefs };
      await apiJson('/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify({ preferences: updatedPrefs })
      });
      setPreferences(updatedPrefs);
    } catch (error) {
      console.error('[UPDATE_PREFERENCES_ERROR]', error);
      throw error;
    }
  }, [preferences]);

  // Fetch rules
  const fetchRules = useCallback(async () => {
    try {
      const data = await apiJson<{ rules: NotificationRuleContext[] }>('/api/notifications/rules');
      setRules(data.rules || []);
    } catch (error) {
      console.error('[FETCH_RULES_ERROR]', error);
    }
  }, []);

  // Add rule
  const addRule = useCallback(async (rule: Omit<NotificationRuleContext, 'id'>) => {
    try {
      const data = await apiJson<NotificationRuleContext>('/api/notifications/rules', {
        method: 'POST',
        body: JSON.stringify(rule)
      });
      setRules(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('[ADD_RULE_ERROR]', error);
      throw error;
    }
  }, []);

  // Update rule
  const updateRule = useCallback(async (id: string, updates: Partial<NotificationRuleContext>) => {
    try {
      await apiJson(`/api/notifications/rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      setRules(prev => prev.map(rule => rule.id === id ? { ...rule, ...updates } : rule));
    } catch (error) {
      console.error('[UPDATE_RULE_ERROR]', error);
      throw error;
    }
  }, []);

  // Delete rule
  const deleteRule = useCallback(async (id: string) => {
    try {
      await apiJson(`/api/notifications/rules/${id}`, {
        method: 'DELETE'
      });
      setRules(prev => prev.filter(rule => rule.id !== id));
    } catch (error) {
      console.error('[DELETE_RULE_ERROR]', error);
      throw error;
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await apiJson<NotificationStats>('/api/notifications/stats');
      setStats(data);
      setUnreadCount(data.unread);
    } catch (error) {
      console.error('[FETCH_STATS_ERROR]', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void fetchNotifications();
    void fetchRules();
    void fetchStats();
  }, [fetchNotifications, fetchRules, fetchStats]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchStats();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  const value: NotificationContextType = {
    notifications,
    stats,
    preferences,
    rules,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
    updatePreferences,
    addRule,
    updateRule,
    deleteRule,
    fetchRules,
    fetchStats
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}