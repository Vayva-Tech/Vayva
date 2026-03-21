import React from 'react';

interface LoadingAnnouncementProps {
  isLoading: boolean;
  message?: string;
  polite?: boolean;
}

/**
 * LoadingAnnouncement Component
 * 
 * Provides screen reader announcements for loading states.
 * Uses ARIA live regions to announce loading state changes to assistive technologies.
 * 
 * @example
 * ```tsx
 * <Button isLoading={loading}>
 *   <LoadingAnnouncement isLoading={loading} message="Saving changes" />
 *   {loading ? <Spinner /> : null}
 *   Submit
 * </Button>
 * ```
 * 
 * WCAG 2.1 AA Compliance:
 * - Success Criterion 4.1.3 (Status Messages)
 * - Success Criterion 3.3.1 (Error Identification)
 */
export function LoadingAnnouncement({ 
  isLoading, 
  message = "Loading", 
  polite = true 
}: LoadingAnnouncementProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div 
      role="status" 
      aria-live={polite ? "polite" : "assertive"} 
      aria-busy="true"
      className="sr-only"
    >
      {message}. Please wait.
    </div>
  );
}

/**
 * StatusAnnouncement Component
 * 
 * Announces status changes to screen readers (success, error, warning messages)
 * 
 * @example
 * ```tsx
 * <StatusAnnouncement 
 *   status="success" 
 *   message="Your changes have been saved successfully" 
 * />
 * ```
 */
interface StatusAnnouncementProps {
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  assertive?: boolean;
}

export function StatusAnnouncement({ 
  status, 
  message, 
  assertive = false 
}: StatusAnnouncementProps) {
  const priority = assertive || status === 'error' ? 'assertive' : 'polite';
  
  return (
    <div 
      role="alert"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}: {message}
    </div>
  );
}

/**
 * ProgressAnnouncement Component
 * 
 * Announces progress updates for multi-step processes
 * 
 * @example
 * ```tsx
 * <ProgressAnnouncement 
 *   currentStep={2} 
 *   totalSteps={5}
 *   label="Uploading files"
 * />
 * ```
 */
interface ProgressAnnouncementProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function ProgressAnnouncement({ 
  currentStep, 
  totalSteps, 
  label = "Progress" 
}: ProgressAnnouncementProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div 
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {label}: Step {currentStep} of {totalSteps}, {percentage}% complete
    </div>
  );
}
