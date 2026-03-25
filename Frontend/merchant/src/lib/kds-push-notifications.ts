/**
 * Push Notifications Service for KDS
 * 
 * Features:
 * - Rush hour alerts
 * - Critical 86 notifications
 * - Staff shortage warnings
 * - Equipment failure alerts
 * - Performance milestone celebrations
 */

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  timestamp: number;
  type: 'rush' | '86-critical' | 'staff' | 'equipment' | 'milestone';
  data?: Record<string, unknown>;
}

class KDSPushNotificationService {
  private permission: NotificationPermission = 'default';
  private subscription: PushSubscription | null = null;
  private notificationQueue: PushNotification[] = [];

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[KDS_Push] Browser does not support notifications');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('[KDS_Push] Permission request error:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(vapidPublicKey: string): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    
    try {
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      // Send subscription to backend
      await this.sendSubscriptionToBackend(this.subscription);
    } catch (error) {
      console.error('[KDS_Push] Subscription error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  /**
   * Show browser notification
   */
  showNotification(notification: PushNotification): void {
    if (this.permission !== 'granted') {
      // Queue notification for later
      this.notificationQueue.push(notification);
      return;
    }

    const options = {
      body: notification.body,
      icon: notification.icon || '/icons/kds-icon-192.png',
      badge: notification.badge || '/icons/kds-badge-96.png',
      tag: notification.tag || notification.id,
      requireInteraction: notification.requireInteraction ?? false,
      data: notification.data,
      actions: notification.type === 'rush'
        ? [
            { action: 'view', title: 'View KDS' },
            { action: 'dismiss', title: 'Dismiss' },
          ]
        : [],
    } as NotificationOptions;

    new Notification(notification.title, options);
  }

  /**
   * Show rush hour alert
   */
  showRushAlert(peakTime: string, expectedOrders: number): void {
    this.showNotification({
      id: `rush_${Date.now()}`,
      title: '🔥 Rush Hour Alert',
      body: `Peak time ${peakTime}: Expecting ${expectedOrders} orders`,
      type: 'rush',
      timestamp: Date.now(),
      requireInteraction: true,
    });
  }

  /**
   * Show critical 86 notification
   */
  show86Critical(itemName: string, depletionTime: string): void {
    this.showNotification({
      id: `86_${Date.now()}`,
      title: '⚠️ Critical Stock Alert',
      body: `${itemName} will run out in ${depletionTime}`,
      type: '86-critical',
      timestamp: Date.now(),
      requireInteraction: true,
    });
  }

  /**
   * Show staff shortage warning
   */
  showStaffShortage(station: string, severity: 'low' | 'medium' | 'high'): void {
    const emojis = { low: '⚠️', medium: '🚨', high: '🆘' };
    
    this.showNotification({
      id: `staff_${Date.now()}`,
      title: `${emojis[severity]} Staff Shortage`,
      body: `${station} station needs support (${severity} priority)`,
      type: 'staff',
      timestamp: Date.now(),
    });
  }

  /**
   * Show equipment failure alert
   */
  showEquipmentFailure(equipment: string, temperature?: number): void {
    this.showNotification({
      id: `equip_${Date.now()}`,
      title: '❄️ Equipment Alert',
      body: temperature 
        ? `${equipment}: Temperature at ${temperature}°F (outside safe range)`
        : `${equipment} requires maintenance`,
      type: 'equipment',
      timestamp: Date.now(),
      requireInteraction: true,
    });
  }

  /**
   * Show performance milestone celebration
   */
  showMilestone(milestone: string, value: string): void {
    this.showNotification({
      id: `milestone_${Date.now()}`,
      title: '🎉 Achievement Unlocked!',
      body: `${milestone}: ${value}`,
      type: 'milestone',
      timestamp: Date.now(),
    });
  }

  /**
   * Send subscription to backend
   */
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/restaurant/kds/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
    } catch (error) {
      console.error('[KDS_Push] Failed to send subscription:', error);
    }
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Get current subscription status
   */
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

// Export singleton instance
export const kdsPushNotificationService = new KDSPushNotificationService();
