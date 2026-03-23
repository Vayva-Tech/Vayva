// @ts-nocheck
'use client';

import React from 'react';

export interface StatusBadgeVariant {
  /** Visual variant for the badge */
  variant: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default' | 'secondary' | 'outline';
  /** Display label */
  label: string;
  /** Optional icon component */
  icon?: React.ComponentType<{className?: string}>;
  /** Optional description */
  description?: string;
}

export interface StatusBadgeProps {
  /** Current status value */
  status: string;
  
  /** Custom status variants mapping */
  variants?: Record<string, StatusBadgeVariant>;
  
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  
  /** Click handler */
  onClick?: () => void;
  
  /** Tooltip text */
  tooltip?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Design category */
  designCategory?: 'light' | 'dark' | 'bold';
}

// Default status variants
const DEFAULT_VARIANTS: Record<string, StatusBadgeVariant> = {
  ACTIVE: { variant: 'success', label: 'Active' },
  INACTIVE: { variant: 'secondary', label: 'Inactive' },
  PENDING: { variant: 'pending', label: 'Pending' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'error', label: 'Rejected' },
  DRAFT: { variant: 'info', label: 'Draft' },
  PUBLISHED: { variant: 'success', label: 'Published' },
  ARCHIVED: { variant: 'secondary', label: 'Archived' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  FAILED: { variant: 'error', label: 'Failed' },
  PROCESSING: { variant: 'pending', label: 'Processing' },
};

export function StatusBadge({
  status,
  variants = {},
  size = 'medium',
  onClick,
  tooltip,
  className = '',
  designCategory = 'light',
}: StatusBadgeProps) {
  // Merge default variants with custom ones
  const allVariants = { ...DEFAULT_VARIANTS, ...variants };
  
  // Get the variant configuration
  const config = allVariants[status.toUpperCase()] || { 
    variant: 'default', 
    label: status 
  };

  // Size classes
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-0.5 text-xs',
    large: 'px-3 py-1 text-sm',
  };

  // Variant styles based on design category
  const getVariantStyles = (variant: string) => {
    const baseStyles = {
      light: {
        success: 'bg-green-100 text-green-800 border border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        error: 'bg-red-100 text-red-800 border border-red-200',
        info: 'bg-blue-100 text-blue-800 border border-blue-200',
        pending: 'bg-purple-100 text-purple-800 border border-purple-200',
        default: 'bg-gray-100 text-gray-800 border border-gray-200',
        secondary: 'bg-gray-50 text-gray-600 border border-gray-200',
        outline: 'bg-transparent text-gray-700 border border-gray-300',
      },
      dark: {
        success: 'bg-green-900/30 text-green-400 border border-green-800/50',
        warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50',
        error: 'bg-red-900/30 text-red-400 border border-red-800/50',
        info: 'bg-blue-900/30 text-blue-400 border border-blue-800/50',
        pending: 'bg-purple-900/30 text-purple-400 border border-purple-800/50',
        default: 'bg-gray-900/30 text-gray-400 border border-gray-800/50',
        secondary: 'bg-gray-900/20 text-gray-500 border border-gray-800/30',
        outline: 'bg-transparent text-gray-400 border border-gray-700',
      },
      bold: {
        success: 'bg-green-500 text-white border border-green-600',
        warning: 'bg-yellow-500 text-white border border-yellow-600',
        error: 'bg-red-500 text-white border border-red-600',
        info: 'bg-blue-500 text-white border border-blue-600',
        pending: 'bg-purple-500 text-white border border-purple-600',
        default: 'bg-gray-500 text-white border border-gray-600',
        secondary: 'bg-gray-400 text-white border border-gray-500',
        outline: 'bg-transparent text-gray-900 border-2 border-gray-900',
      },
    };
    
    return baseStyles[designCategory][variant as keyof typeof baseStyles.light] || 
           baseStyles[designCategory].default;
  };

  const badgeClasses = `
    inline-flex items-center rounded-full font-medium
    ${sizeClasses[size]}
    ${getVariantStyles(config.variant)}
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `.trim();

  const Icon = config.icon;

  return (
    <span 
      className={badgeClasses}
      onClick={onClick}
      title={tooltip}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {Icon && (
        <Icon className={`mr-1.5 ${size === 'large' ? 'w-4 h-4' : 'w-3 h-3'}`} />
      )}
      <span className="truncate">{config.label}</span>
      {config.description && (
        <span className="ml-2 text-xs opacity-75 hidden sm:inline">
          {config.description}
        </span>
      )}
    </span>
  );
}

// Helper function to create custom variants
export function createStatusVariants(
  customVariants: Record<string, Omit<StatusBadgeVariant, 'label'> & { label?: string }>
): Record<string, StatusBadgeVariant> {
  const result: Record<string, StatusBadgeVariant> = {};
  
  Object.entries(customVariants).forEach(([key, variant]) => {
    result[key.toUpperCase()] = {
      ...variant,
      label: variant.label || key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
    };
  });
  
  return result;
}