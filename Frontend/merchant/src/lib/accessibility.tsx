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
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white-primary focus:text-gray-900 focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

/**
 * Autocomplete attribute values for form fields
 * WCAG 2.1 AA Success Criterion 1.3.5 - Identify Input Purpose
 * https://www.w3.org/WAI/WCAG21/Understanding/identify-input-purpose.html
 */
export const AUTOCOMPLETE_VALUES = {
  // Personal information
  name: 'name',
  givenName: 'given-name',
  familyName: 'family-name',
  email: 'email',
  phone: 'tel',
  mobile: 'tel-country-code',
  
  // Shipping address
  shipping: {
    name: 'shipping name',
    fullName: 'shipping name',
    address1: 'shipping address-line1',
    address2: 'shipping address-line2',
    street: 'shipping street-address',
    city: 'shipping address-level2',
    state: 'shipping address-level1',
    postalCode: 'shipping postal-code',
    zip: 'shipping postal-code',
    country: 'shipping country',
    phone: 'shipping tel',
  },
  
  // Billing address
  billing: {
    name: 'billing name',
    fullName: 'billing name',
    address1: 'billing address-line1',
    address2: 'billing address-line2',
    street: 'billing street-address',
    city: 'billing address-level2',
    state: 'billing address-level1',
    postalCode: 'billing postal-code',
    zip: 'billing postal-code',
    country: 'billing country',
    phone: 'billing tel',
  },
  
  // Payment
  payment: {
    cardNumber: 'cc-number',
    cardName: 'cc-name',
    cardExpiry: 'cc-exp',
    cardCvv: 'cc-csc',
  },
  
  // Organization
  organization: 'organization',
  title: 'title',
  
  // Web
  url: 'url',
  photo: 'photo',
  
  // Special
  off: 'off', // Disable autocomplete
} as const;

/**
 * Helper function to get autocomplete value based on field type and context
 */
export function getAutocompleteValue(
  fieldType: keyof typeof AUTOCOMPLETE_VALUES | 'shipping' | 'billing',
  subField?: string
): string {
  const baseValue = AUTOCOMPLETE_VALUES[fieldType];
  
  if (typeof baseValue === 'string') {
    return baseValue;
  }
  
  if (subField && typeof baseValue === 'object' && subField in baseValue) {
    return baseValue[subField as keyof typeof baseValue] as string;
  }
  
  return '';
}
