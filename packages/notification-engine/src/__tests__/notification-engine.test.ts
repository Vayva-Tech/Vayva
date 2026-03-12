import { NotificationDispatcher, EmailChannel, SMSChannel } from '../index';
import type { NotificationMessage } from '../services/notification-dispatcher.service';

// Mock the settings manager
const mockSettingsManager = {
  getNotificationSettings: jest.fn()
};

jest.mock('@vayva/settings', () => ({
  getSettingsManager: () => mockSettingsManager
}));

describe('NotificationDispatcher', () => {
  let dispatcher: NotificationDispatcher;
  let mockEmailSend: jest.Mock;
  let mockSMSSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock settings
    mockSettingsManager.getNotificationSettings.mockReturnValue({
      channels: {
        email: { enabled: true, address: 'test@example.com' },
        sms: { enabled: true, phoneNumber: '+1234567890' },
        push: { enabled: false },
        inApp: { enabled: true },
        slack: { enabled: false },
        whatsapp: { enabled: false }
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        emergencyContactKeywords: ['urgent', 'emergency']
      },
      categories: {
        sales: { newOrder: true },
        customers: { newCustomer: true },
        inventory: { lowStock: true }
      },
      priority: {
        highPriorityKeywords: ['urgent', 'emergency'],
        autoEscalateAfterMinutes: 60
      },
      trackEngagement: true
    });

    dispatcher = new NotificationDispatcher();
    
    // Mock channel send methods
    mockEmailSend = jest.fn().mockResolvedValue(true);
    mockSMSSend = jest.fn().mockResolvedValue(true);
    
    // @ts-ignore - accessing private property for testing
    dispatcher['channels'].set('email', { send: mockEmailSend } as any);
    // @ts-ignore - accessing private property for testing
    dispatcher['channels'].set('sms', { send: mockSMSSend } as any);
  });

  describe('send', () => {
    const baseMessage: NotificationMessage = {
      type: 'test.notification',
      title: 'Test Notification',
      content: 'This is a test notification',
      recipients: ['user@example.com'],
      channel: 'email',
      priority: 'normal'
    };

    it('should send valid notification successfully', async () => {
      const result = await dispatcher.send(baseMessage);
      
      expect(result).toBe(true);
      expect(mockEmailSend).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Notification',
        content: 'This is a test notification'
      }));
    });

    it('should reject invalid message', async () => {
      const invalidMessage = { ...baseMessage, channel: 'invalid-channel' };
      const result = await dispatcher.send(invalidMessage);
      
      expect(result).toBe(false);
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('should respect category settings', async () => {
      const salesMessage: NotificationMessage = {
        ...baseMessage,
        category: 'sales.newOrder'
      };

      const result = await dispatcher.send(salesMessage);
      
      expect(result).toBe(true);
      expect(mockEmailSend).toHaveBeenCalled();
    });

    it('should block disabled categories', async () => {
      // Mock disabled category
      mockSettingsManager.getNotificationSettings.mockReturnValueOnce({
        ...mockSettingsManager.getNotificationSettings(),
        categories: {
          sales: { newOrder: false }
        }
      });

      const salesMessage: NotificationMessage = {
        ...baseMessage,
        category: 'sales.newOrder'
      };

      const result = await dispatcher.send(salesMessage);
      
      expect(result).toBe(true); // Should return true (expected behavior)
      expect(mockEmailSend).not.toHaveBeenCalled();
    });

    it('should handle quiet hours for normal priority', async () => {
      // Mock current time during quiet hours
      const originalDate = global.Date;
      const mockDate = new Date('2023-01-01T23:00:00'); // 11 PM - during quiet hours
      // @ts-ignore
      global.Date = jest.fn(() => mockDate);
      global.Date.now = originalDate.now;

      const result = await dispatcher.send(baseMessage);
      
      expect(result).toBe(true);
      // Should be queued, not sent immediately
      expect(mockEmailSend).not.toHaveBeenCalled();

      // @ts-ignore
      global.Date = originalDate;
    });

    it('should override quiet hours for emergency priority', async () => {
      const emergencyMessage: NotificationMessage = {
        ...baseMessage,
        priority: 'emergency'
      };

      const result = await dispatcher.send(emergencyMessage);
      
      expect(result).toBe(true);
      expect(mockEmailSend).toHaveBeenCalled();
    });

    it('should handle emergency keywords in content', async () => {
      const urgentMessage: NotificationMessage = {
        ...baseMessage,
        content: 'This is urgent and needs immediate attention',
        priority: 'normal'
      };

      const result = await dispatcher.send(urgentMessage);
      
      expect(result).toBe(true);
      expect(mockEmailSend).toHaveBeenCalled();
    });

    it('should send to multiple channels', async () => {
      const results = await dispatcher.sendToMultipleChannels(
        { ...baseMessage, channel: undefined },
        ['email', 'sms']
      );
      
      expect(results).toEqual([true, true]);
      expect(mockEmailSend).toHaveBeenCalled();
      expect(mockSMSSend).toHaveBeenCalled();
    });

    it('should generate message ID if not provided', async () => {
      const messageWithoutId = { ...baseMessage, id: undefined };
      const result = await dispatcher.send(messageWithoutId);
      
      expect(result).toBe(true);
      expect(mockEmailSend).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.stringMatching(/^msg_\d+_[a-z0-9]+$/)
      }));
    });
  });

  describe('queue management', () => {
    it('should provide queue statistics', () => {
      const stats = dispatcher.getQueueStats();
      
      expect(stats).toEqual({
        total: 0,
        immediate: 0,
        scheduled: 0,
        batch: 0,
        processing: false
      });
    });

    it('should report channel status', () => {
      const emailStatus = dispatcher.getChannelStatus('email');
      const invalidStatus = dispatcher.getChannelStatus('invalid');
      
      expect(emailStatus).toBe('active');
      expect(invalidStatus).toBe('inactive');
    });
  });

  describe('priority management', () => {
    it('should handle different priority levels', async () => {
      const priorities: Array<'low' | 'normal' | 'high' | 'urgent' | 'emergency'> = 
        ['low', 'normal', 'high', 'urgent', 'emergency'];
      
      for (const priority of priorities) {
        const message: NotificationMessage = {
          ...baseMessage,
          priority
        };
        
        const result = await dispatcher.send(message);
        expect(result).toBe(true);
      }
    });
  });
});

describe('EmailChannel', () => {
  it('should validate email configuration', () => {
    const channel = new EmailChannel({ address: 'valid@example.com' });
    expect(channel.validateConfig({ address: 'valid@example.com' })).toBe(true);
    expect(channel.validateConfig({ address: 'invalid-email' })).toBe(false);
  });
});

describe('SMSChannel', () => {
  it('should validate SMS configuration', () => {
    const channel = new SMSChannel({ phoneNumber: '+1234567890' });
    expect(channel.validateConfig({ phoneNumber: '+1234567890' })).toBe(true);
    expect(channel.validateConfig({ phoneNumber: '' })).toBe(false);
  });
});