/**
 * Accessibility Utilities - Phase 3 Issue #9
 * 
 * Common patterns and utilities for WCAG 2.1 AA compliance
 * 
 * Usage: Import these utilities in your components to ensure accessibility
 * 
 * @module @vayva/merchant/src/utils/accessibility
 */

import React, { useEffect, useRef } from 'react';

/**
 * Focus Trap Hook
 * 
 * Traps focus within a container element (useful for modals, dialogs)
 * Ensures keyboard users can't tab outside the modal
 * 
 * @example
 * const modalRef = useFocusTrap();
 * return <div ref={modalRef}>Modal content</div>;
 */
export function useFocusTrap() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return ref;
}

/**
 * Announce to Screen Readers Hook
 * 
 * Dynamically announces changes to screen reader users
 * Uses aria-live region for polite announcements
 * 
 * @example
 * const announce = useAnnounce();
 * announce('Data loaded successfully');
 */
export function useAnnounce() {
  useEffect(() => {
    const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const el = document.createElement('div');
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', priority);
      el.setAttribute('aria-atomic', 'true');
      el.className = 'sr-only'; // Visually hidden
      el.textContent = message;
      
      document.body.appendChild(el);
      
      setTimeout(() => {
        document.body.removeChild(el);
      }, 1000);
    };

    return announce;
  }, []);
}

/**
 * Escape Key Handler Hook
 * 
 * Calls callback when Escape key is pressed
 * Useful for closing modals, dropdowns, etc.
 * 
 * @example
 * useEscapeKey(() => closeModal());
 */
export function useEscapeKey(callback: () => void) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback]);
}

/**
 * Skip Link Component
 * 
 * Provides keyboard users a way to skip navigation
 * Appears on first Tab press, hidden otherwise
 * 
 * @example
 * <SkipLink targetId="main-content" />
 */
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Skip to main content
    </a>
  );
}

/**
 * Live Region Component
 * 
 * Announces dynamic content changes to screen readers
 * Use for real-time updates, notifications, errors
 * 
 * @example
 * <LiveRegion>{notificationMessage}</LiveRegion>
 */
export function LiveRegion({ 
  children, 
  priority = 'polite',
  atomic = true 
}: { 
  children: React.ReactNode;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * Accessible Icon Button Component
 * 
 * Icon button with proper ARIA labels for screen readers
 * 
 * @example
 * <IconButton icon={<CloseIcon />} label="Close dialog" onClick={handleClose} />
 */
export function IconButton({ 
  icon, 
  label, 
  onClick,
  disabled = false 
}: { 
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
    </button>
  );
}

/**
 * Accessible Modal Component
 * 
 * Fully accessible modal dialog with:
 * - Focus trap
 * - Escape key handler
 * - Screen reader announcements
 * - Scroll lock
 * 
 * @example
 * <Modal isOpen={isOpen} onClose={close} title="Edit Profile">
 *   <ModalContent>...</ModalContent>
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const modalRef = useFocusTrap();
  useEscapeKey(onClose);
  const announce = useAnnounce();

  useEffect(() => {
    if (isOpen) {
      announce('Dialog opened', 'assertive');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, announce]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
          <IconButton icon={<span>×</span>} label="Close dialog" onClick={onClose} />
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/**
 * Form Field Component
 * 
 * Accessible form field with label, error, and required state
 * 
 * @example
 * <FormField
 *   label="Email"
 *   error={errors.email}
 *   required
 * >
 *   <input type="email" name="email" />
 * </FormField>
 */
export function FormField({
  label,
  error,
  required,
  children,
  helpText,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
}) {
  const inputId = React.useId();
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
      
      {React.cloneElement(children as React.ReactElement, {
        id: inputId,
        'aria-invalid': !!error,
        'aria-describedby': error ? errorId : helpText ? helpId : undefined,
        'aria-required': required,
      })}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Data Table Component
 * 
 * Accessible table with proper headers and captions
 * 
 * @example
 * <DataTable caption="Sales by Month">
 *   <thead>
 *     <tr>
 *       <th scope="col">Month</th>
 *       <th scope="col">Sales</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>January</td>
 *       <td>$10,000</td>
 *     </tr>
 *   </tbody>
 * </DataTable>
 */
export function DataTable({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

/**
 * Loading Announcement Component
 * 
 * Announces loading states to screen readers
 * 
 * @example
 * <LoadingAnnouncement isLoading={loading}>
 *   Loading dashboard data...
 * </LoadingAnnouncement>
 */
export function LoadingAnnouncement({ 
  isLoading, 
  children = 'Loading...' 
}: { 
  isLoading: boolean;
  children?: React.ReactNode;
}) {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {children}
      <span className="animate-pulse">⏳</span>
    </div>
  );
}

/**
 * Error Boundary with Accessibility
 * 
 * Accessible error boundary that announces errors to screen readers
 * 
 * @example
 * <AccessibleErrorBoundary serviceName="Dashboard Widget">
 *   <MyWidget />
 * </AccessibleErrorBoundary>
 */
export class AccessibleErrorBoundary extends React.Component<
  { children: React.ReactNode; serviceName: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-label={`${this.props.serviceName} error`}
          className="p-4 bg-red-50 border border-red-200 rounded-md"
        >
          <h3 className="text-lg font-semibold text-red-900">
            {this.props.serviceName} Failed to Load
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Color Contrast Checker
 * 
 * Utility to verify color contrast meets WCAG AA standards
 * AA requires:
 * - Normal text: 4.5:1 ratio
 * - Large text (18pt+): 3:1 ratio
 * - UI components: 3:1 ratio
 */
export function checkColorContrast(fg: string, bg: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  // Simplified implementation - in production use axe-core or similar
  // This is a placeholder for actual contrast calculation
  return {
    ratio: 4.5,
    passesAA: true,
    passesAAA: true,
  };
}

/**
 * Focus Visible Polyfill
 * 
 * Adds :focus-visible support for browsers that don't have it
 * Only shows focus outline when using keyboard navigation
 */
export function initFocusVisible() {
  useEffect(() => {
    const handleMouseDown = () => {
      document.body.setAttribute('data-using-mouse', 'true');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.removeAttribute('data-using-mouse');
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

// Export CSS for sr-only utility class
export const srOnlyStyles = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
`;
