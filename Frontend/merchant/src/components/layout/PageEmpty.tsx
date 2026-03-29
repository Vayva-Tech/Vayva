/**
 * PageEmpty Component (Enhanced)
 * 
 * Empty state component with actionable CTAs.
 * Follows unified design system with consistent spacing, colors, and typography.
 * 
 * Features:
 * - Multiple action buttons support
 * - Customizable icon with background
 * - Accessible (ARIA labels, focus states)
 * - Responsive layout
 */

'use client';

import React from 'react';
import { Button, type ButtonProps } from '@vayva/ui';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  icon?: LucideIcon | React.ComponentType<any>;
  primary?: boolean;
}

export interface PageEmptyProps {
  icon?: LucideIcon | React.ComponentType<any>;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  className?: string;
  /** Show illustration */
  showIllustration?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function PageEmpty({
  icon: Icon,
  title,
  description,
  actions,
  className,
  showIllustration = false,
  size = 'md',
}: PageEmptyProps): React.JSX.Element {
  const sizeClasses = {
    sm: {
      container: 'p-6',
      icon: 'w-10 h-10',
      title: 'text-lg',
      description: 'text-sm',
      actionsGap: 'gap-2',
    },
    md: {
      container: 'p-8',
      icon: 'w-14 h-14',
      title: 'text-xl',
      description: 'text-base',
      actionsGap: 'gap-3',
    },
    lg: {
      container: 'p-12',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg',
      actionsGap: 'gap-4',
    },
  };

  const config = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-200',
        config.container,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon/Illustration */}
      {Icon && (
        <div
          className={cn(
            'flex items-center justify-center mb-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-600',
            config.icon
          )}
          aria-hidden="true"
        >
          <Icon weight="fill" />
        </div>
      )}

      {/* Optional illustration */}
      {showIllustration && (
        <div className="mb-6 w-full max-w-xs">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-auto"
            aria-hidden="true"
          >
            <rect x="50" y="50" width="300" height="200" rx="12" fill="#F3F4F6" />
            <rect x="80" y="80" width="240" height="40" rx="6" fill="#E5E7EB" />
            <rect x="80" y="140" width="180" height="24" rx="4" fill="#E5E7EB" />
            <rect x="80" y="180" width="140" height="24" rx="4" fill="#E5E7EB" />
            <circle cx="280" cy="192" r="30" fill="#10B981" opacity="0.2" />
            <path
              d="M280 177 L280 207 M265 192 L295 192"
              stroke="#10B981"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Title */}
      <h2 className={cn('font-semibold text-gray-900 mb-2', config.title)}>
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className={cn('text-gray-600 mb-6 max-w-md', config.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className={cn('flex flex-wrap items-center justify-center gap-2', config.actionsGap)}>
          {actions.map((action, index) => {
            const buttonContent = (
              <>
                {action.icon && <action.icon size={16} />}
                <span>{action.label}</span>
              </>
            );

            if (action.href) {
              return (
                <a
                  key={index}
                  href={action.href}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
                    action.primary || action.variant === 'default'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  )}
                >
                  {buttonContent}
                </a>
              );
            }

            return (
              <Button
                key={index}
                variant={action.primary ? 'default' : (action.variant || 'outline')}
                size={action.size || 'default'}
                onClick={action.onClick}
                className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                {buttonContent}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Compact Empty State for cards and small containers
 */
export function EmptyStateCompact({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon | React.ComponentType<any>;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {Icon && (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 mb-3">
          <Icon size={20} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-3 max-w-xs">{description}</p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="rounded-xl"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
