'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface VayvaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * VayvaButton - Foundation button component
 * Consistent across all industry dashboards
 */
export const VayvaButton = React.forwardRef<HTMLButtonElement, VayvaButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    const variantStyles = {
      primary: `
        bg-[var(--vayva-primary)] 
        text-white 
        hover:bg-[var(--vayva-primary-dark)] 
        shadow-md 
        hover:shadow-lg
        border border-transparent
      `,
      secondary: `
        bg-gray-100 
        text-gray-900 
        hover:bg-gray-200 
        border border-transparent
      `,
      outline: `
        bg-transparent 
        text-[var(--vayva-primary)] 
        border-2 border-[var(--vayva-primary)] 
        hover:bg-[var(--vayva-primary)] 
        hover:text-white
      `,
      ghost: `
        bg-transparent 
        text-gray-700 
        hover:bg-gray-100 
        border border-transparent
      `,
      danger: `
        bg-red-600 
        text-white 
        hover:bg-red-700 
        shadow-md 
        border border-transparent
      `,
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-[var(--vayva-primary)] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          sizeClasses[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        
        {children}
        
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

VayvaButton.displayName = 'VayvaButton';

/**
 * VayvaIconButton - Icon-only button variant
 */
interface VayvaIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const VayvaIconButton = React.forwardRef<HTMLButtonElement, VayvaIconButtonProps>(
  ({ className, variant = 'default', size = 'md', icon, ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    const variantStyles = {
      default: `
        bg-gray-100 
        text-gray-700 
        hover:bg-gray-200
      `,
      ghost: `
        bg-transparent 
        text-gray-600 
        hover:bg-gray-100
      `,
      outline: `
        bg-transparent 
        text-[var(--vayva-primary)] 
        border border-gray-300 
        hover:bg-gray-50
      `,
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--vayva-primary)] focus:ring-offset-2',
          sizeClasses[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

VayvaIconButton.displayName = 'VayvaIconButton';
