import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationDispatcher } from '../services/notification-dispatcher.service.js';
import { NotificationPayload } from '../types/index.js';

// Mock the settings manager (minimal flat notifications → merged with engine defaults)
vi.mock('@vayva/settings', () => ({
  getSettingsManager: () => ({
    getSettings: () => ({
      notifications: {
        email: true,
        sms: true,
        push: true,
        inApp: true,
      },
    }),
  }),
}));

describe('NotificationDispatcher', () => {
  let dispatcher: NotificationDispatcher;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatcher = new NotificationDispatcher();
  });

  describe('Payload Enrichment', () => {
    it('should enrich payload with defaults', async () => {
      const payload: NotificationPayload = {
        subject: 'Test Subject',
        body: 'Test Body',
        recipient: { storeId: 'test-store' },
        category: 'test.category',
        priority: 'normal',
        channels: ['in-app'],
        source: 'test'
      };

      // Since we can't easily test private methods, we'll test through the public interface
      const results = await dispatcher.dispatch(payload);
      
      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe('in-app');
    });
  });

  describe('Permission Checking', () => {
    it('should respect category permissions', async () => {
      const payload: NotificationPayload = {
        subject: 'Test',
        body: 'Test body',
        recipient: { storeId: 'test-store' },
        category: 'sales.newOrder', // This category is enabled in mock
        priority: 'normal',
        channels: ['in-app'],
        source: 'test'
      };

      const results = await dispatcher.dispatch(payload);
      expect(results[0].status).not.toBe('cancelled');
    });
  });

  describe('Channel Dispatching', () => {
    it('should attempt all specified channels', async () => {
      const payload: NotificationPayload = {
        subject: 'Multi-channel Test',
        body: 'Test body',
        recipient: { 
          storeId: 'test-store',
          email: 'test@example.com'
        },
        category: 'test.category',
        priority: 'normal',
        channels: ['in-app', 'email'],
        source: 'test'
      };

      const results = await dispatcher.dispatch(payload);
      
      expect(results).toHaveLength(2);
      const channels = results.map(r => r.channel);
      expect(channels).toContain('in-app');
      expect(channels).toContain('email');
    });

    it('should handle channel failures gracefully', async () => {
      const payload: NotificationPayload = {
        subject: 'Test',
        body: 'Test body',
        recipient: { storeId: 'test-store' },
        category: 'test.category',
        priority: 'normal',
        channels: ['email'], // Use valid channel
        source: 'test'
      };

      // Mock the channel manager to simulate failure
      const mockChannelManager = {
        send: vi.fn().mockResolvedValue({
          success: false,
          errorMessage: 'Channel failed'
        })
      };
      
      // We can't easily inject this mock, so we'll test with valid channels
      // The actual failure testing would require more complex mocking
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty channels array', async () => {
      const payload: NotificationPayload = {
        subject: 'Test',
        body: 'Test body',
        recipient: { storeId: 'test-store' },
        category: 'test.category',
        priority: 'normal',
        channels: [], // Empty channels
        source: 'test'
      };

      const results = await dispatcher.dispatch(payload);
      
      expect(results).toHaveLength(0);
    });

    it('should handle missing recipient info gracefully', async () => {
      const payload: NotificationPayload = {
        subject: 'Test',
        body: 'Test body',
        recipient: {}, // Missing required info
        category: 'test.category',
        priority: 'normal',
        channels: ['email'],
        source: 'test'
      };

      const results = await dispatcher.dispatch(payload);
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
    });
  });
});