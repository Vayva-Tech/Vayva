import { getSettingsManager } from '@vayva/settings';
import { getResolvedEngineNotificationSettings } from '../engine-notification-settings';

/**
 * Quiet Hours Enforcement Service
 * 
 * Responsible for:
 * - Checking if notifications should be sent immediately or queued
 * - Calculating optimal delivery times outside quiet hours
 * - Handling emergency overrides
 * - Managing VIP exceptions
 */
export class QuietHoursEnforcer {
  private settingsManager;

  constructor() {
    this.settingsManager = getSettingsManager();
  }

  /**
   * Check if a notification can be sent immediately or needs to be queued
   */
  async checkQuietHours(
    entityId: string, // storeId or userId
    priority: string
  ): Promise<{
    allowImmediate: boolean;
    isEmergencyOverride: boolean;
    scheduledTime?: Date;
    reason?: string;
  }> {
    try {
      const notificationSettings = getResolvedEngineNotificationSettings(this.settingsManager);
      const quietHours = notificationSettings.quietHours;

      // If quiet hours are disabled, allow immediate sending
      if (!quietHours.enabled) {
        return {
          allowImmediate: true,
          isEmergencyOverride: false
        };
      }

      const now = new Date();
      const isWithinQuietHours = this.isTimeInQuietHours(now, quietHours.startTime, quietHours.endTime);

      // Emergency priority bypasses quiet hours
      if (priority === 'critical' || priority === 'urgent') {
        const isEmergency = this.isEmergencyMessage(entityId, priority);
        if (isEmergency) {
          return {
            allowImmediate: true,
            isEmergencyOverride: true,
            reason: 'Emergency priority bypasses quiet hours'
          };
        }
      }

      // Check VIP overrides
      if (quietHours.allowVipOverrides && await this.isVipContact(entityId)) {
        return {
          allowImmediate: true,
          isEmergencyOverride: false,
          reason: 'VIP contact bypasses quiet hours'
        };
      }

      // If not in quiet hours, allow immediate sending
      if (!isWithinQuietHours) {
        return {
          allowImmediate: true,
          isEmergencyOverride: false
        };
      }

      // Calculate next available time outside quiet hours
      const nextAvailableTime = this.calculateNextAvailableTime(
        now,
        quietHours.startTime,
        quietHours.endTime
      );

      return {
        allowImmediate: false,
        isEmergencyOverride: false,
        scheduledTime: nextAvailableTime,
        reason: `Currently in quiet hours (${quietHours.startTime} - ${quietHours.endTime})`
      };

    } catch (error) {
      console.error('[QuietHoursEnforcer] Error checking quiet hours:', error);
      // Fail open - allow notification if there's an error
      return {
        allowImmediate: true,
        isEmergencyOverride: false,
        reason: 'Error in quiet hours check - allowing notification'
      };
    }
  }

  /**
   * Check if a specific time falls within quiet hours
   */
  private isTimeInQuietHours(time: Date, startTime: string, endTime: string): boolean {
    const currentTimeMinutes = time.getHours() * 60 + time.getMinutes();
    const startMinutes = this.timeStringToMinutes(startTime);
    const endMinutes = this.timeStringToMinutes(endTime);

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startMinutes > endMinutes) {
      return currentTimeMinutes >= startMinutes || currentTimeMinutes < endMinutes;
    } else {
      return currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes;
    }
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Calculate the next time outside quiet hours
   */
  private calculateNextAvailableTime(now: Date, startTime: string, endTime: string): Date {
    const startMinutes = this.timeStringToMinutes(startTime);
    const endMinutes = this.timeStringToMinutes(endTime);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextAvailableMinutes: number;

    if (startMinutes > endMinutes) {
      // Overnight quiet hours (e.g., 22:00 - 08:00)
      if (currentMinutes >= startMinutes) {
        // Currently in quiet hours, next available is end time tomorrow
        nextAvailableMinutes = endMinutes;
        now.setDate(now.getDate() + 1); // Move to next day
      } else {
        // Before quiet hours start today
        nextAvailableMinutes = endMinutes;
      }
    } else {
      // Same-day quiet hours (e.g., 13:00 - 14:00)
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        // Currently in quiet hours, next available is end time
        nextAvailableMinutes = endMinutes;
      } else if (currentMinutes >= endMinutes) {
        // After quiet hours today, next available is start time tomorrow
        nextAvailableMinutes = startMinutes;
        now.setDate(now.getDate() + 1); // Move to next day
      } else {
        // Before quiet hours start today
        nextAvailableMinutes = startMinutes;
      }
    }

    // Set the calculated time
    const hours = Math.floor(nextAvailableMinutes / 60);
    const minutes = nextAvailableMinutes % 60;
    
    const result = new Date(now);
    result.setHours(hours, minutes, 0, 0);
    
    return result;
  }

  /**
   * Check if a message qualifies as emergency
   */
  private isEmergencyMessage(entityId: string, priority: string): boolean {
    // Emergency priority automatically qualifies
    if (priority === 'critical') {
      return true;
    }

    if (priority === 'urgent') {
      const notificationSettings = getResolvedEngineNotificationSettings(this.settingsManager);
      const emergencyKeywords = notificationSettings.quietHours.emergencyContactKeywords || [];
      
      // In a real implementation, you might check:
      // - Message content for emergency keywords
      // - Sender VIP status
      // - Business-critical event types
      
      // For now, treating urgent as emergency if enabled
      return notificationSettings.quietHours.allowEmergencyContacts !== false;
    }

    return false;
  }

  /**
   * Check if entity is a VIP contact
   */
  private async isVipContact(entityId: string): Promise<boolean> {
    try {
      const notificationSettings = getResolvedEngineNotificationSettings(this.settingsManager);
      const vipContacts = notificationSettings.quietHours.vipContacts || [];
      
      // In a real implementation, this might:
      // - Check against a VIP contacts list
      // - Query database for VIP status
      // - Check user roles/permissions
      
      // For simulation, returning false
      return false;
    } catch (error) {
      console.error('[QuietHoursEnforcer] Error checking VIP status:', error);
      return false;
    }
  }

  /**
   * Get quiet hours configuration for an entity
   */
  getQuietHoursConfig(entityId: string): {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone?: string;
  } {
    try {
      const notificationSettings = getResolvedEngineNotificationSettings(this.settingsManager);
      return {
        enabled: notificationSettings.quietHours.enabled,
        startTime: notificationSettings.quietHours.startTime,
        endTime: notificationSettings.quietHours.endTime,
        timezone: notificationSettings.quietHours.timezone
      };
    } catch (error) {
      console.error('[QuietHoursEnforcer] Error getting quiet hours config:', error);
      return {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      };
    }
  }

  /**
   * Temporarily disable quiet hours for an entity
   */
  async temporarilyDisable(entityId: string, durationMinutes: number): Promise<void> {
    try {
      // In a real implementation, this would:
      // - Store temporary override in database
      // - Set expiration time
      // - Update cache
      
      console.log(`[QuietHoursEnforcer] Temporarily disabled quiet hours for ${entityId} for ${durationMinutes} minutes`);
    } catch (error) {
      console.error('[QuietHoursEnforcer] Error temporarily disabling quiet hours:', error);
    }
  }

  /**
   * Check if quiet hours are currently active for an entity
   */
  async isCurrentlyActive(entityId: string): Promise<boolean> {
    const config = this.getQuietHoursConfig(entityId);
    if (!config.enabled) {
      return false;
    }

    const now = new Date();
    return this.isTimeInQuietHours(now, config.startTime, config.endTime);
  }

  /**
   * Get next quiet hours period
   */
  getNextQuietHoursPeriod(entityId: string): { start: Date; end: Date } | null {
    try {
      const config = this.getQuietHoursConfig(entityId);
      if (!config.enabled) {
        return null;
      }

      const now = new Date();
      const startMinutes = this.timeStringToMinutes(config.startTime);
      const endMinutes = this.timeStringToMinutes(config.endTime);

      const start = new Date(now);
      const end = new Date(now);

      const hoursStart = Math.floor(startMinutes / 60);
      const minutesStart = startMinutes % 60;
      const hoursEnd = Math.floor(endMinutes / 60);
      const minutesEnd = endMinutes % 60;

      start.setHours(hoursStart, minutesStart, 0, 0);
      end.setHours(hoursEnd, minutesEnd, 0, 0);

      // Adjust dates if needed
      if (startMinutes > endMinutes) {
        // Overnight period
        if (now > start) {
          start.setDate(start.getDate() + 1);
        }
        end.setDate(start.getDate() + 1);
      } else {
        // Same day period
        if (now > end) {
          start.setDate(start.getDate() + 1);
          end.setDate(end.getDate() + 1);
        }
      }

      return { start, end };
    } catch (error) {
      console.error('[QuietHoursEnforcer] Error calculating next quiet hours:', error);
      return null;
    }
  }
}