// ============================================================================
// Analytics Module
// ============================================================================
// Provides event tracking utilities for dashboard and feature usage analytics.
// Uses structured logging for development debugging.
// ============================================================================

import { logger } from './logger';

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

      // Log in development using structured logger
      if (process.env.NODE_ENV === 'development') {
        logger.debug('[ANALYTICS_EVENT]', { 
          event: eventName, 
          userId,
          properties 
        });
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
        logger.debug('[ANALYTICS_PAGEVIEW]', { 
          event: 'page_view', 
          userId,
          page,
          properties 
        });
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
        logger.debug('[ANALYTICS_CUSTOM_EVENT]', { 
          event: eventName, 
          properties 
        });
      }
    } catch {
      // Analytics should never break the app
    }
  },
};

export default trackEvents;
