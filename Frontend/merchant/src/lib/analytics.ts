// @ts-nocheck
// ============================================================================
// Analytics Module
// ============================================================================
// Provides event tracking utilities for dashboard and feature usage analytics.
// ============================================================================

export const trackEvents = {
  /**
   * Track when a feature is used by a user.
   */
  async featureUsed(
    userId: string,
    eventName: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Analytics] featureUsed:', { userId, eventName, properties });
      }

      // Send to analytics endpoint if available
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'feature_used',
            userId,
            event: eventName,
            properties,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Silently fail analytics calls
        });
      }
    } catch {
      // Analytics should never break the app
    }
  },

  /**
   * Track a page view.
   */
  async pageView(
    userId: string,
    page: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      if (process.env.NODE_ENV === 'development') {
        console.debug('[Analytics] pageView:', { userId, page, properties });
      }
    } catch {
      // Analytics should never break the app
    }
  },

  /**
   * Track a custom event.
   */
  async track(
    eventName: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      if (process.env.NODE_ENV === 'development') {
        console.debug('[Analytics] track:', { eventName, properties });
      }
    } catch {
      // Analytics should never break the app
    }
  },
};

export default trackEvents;
