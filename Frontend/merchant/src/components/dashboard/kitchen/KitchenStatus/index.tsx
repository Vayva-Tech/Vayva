'use client';

import React from 'react';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface KitchenStatusProps {
  designCategory?: string;
  industry?: string;
  planTier?: string;
}

/**
 * KitchenStatus Component
 * 
 * Displays key kitchen metrics and status overview
 */
export function KitchenStatus({
  designCategory = 'signature',
  industry = 'food',
  planTier = 'standard'
}: KitchenStatusProps) {
  const { tickets } = useRealTimeKDS();

  // Calculate metrics
  const activeTickets = tickets.filter(t => t.status === 'cooking' || t.status === 'fresh').length;
  const readyTickets = tickets.filter(t => t.status === 'ready').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' || t.status === 'overdue').length;
  
  // Calculate average cook time
  const avgCookTime = tickets.length > 0
    ? Math.round(tickets.reduce((acc, t) => acc + t.timerSeconds, 0) / tickets.length / 60)
    : 0;

  const stats = [
    {
      label: 'Active Tickets',
      value: activeTickets,
      icon: Clock,
      color: 'blue',
      trend: '+8 vs last hour',
      trendDirection: 'neutral' as const,
    },
    {
      label: 'Avg Cook Time',
      value: `${avgCookTime}:${(Math.random() * 60).toFixed(0).padStart(2, '0')}`,
      icon: TrendingUp,
      color: 'green',
      trend: '-1:23 improvement',
      trendDirection: 'up' as const,
    },
    {
      label: 'Urgent Orders',
      value: urgentTickets,
      icon: AlertTriangle,
      color: urgentTickets > 0 ? 'red' : 'green',
      trend: urgentTickets > 0 ? 'Needs attention' : 'All clear',
      trendDirection: urgentTickets > 0 ? 'down' as const : 'up' as const,
    },
    {
      label: 'Ready for Pickup',
      value: readyTickets,
      icon: CheckCircle,
      color: 'green',
      trend: `${readyTickets} orders`,
      trendDirection: 'up' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <Icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              {stat.trendDirection === 'up' && (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
              {stat.trendDirection === 'down' && (
                <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className={`text-xs ${
                stat.trendDirection === 'up' 
                  ? 'text-green-600' 
                  : stat.trendDirection === 'down'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {stat.trend}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
