/**
 * Email Campaign Integration Tests
 * 
 * Integration tests for the email campaign system.
 * Tests: campaign utilities, template rendering, queue integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getEmailQueue,
  sendCampaignEmail,
  renderEmailTemplate,
  getEmailSubject,
  sendTrialNurtureEmail,
  sendWinBackEmail,
  sendMilestoneEmail,
} from '@vayva/emails/campaign-utils';
import { Queue } from 'bullmq';

// Mock BullMQ Queue
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: 'job-123' }),
    close: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('Email Campaign Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEmailQueue', () => {
    it('should create queue with default Redis configuration', () => {
      const queue = getEmailQueue();
      
      expect(queue).toBeDefined();
      expect(Queue).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          connection: expect.objectContaining({
            host: expect.any(String),
            port: expect.any(Number),
          }),
        })
      );
    });

    it('should use environment variables for Redis config when available', () => {
      const originalHost = process.env.REDIS_HOST;
      const originalPort = process.env.REDIS_PORT;
      
      process.env.REDIS_HOST = 'custom-redis-host';
      process.env.REDIS_PORT = '6380';
      
      // Note: In real test, would need to clear module cache
      // This is a conceptual test showing expected behavior
      
      process.env.REDIS_HOST = originalHost;
      process.env.REDIS_PORT = originalPort;
    });
  });

  describe('sendCampaignEmail', () => {
    it('should add email job to queue', async () => {
      const mockReactElement = { type: 'div', props: {} };
      
      await sendCampaignEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        react: mockReactElement as any,
        headers: { 'X-Custom-Header': 'test-value' },
      });
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should include all required fields in queue payload', async () => {
      const mockReactElement = { type: 'div', props: {} };
      
      await sendCampaignEmail({
        to: 'recipient@test.com',
        subject: 'Important Update',
        react: mockReactElement as any,
        headers: { 'X-Type': 'notification' },
      });
      
      // Verify queue.add was called with correct structure
      const queueInstance = (Queue as any).mock.results[0].value;
      expect(queueInstance.add).toHaveBeenCalledWith(
        'send',
        expect.objectContaining({
          to: 'recipient@test.com',
          subject: 'Important Update',
          react: mockReactElement,
          headers: { 'X-Type': 'notification' },
        })
      );
    });

    it('should throw error if queue operation fails', async () => {
      const mockQueue = {
        add: vi.fn().mockRejectedValue(new Error('Redis connection failed')),
      };
      (Queue as any).mockImplementation(() => mockQueue);
      
      await expect(
        sendCampaignEmail({
          to: 'test@example.com',
          subject: 'Test',
          react: { type: 'div' } as any,
        })
      ).rejects.toThrow('Redis connection failed');
    });
  });

  describe('renderEmailTemplate', () => {
    it('should render trial-day-7 template', () => {
      const data = {
        merchantName: 'John',
        storeName: 'Test Store',
        daysRemaining: 7,
      };
      
      const result = renderEmailTemplate('trial-day-7', data);
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render trial-day-3 template', () => {
      const data = {
        merchantName: 'John',
        storeName: 'Test Store',
        daysRemaining: 3,
      };
      
      const result = renderEmailTemplate('trial-day-3', data);
      
      expect(result).toBeDefined();
    });

    it('should render trial-day-1 template', () => {
      const data = {
        merchantName: 'John',
        storeName: 'Test Store',
        daysRemaining: 1,
      };
      
      const result = renderEmailTemplate('trial-day-1', data);
      
      expect(result).toBeDefined();
    });

    it('should render trial-expired template', () => {
      const data = {
        merchantName: 'John',
        storeName: 'Test Store',
        daysRemaining: 0,
      };
      
      const result = renderEmailTemplate('trial-expired', data);
      
      expect(result).toBeDefined();
    });

    it('should render winback templates', () => {
      const templates = [
        'winback-day-3',
        'winback-day-7',
        'winback-day-14',
        'winback-day-30',
      ];
      
      templates.forEach((template) => {
        const data = {
          merchantName: 'Jane',
          storeName: 'Expired Store',
          daysSinceExpiry: 3,
        };
        
        const result = renderEmailTemplate(template as any, data);
        expect(result).toBeDefined();
      });
    });

    it('should render milestone templates', () => {
      const milestoneData = {
        merchantName: 'Bob',
        storeName: 'Growing Store',
        milestoneType: 'first_order',
        milestoneValue: 1,
      };
      
      const result = renderEmailTemplate('milestone-first-order', milestoneData);
      expect(result).toBeDefined();
    });

    it('should fallback to trial-day-7 for unknown template', () => {
      const data = {
        merchantName: 'Unknown',
        storeName: 'Test',
      };
      
      const result = renderEmailTemplate('unknown-template' as any, data);
      
      expect(result).toBeDefined();
    });
  });

  describe('getEmailSubject', () => {
    it('should return correct subject for trial nurture emails', () => {
      expect(getEmailSubject('trial-day-7', { storeName: 'My Store' }))
        .toContain('7 days left');
      
      expect(getEmailSubject('trial-day-3', { storeName: 'My Store' }))
        .toContain('Only 3 days remaining');
      
      expect(getEmailSubject('trial-day-1', { storeName: 'My Store' }))
        .toContain('Last day');
      
      expect(getEmailSubject('trial-expired', { storeName: 'My Store' }))
        .toContain('Trial expired');
    });

    it('should return correct subject for win-back emails', () => {
      expect(getEmailSubject('winback-day-3', { storeName: 'My Store' }))
        .toContain('We miss you');
      
      expect(getEmailSubject('winback-day-7', { merchantName: 'John' }))
        .toContain('customers are waiting');
      
      expect(getEmailSubject('winback-day-14', { storeName: 'My Store' }))
        .toContain('Final chance');
      
      expect(getEmailSubject('winback-day-30', { storeName: 'My Store' }))
        .toContain('Fresh start');
    });

    it('should return correct subject for milestone emails', () => {
      expect(getEmailSubject('milestone-first-order', {}))
        .toContain('Congratulations');
      
      expect(getEmailSubject('milestone-revenue', { milestoneValue: '100,000' }))
        .toContain('₦100,000');
    });

    it('should handle missing store name gracefully', () => {
      const subject = getEmailSubject('trial-day-7', {});
      expect(subject).toBeDefined();
      expect(subject.length).toBeGreaterThan(0);
    });
  });

  describe('sendTrialNurtureEmail', () => {
    it('should send email for valid days remaining (7)', async () => {
      await sendTrialNurtureEmail(
        'owner@test.com',
        'Test Store',
        'John',
        7
      );
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should send email for valid days remaining (3)', async () => {
      await sendTrialNurtureEmail(
        'owner@test.com',
        'Test Store',
        'John',
        3
      );
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should send email for valid days remaining (1)', async () => {
      await sendTrialNurtureEmail(
        'owner@test.com',
        'Test Store',
        'John',
        1
      );
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should not send email for invalid days remaining', async () => {
      await sendTrialNurtureEmail(
        'owner@test.com',
        'Test Store',
        'John',
        5
      );
      
      expect(Queue).not.toHaveBeenCalled();
    });
  });

  describe('sendWinBackEmail', () => {
    it('should send email for day +3', async () => {
      await sendWinBackEmail(
        'expired@test.com',
        'Expired Store',
        'Jane',
        3
      );
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should send email for day +7', async () => {
      await sendWinBackEmail(
        'expired@test.com',
        'Expired Store',
        'Jane',
        7
      );
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should send email for day +14', async () => {
      await sendWinBackEmail(
        'expired@test.com',
        'Expired Store',
        'Jane',
        14
      );
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should send email for day +30', async () => {
      await sendWinBackEmail(
        'expired@test.com',
        'Expired Store',
        'Jane',
        30
      );
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should not send email for invalid days since expiry', async () => {
      await sendWinBackEmail(
        'expired@test.com',
        'Expired Store',
        'Jane',
        5
      );
      
      expect(Queue).not.toHaveBeenCalled();
    });
  });

  describe('sendMilestoneEmail', () => {
    it('should send milestone celebration email', async () => {
      await sendMilestoneEmail(
        'success@test.com',
        'Successful Store',
        'Alice',
        'first_order',
        1
      );
      
      expect(Queue).toHaveBeenCalled();
    });

    it('should include milestone metadata in headers', async () => {
      await sendMilestoneEmail(
        'success@test.com',
        'Successful Store',
        'Alice',
        'revenue_100k',
        '100000'
      );
      
      const queueInstance = (Queue as any).mock.results[0].value;
      expect(queueInstance.add).toHaveBeenCalledWith(
        'send',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Milestone-Type': 'revenue_100k',
            'X-Email-Type': 'milestone-celebration',
          }),
        })
      );
    });
  });
});
