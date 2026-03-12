import React, { type ReactNode } from 'react';

interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  role?: string;
}

interface KeyboardProps {
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyPress?: (event: React.KeyboardEvent) => void;
}

/**
 * Higher-order component that adds accessibility enhancements
 */
export function withAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultAriaLabel?: string
) {
  return function AccessibleComponent(props: P & AccessibilityProps & KeyboardProps) {
    const {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      role = 'button',
      tabIndex = 0,
      ...rest
    } = props;

    const handleKeyDown = (event: React.KeyboardEvent) => {
      // Allow Enter and Space keys to trigger the component
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        (event.target as HTMLElement).click();
      }
    };

    return (
      <WrappedComponent
        {...(rest as P)}
        role={role}
        aria-label={ariaLabel || defaultAriaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
      />
    );
  };
}

/**
 * Utility function to generate accessible descriptions for metrics
 */
export function getMetricDescription(
  label: string,
  value: string | number,
  trend: 'up' | 'down' | 'neutral',
  trendValue: number
): string {
  const trendDescription =
    trend === 'up'
      ? 'increased by'
      : trend === 'down'
      ? 'decreased by'
      : 'remained stable at';

  return `${label} is ${value}, ${trendDescription} ${Math.abs(trendValue).toFixed(1)} percent`;
}

/**
 * Skip link component for keyboard navigation
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background-primary focus:text-text-primary focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
