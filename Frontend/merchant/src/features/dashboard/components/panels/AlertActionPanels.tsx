/**
 * Alert and Action Panel Components
 * 
 * Display alerts, notifications, and suggested actions
 */

'use client';

import React from 'react';
import { cn, Icon } from '@vayva/ui';
import type { Alert, SuggestedAction } from '../../types';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react';

export interface AlertPanelProps {
  alerts: Alert[];
  title?: string;
  className?: string;
}

/**
 * Alert Panel Component
 */
export function AlertPanel({ alerts, title = 'Alerts', className }: AlertPanelProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Alert Item
 */
export function AlertItem({ alert }: { alert: Alert }) {
  const iconMap = {
    critical: {
      icon: AlertCircle,
      colors: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100',
    },
    warning: {
      icon: AlertTriangle,
      colors: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100',
    },
    info: {
      icon: Info,
      colors: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
    },
  };

  const { icon: IconComponent, colors } = iconMap[alert.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border p-4',
        colors
      )}
    >
      <IconComponent className="mt-0.5 h-5 w-5 flex-shrink-0" />
      
      <div className="flex-1">
        <h4 className="font-medium">{alert.title}</h4>
        <p className="mt-1 text-sm opacity-90">{alert.message}</p>
        
        {alert.action && (
          <button
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            onClick={() => window.location.href = alert.action!.href}
          >
            {alert.action.label}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Action Panel Component
 */
export interface ActionPanelProps {
  actions: SuggestedAction[];
  title?: string;
  className?: string;
}

export function ActionPanel({ actions, title = 'Suggested Actions', className }: ActionPanelProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      
      <div className="space-y-3">
        {actions.map((action) => (
          <ActionItem key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Action Item
 */
export function ActionItem({ action }: { action: SuggestedAction }) {
  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500',
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-md border border-l-4 p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50',
        priorityColors[action.priority]
      )}
    >
      <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-700">
        <Icon name={action.icon as any} className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {action.title}
          </h4>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              action.priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
              action.priority === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
              action.priority === 'low' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            )}
          >
            {action.priority}
          </span>
        </div>
        
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {action.description}
        </p>
        
        {action.action && (
          <button
            onClick={() => window.location.href = action.action!.href}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {action.action.label}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Combined Dashboard Alerts & Actions Panel
 */
export interface DashboardNotificationsProps {
  alerts?: Alert[];
  actions?: SuggestedAction[];
  className?: string;
}

export function DashboardNotifications({
  alerts = [],
  actions = [],
  className,
}: DashboardNotificationsProps) {
  const hasContent = alerts.length > 0 || actions.length > 0;

  if (!hasContent) {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed bg-gray-50 p-8 text-center dark:bg-gray-800/50 dark:border-gray-700',
          className
        )}
      >
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          All Good!
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No alerts or suggested actions at this time.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      {alerts.length > 0 && (
        <AlertPanel alerts={alerts} />
      )}
      {actions.length > 0 && (
        <ActionPanel actions={actions} />
      )}
    </div>
  );
}
