/**
 * Push Notification Service
 * 
 * Provides:
 * - Cross-platform push notifications (iOS/Android)
 * - Industry-specific notification handling
 * - Background notification processing
 * - Notification preferences management
 * - Deep linking support
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  showPreview: boolean;
  categories: {
    appointments: boolean;
    orders: boolean;
    inventory: boolean;
    tasks: boolean;
    alerts: boolean;
  };
}

export interface IndustryNotificationConfig {
  industry: string;
  channels: Array<{
    id: string;
    name: string;
    importance: 'default' | 'high' | 'low';
    sound?: string;
    vibrationPattern?: number[];
  }>;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private pushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('[PUSH] Physical device required for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PUSH] Permission not granted');
      return false;
    }

    return true;
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotificationsAsync(
    projectId?: string
  ): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    
    if (!hasPermission) {
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId || Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.pushToken = tokenData.data;
      console.log('[PUSH] Registered with token:', this.pushToken);

      // Configure Android-specific settings
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return this.pushToken;
    } catch (error) {
      console.error('[PUSH] Failed to register:', error);
      return null;
    }
  }

  /**
   * Set up notification listeners
   */
  setupListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ): void {
    // Handle notification received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('[PUSH] Notification received:', notification);
      onNotificationReceived(notification);
    });

    // Handle user tapping on notification
    this.responseListener = Notifications.addNotificationResponseListener(response => {
      console.log('[PUSH] Notification response:', response);
      onNotificationResponse(response);
    });
  }

  /**
   * Remove listeners
   */
  removeListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(options: {
    title: string;
    body: string;
    data?: any;
    seconds?: number;
    categoryId?: string;
  }): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: options.seconds ? { seconds: options.seconds } : null,
    });
  }

  /**
   * Send immediate local notification
   */
  async sendLocalNotification(options: {
    title: string;
    body: string;
    data?: any;
    categoryId?: string;
  }): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data,
        sound: true,
      },
      trigger: null, // Immediate
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const stored = await AsyncStorage.getItem('@vayva:notification-preferences');
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Default preferences
    return {
      enabled: true,
      sound: true,
      vibration: true,
      badge: true,
      showPreview: true,
      categories: {
        appointments: true,
        orders: true,
        inventory: true,
        tasks: true,
        alerts: true,
      },
    };
  }

  /**
   * Update notification preferences
   */
  async setPreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    const current = await this.getPreferences();
    const updated = { ...current, ...preferences };
    
    await AsyncStorage.setItem(
      '@vayva:notification-preferences',
      JSON.stringify(updated)
    );

    // Update badge settings
    if (preferences.badge !== undefined) {
      if (!preferences.badge) {
        await Notifications.setBadgeCountAsync(0);
      }
    }
  }

  /**
   * Get industry-specific notification configuration
   */
  getIndustryConfig(industry: string): IndustryNotificationConfig {
    const configs: Record<string, IndustryNotificationConfig> = {
      healthcare: {
        industry: 'healthcare',
        channels: [
          {
            id: 'appointments',
            name: 'Appointments',
            importance: 'high',
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
          },
          {
            id: 'patient-alerts',
            name: 'Patient Alerts',
            importance: 'high',
            sound: 'default',
          },
          {
            id: 'tasks',
            name: 'Clinical Tasks',
            importance: 'default',
          },
        ],
      },
      legal: {
        industry: 'legal',
        channels: [
          {
            id: 'court-dates',
            name: 'Court Dates',
            importance: 'high',
            sound: 'default',
          },
          {
            id: 'deadlines',
            name: 'Filing Deadlines',
            importance: 'high',
          },
          {
            id: 'client-messages',
            name: 'Client Messages',
            importance: 'default',
          },
        ],
      },
      retail: {
        industry: 'retail',
        channels: [
          {
            id: 'low-stock',
            name: 'Low Stock Alerts',
            importance: 'high',
          },
          {
            id: 'orders',
            name: 'New Orders',
            importance: 'default',
          },
          {
            id: 'staff',
            name: 'Staff Updates',
            importance: 'low',
          },
        ],
      },
      restaurant: {
        industry: 'restaurant',
        channels: [
          {
            id: 'reservations',
            name: 'Reservations',
            importance: 'high',
          },
          {
            id: 'kitchen-orders',
            name: 'Kitchen Orders',
            importance: 'high',
          },
          {
            id: 'table-alerts',
            name: 'Table Alerts',
            importance: 'default',
          },
        ],
      },
      food: {
        industry: 'food',
        channels: [
          {
            id: 'inventory-alerts',
            name: 'Inventory Alerts',
            importance: 'high',
          },
          {
            id: 'expiration',
            name: 'Expiration Warnings',
            importance: 'high',
          },
          {
            id: 'recipe-updates',
            name: 'Recipe Updates',
            importance: 'low',
          },
        ],
      },
    };

    return configs[industry] || configs.retail;
  }

  /**
   * Set up industry-specific notification channels (Android)
   */
  async setupIndustryChannels(industry: string): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    const config = this.getIndustryConfig(industry);

    for (const channel of config.channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: channel.vibrationPattern,
        sound: channel.sound || 'default',
      });
    }

    console.log(`[PUSH] Set up ${config.channels.length} channels for ${industry}`);
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Clear badge count
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();
