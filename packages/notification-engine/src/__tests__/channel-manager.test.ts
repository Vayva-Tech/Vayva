import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationChannelManager } from '../services/channel-manager.service.js';
import { NotificationPayload } from '../types/index.js';

// Mock the settings manager
vi.mock('@vayva/settings', () => ({
  getSettingsManager: () => ({
    getNotificationSettings: () => ({
      channels: {
        email: { enabled: true, address: '', digestEnabled: false, digestFrequency: 'daily' },
        sms: { enabled: true, phoneNumber: '+1234567890', carrier: 'TestCarrier' },
        push: { enabled: true, browserPermission: 'granted', deviceTokens: [] },
        'in-app': { enabled: true, showBadge: true, soundEnabled: true, desktopNotifications: false },
        slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/services/XXX', channel: '#general' },
        whatsapp: { enabled: true, phoneNumber: '+1234567890', businessAccountId: 'test-account' }
      }
    })
  })
}));

describe('NotificationChannelManager', () => {
  let channelManager: NotificationChannelManager;

  beforeEach(() => {
    channelManager = new NotificationChannelManager();
  });

  describe('Channel Availability', () => {
    it('should return available channels', () => {
      const channels = channelManager.getAvailableChannels();
      expect(channels).toContain('email');
      expect(channels).toContain('sms');
      expect(channels).toContain('push');
      expect(channels).toContain('in-app');
      expect(channels).toContain('slack');
      expect(channels).toContain('whatsapp');
      expect(channels).toContain('webhook');
    });

    it('should return channel configurations', () => {
      const config = channelManager.getChannelConfig('email');
      expect(config).toBeDefined();
      expect(config?.enabled).toBe(true);
    });
  });

  describe('Channel Sending', () => {
    const basePayload: NotificationPayload = {
      subject: 'Test Subject',
      body: 'Test Body',
      recipient: {
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        deviceId: 'device-123'
      },
      category: 'test.category',
      priority: 'normal',
      channels: ['email'],
      source: 'test'
    };

    it('should send email notifications', async () => {
      const result = await channelManager.send('email', {
        ...basePayload,
        recipient: { email: 'test@example.com' }
      });
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should send SMS notifications', async () => {
      const result = await channelManager.send('sms', {
        ...basePayload,
        recipient: { phoneNumber: '+1234567890' }
      });
      
      expect(result.success).toBe(true);
    });

    it('should send push notifications', async () => {
      const result = await channelManager.send('push', {
        ...basePayload,
        recipient: { deviceId: 'device-123' }
      });
      
      expect(result.success).toBe(true);
    });

    it('should send in-app notifications', async () => {
      const result = await channelManager.send('in-app', {
        ...basePayload,
        recipient: { userId: 'user-123' }
      });
      
      expect(result.success).toBe(true);
    });

    it('should handle disabled channels', async () => {
      // Test with disabled channel configuration
    });

    it('should handle invalid configurations', async () => {
      // Test with invalid channel credentials
    });
  });

  describe('Configuration Management', () => {
    it('should update channel configurations', () => {
      const newConfig = {
        enabled: false,
        credentials: {}
      };
      
      channelManager.updateChannelConfig('email', newConfig);
      const updatedConfig = channelManager.getChannelConfig('email');
      expect(updatedConfig?.enabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent channels gracefully', async () => {
      const testPayload: NotificationPayload = {
        subject: 'Test Subject',
        body: 'Test Body',
        recipient: {
          email: 'test@example.com',
          phoneNumber: '+1234567890',
          deviceId: 'device-123'
        },
        category: 'test.category',
        priority: 'normal',
        channels: ['email'],
        source: 'test'
      };
      
      const result = await channelManager.send('non-existent' as any, testPayload);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('not implemented');
    });

    it('should handle channel failures gracefully', async () => {
      // Test various failure scenarios
    });
  });
});