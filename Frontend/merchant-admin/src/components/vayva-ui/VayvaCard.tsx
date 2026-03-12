'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface VayvaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bold' | 'dark' | 'natural';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

/**
 * VayvaCard - Foundation card component with design category variants
 * Used across all industry dashboards
 */
export const VayvaCard = React.forwardRef<HTMLDivElement, VayvaCardProps>(
  ({ className, variant = 'default', size = 'md', hover = false, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantStyles = {
      default: `
        bg-white 
        border border-gray-200 
        shadow-md
      `,
      glass: `
        bg-white/85 
        backdrop-blur-xl 
        border border-white/40 
        shadow-lg
        [box-shadow:inset_0_1px_0_rgba(255,255,255,0.3)]
      `,
      bold: `
        bg-white 
        border-2 border-black 
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        transition-all duration-200
        ${hover ? 'hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : ''}
      `,
      dark: `
        bg-gray-900/95 
        backdrop-blur-sm 
        border border-indigo-500/20 
        shadow-lg
        [box-shadow:0_0_20px_rgba(99,102,241,0.1),inset_0_0_20px_rgba(99,102,241,0.05)]
      `,
      natural: `
        bg-white 
        border-2 border-[#E7E5B4] 
        shadow-md
        bg-[url('/textures/paper-grain.svg')] 
      `,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-300',
          sizeClasses[size],
          variantStyles[variant],
          hover && variant !== 'bold' && 'hover:shadow-xl hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

VayvaCard.displayName = 'VayvaCard';

/**
 * VayvaCardHeader - Card header section
 */
interface VayvaCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const VayvaCardHeader = React.forwardRef<HTMLDivElement, VayvaCardHeaderProps>(
  ({ className, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between mb-4',
          className
        )}
        {...props}
      >
        <div>{children}</div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

VayvaCardHeader.displayName = 'VayvaCardHeader';

/**
 * VayvaCardTitle - Card title
 */
interface VayvaCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const VayvaCardTitle = React.forwardRef<HTMLHeadingElement, VayvaCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-lg font-semibold text-gray-900',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

VayvaCardTitle.displayName = 'VayvaCardTitle';

/**
 * VayvaCardDescription - Card description/subtitle
 */
interface VayvaCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const VayvaCardDescription = React.forwardRef<HTMLParagraphElement, VayvaCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-sm text-gray-500 mt-1',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

VayvaCardDescription.displayName = 'VayvaCardDescription';

/**
 * VayvaCardContent - Card content area
 */
interface VayvaCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const VayvaCardContent = React.forwardRef<HTMLDivElement, VayvaCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

VayvaCardContent.displayName = 'VayvaCardContent';

/**
 * VayvaCardFooter - Card footer
 */
interface VayvaCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const VayvaCardFooter = React.forwardRef<HTMLDivElement, VayvaCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center pt-4 mt-4 border-t border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

VayvaCardFooter.displayName = 'VayvaCardFooter';
