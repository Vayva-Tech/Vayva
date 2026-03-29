"use client";

import React from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, X } from 'lucide-react';
import cn from 'clsx';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface AlertsModuleProps {
  alerts?: Alert[];
  onDismiss?: (id: string) => void;
  className?: string;
}

/**
 * Universal Alerts Module - Critical notifications
 * Extracted from UniversalProDashboard
 */
export function AlertsModule({
  alerts = [],
  onDismiss,
  className,
}: AlertsModuleProps) {
  if (alerts.length === 0) return null;
  
  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertCircle size={18} className="text-red-600" />,
          text: 'text-red-900',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: <AlertTriangle size={18} className="text-amber-600" />,
          text: 'text-amber-900',
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle size={18} className="text-green-600" />,
          text: 'text-green-900',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <Info size={18} className="text-blue-600" />,
          text: 'text-blue-900',
        };
    }
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        
        return (
          <div
            key={alert.id}
            className={cn(
              'rounded-xl border p-4 flex items-start gap-3',
              styles.bg,
              styles.border
            )}
          >
            <div className="shrink-0">{styles.icon}</div>
            
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-semibold', styles.text)}>
                {alert.title}
              </p>
              <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
              
              {alert.action && (
                <div className="mt-3">
                  {alert.action.href ? (
                    <a
                      href={alert.action.href}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        alert.type === 'error' || alert.type === 'warning'
                          ? 'bg-white text-gray-900 hover:bg-gray-50'
                          : 'bg-white/50 text-gray-700 hover:bg-white'
                      )}
                    >
                      {alert.action.label}
                    </a>
                  ) : (
                    <button
                      onClick={alert.action.onClick}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        alert.type === 'error' || alert.type === 'warning'
                          ? 'bg-white text-gray-900 hover:bg-gray-50'
                          : 'bg-white/50 text-gray-700 hover:bg-white'
                      )}
                    >
                      {alert.action.label}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss alert"
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Pre-configured alert presets for common scenarios
 */
export const AlertPresets = {
  lowInventory: (itemName: string, quantity: number) => ({
    id: `low-inventory-${itemName}`,
    type: 'warning' as const,
    title: 'Low Inventory',
    message: `${itemName} is running low (${quantity} remaining)`,
    action: {
      label: 'Restock now',
      href: '/dashboard/products/restock',
    },
  }),
  
  paymentFailed: (orderId: string, amount: number) => ({
    id: `payment-failed-${orderId}`,
    type: 'error' as const,
    title: 'Payment Failed',
    message: `Payment for order #${orderId} failed (₦${amount.toLocaleString()})`,
    action: {
      label: 'Retry payment',
      onClick: () => console.log('Retry payment'),
    },
  }),
  
  newFeature: (featureName: string) => ({
    id: `new-feature-${featureName}`,
    type: 'info' as const,
    title: 'New Feature Available',
    message: `${featureName} is now available! Try it out to boost your productivity.`,
    action: {
      label: 'Learn more',
      href: `/features/${featureName.toLowerCase()}`,
    },
  }),
  
  milestone: (description: string) => ({
    id: `milestone-${description}`,
    type: 'success' as const,
    title: 'Milestone Achieved! 🎉',
    message: description,
  }),
};
