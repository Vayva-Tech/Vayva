'use client';

import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

type TicketStatus = 'fresh' | 'cooking' | 'ready' | 'urgent' | 'overdue';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'small' | 'medium';
}

/**
 * StatusBadge Component
 * 
 * Displays colored badge for ticket status with icon
 */
export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const statusConfig = {
    fresh: {
      label: 'Fresh',
      icon: CheckCircle,
      color: 'green',
    },
    cooking: {
      label: 'Cooking',
      icon: Clock,
      color: 'blue',
    },
    ready: {
      label: 'Ready',
      icon: CheckCircle,
      color: 'green',
    },
    urgent: {
      label: 'Urgent',
      icon: AlertTriangle,
      color: 'yellow',
    },
    overdue: {
      label: 'Overdue',
      icon: XCircle,
      color: 'red',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm',
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${sizeClasses[size]}
        ${colorClasses[config.color as keyof typeof colorClasses]}
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
