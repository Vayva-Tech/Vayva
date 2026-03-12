/**
 * Analytics Tracking Integration
 * 
 * Supports:
 * - Mixpanel (mixpanel.com)
 * - Amplitude (amplitude.com)
 * 
 * Environment variables:
 * - ANALYTICS_PROVIDER: mixpanel | amplitude
 * - MIXPANEL_TOKEN: Mixpanel project token
 * - AMPLITUDE_API_KEY: Amplitude API key
 */

type AnalyticsProvider = 'mixpanel' | 'amplitude';

interface EventProperties {
  [key: string]: any;
}

interface UserProfile {
  $email?: string;
  $name?: string;
  $userId?: string;
  [key: string]: any;
}

class AnalyticsTracker {
  private provider: AnalyticsProvider;
  private mixpanelToken?: string;
  private amplitudeApiKey?: string;
  private enabled: boolean;

  constructor() {
    this.provider = (process.env.ANALYTICS_PROVIDER as AnalyticsProvider) || 'mixpanel';
    this.mixpanelToken = process.env.MIXPANEL_TOKEN;
    this.amplitudeApiKey = process.env.AMPLITUDE_API_KEY;
    this.enabled = !!(this.mixpanelToken || this.amplitudeApiKey);
  }

  /**
   * Track an event
   */
  async track(
    eventName: string,
    userId?: string,
    properties?: EventProperties
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.enabled) {
      console.log(`[ANALYTICS] ${eventName}`, { userId, properties });
      return { success: true };
    }

    if (this.provider === 'mixpanel') {
      return this.trackToMixpanel(eventName, userId, properties);
    } else if (this.provider === 'amplitude') {
      return this.trackToAmplitude(eventName, userId, properties);
    }

    return { success: false, error: 'Analytics not configured' };
  }

  /**
   * Identify a user
   */
  async identify(userId: string, profile?: UserProfile): Promise<{ success: boolean; error?: string }> {
    if (!this.enabled) {
      console.log(`[ANALYTICS] Identify user: ${userId}`, profile);
      return { success: true };
    }

    if (this.provider === 'mixpanel') {
      return this.identifyMixpanel(userId, profile);
    } else if (this.provider === 'amplitude') {
      return this.identifyAmplitude(userId, profile);
    }

    return { success: false, error: 'Analytics not configured' };
  }

  /**
   * Track to Mixpanel
   */
  private async trackToMixpanel(
    eventName: string,
    userId?: string,
    properties?: EventProperties
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.mixpanelToken) {
      return { success: false, error: 'Mixpanel token not configured' };
    }

    try {
      const eventData = {
        event: eventName,
        properties: {
          distinct_id: userId,
          token: this.mixpanelToken,
          $lib: 'vayva-creative-agency',
          time: Date.now() / 1000,
          ...properties,
        },
      };

      // Use Mixpanel HTTP API
      const encoded = Buffer.from(JSON.stringify(eventData)).toString('base64');
      const response = await fetch(
        `https://api.mixpanel.com/track?data=${encodeURIComponent(encoded)}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Mixpanel API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to track event in Mixpanel:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Identify user in Mixpanel
   */
  private async identifyMixpanel(
    userId: string,
    profile?: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.mixpanelToken) {
      return { success: false, error: 'Mixpanel token not configured' };
    }

    try {
      const eventData = {
        $token: this.mixpanelToken,
        $distinct_id: userId,
        $set: profile || {},
      };

      const encoded = Buffer.from(JSON.stringify(eventData)).toString('base64');
      const response = await fetch(
        `https://api.mixpanel.com/engage#profile-set?data=${encodeURIComponent(encoded)}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Mixpanel API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to identify user in Mixpanel:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Track to Amplitude
   */
  private async trackToAmplitude(
    eventName: string,
    userId?: string,
    properties?: EventProperties
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.amplitudeApiKey) {
      return { success: false, error: 'Amplitude API key not configured' };
    }

    try {
      const response = await fetch('https://http2.amplitude.com/2/httpapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.amplitudeApiKey,
          events: [
            {
              event_type: eventName,
              user_id: userId,
              event_properties: properties,
              time: Date.now(),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Amplitude API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to track event in Amplitude:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Identify user in Amplitude
   */
  private async identifyAmplitude(
    userId: string,
    profile?: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.amplitudeApiKey) {
      return { success: false, error: 'Amplitude API key not configured' };
    }

    try {
      const response = await fetch('https://http2.amplitude.com/2/httpapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.amplitudeApiKey,
          events: [
            {
              event_type: '$identify',
              user_id: userId,
              user_properties: profile,
              time: Date.now(),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Amplitude API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to identify user in Amplitude:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Pre-configured event tracking helpers
export const trackEvents = {
  // User actions
  userSignedUp: (userId: string, email?: string) =>
    analytics.track('User Signed Up', userId, { email }),
  
  userLoggedIn: (userId: string) =>
    analytics.track('User Logged In', userId),
  
  // Project actions
  projectCreated: (userId: string, projectName: string) =>
    analytics.track('Project Created', userId, { projectName }),
  
  projectViewed: (userId: string, projectId: string) =>
    analytics.track('Project Viewed', userId, { projectId }),
  
  // Dashboard actions
  dashboardViewed: (userId: string, dashboardType: string) =>
    analytics.track('Dashboard Viewed', userId, { dashboardType }),
  
  // Feature usage
  featureUsed: (userId: string, featureName: string, metadata?: any) =>
    analytics.track('Feature Used', userId, { featureName, ...metadata }),
  
  // E-signature
  contractSent: (userId: string, contractId: string) =>
    analytics.track('Contract Sent', userId, { contractId }),
  
  contractSigned: (userId: string, contractId: string) =>
    analytics.track('Contract Signed', userId, { contractId }),
  
  // NPS
  surveyCompleted: (userId: string, score: number) =>
    analytics.track('Survey Completed', userId, { score }),
  
  // Reports
  reportGenerated: (userId: string, reportType: string) =>
    analytics.track('Report Generated', userId, { reportType }),
};

export { AnalyticsTracker };
