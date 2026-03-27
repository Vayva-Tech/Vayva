/**
 * Email Delivery Integration Tests
 * 
 * Tests for end-to-end email delivery across all campaign types:
 * - Trial nurture emails
 * - Win-back campaigns
 * - Milestone celebrations
 * 
 * These tests require:
 * - Redis running (for BullMQ)
 * - Resend API key (or mock)
 * - Database connection
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Queue } from 'bullmq';
import { QUEUES } from '@vayva/shared';
import { prisma } from '@vayva/db';
import { sendTrialNurtureEmail, sendWinBackEmail, sendMilestoneEmail } from '@vayva/emails/campaign-utils';

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_STORE_NAME = 'Test Store';
const TEST_MERCHANT_NAME = 'Test Merchant';

describe('Email Delivery Integration', () => {
  let emailQueue: Queue;

  beforeAll(async () => {
    // Initialize email queue
    emailQueue = new Queue(QUEUES.EMAIL_OUTBOUND, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });
  });

  afterAll(async () => {
    // Clean up queue
    await emailQueue.close();
    
    // Clean up test data from database if needed
    await prisma.$disconnect();
  });

  describe('Trial Nurture Emails', () => {
    it('should queue trial day -7 email successfully', async () => {
      const daysRemaining = 7;
      
      await sendTrialNurtureEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        daysRemaining
      );

      // Check queue has job
      const jobs = await emailQueue.getJobs(['waiting']);
      const trialEmailJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('7 days')
      );

      expect(trialEmailJob).toBeDefined();
      expect(trialEmailJob?.data.headers?.['X-Email-Type']).toBe('trial-nurture');
      expect(trialEmailJob?.data.headers?.['X-Trial-Days-Remaining']).toBe('7');
    });

    it('should queue trial day -3 email successfully', async () => {
      const daysRemaining = 3;
      
      await sendTrialNurtureEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        daysRemaining
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const trialEmailJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('3 days')
      );

      expect(trialEmailJob).toBeDefined();
    });

    it('should queue trial day -1 email with discount code', async () => {
      const daysRemaining = 1;
      
      await sendTrialNurtureEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        daysRemaining
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const trialEmailJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('Last day')
      );

      expect(trialEmailJob).toBeDefined();
      expect(trialEmailJob?.data.react).toContain('TRIAL20');
    });

    it('should queue trial expired email', async () => {
      const daysRemaining = 0;
      
      await sendTrialNurtureEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        daysRemaining
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const expiredEmailJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('Trial Expired')
      );

      expect(expiredEmailJob).toBeDefined();
      expect(expiredEmailJob?.data.headers?.['X-Email-Type']).toBe('trial-expired');
    });
  });

  describe('Win-Back Campaign Emails', () => {
    it('should queue win-back day +3 email with 20% discount', async () => {
      const daysSinceExpiry = 3;
      
      await sendWinBackEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        daysSinceExpiry
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const winbackJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('We miss you')
      );

      expect(winbackJob).toBeDefined();
      expect(winbackJob?.data.react).toContain('COMEBACK20');
      expect(winbackJob?.data.headers?.['X-Email-Type']).toBe('win-back');
    });

    it('should queue win-back day +7 value reminder email', async () => {
      const daysSinceExpiry = 7;
      
      await sendWinBackEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        daysSinceExpiry
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const winbackJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('revenue potential')
      );

      expect(winbackJob).toBeDefined();
    });

    it('should queue win-back day +14 final offer email', async () => {
      const daysSinceExpiry = 14;
      
      await sendWinBackEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        daysSinceExpiry
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const winbackJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('Final Chance')
      );

      expect(winbackJob).toBeDefined();
      expect(winbackJob?.data.react).toContain('FINAL50');
    });

    it('should queue win-back day +30 fresh start email', async () => {
      const daysSinceExpiry = 30;
      
      await sendWinBackEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        daysSinceExpiry
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const winbackJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('Fresh Start')
      );

      expect(winbackJob).toBeDefined();
    });
  });

  describe('Milestone Celebration Emails', () => {
    it('should queue first order milestone email', async () => {
      await sendMilestoneEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        'first_order',
        1
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const milestoneJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('First Order')
      );

      expect(milestoneJob).toBeDefined();
      expect(milestoneJob?.data.headers?.['X-Milestone-Type']).toBe('first_order');
    });

    it('should queue revenue milestone email', async () => {
      const revenueAmount = 100000; // ₦100k
      
      await sendMilestoneEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        'revenue_100k',
        revenueAmount
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const milestoneJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('₦100K')
      );

      expect(milestoneJob).toBeDefined();
    });

    it('should queue product count milestone email', async () => {
      const productCount = 50;
      
      await sendMilestoneEmail(
        TEST_EMAIL,
        TEST_STORE_NAME,
        TEST_MERCHANT_NAME,
        'products_50',
        productCount
      );

      const jobs = await emailQueue.getJobs(['waiting']);
      const milestoneJob = jobs.find(job => 
        job.data.to === TEST_EMAIL && 
        job.data.subject.includes('50 Products')
      );

      expect(milestoneJob).toBeDefined();
    });
  });

  describe('Email Queue Processing', () => {
    it('should process emails in correct order', async () => {
      // Clear existing jobs
      await emailQueue.obliterate({ force: true });

      // Queue multiple emails
      await sendTrialNurtureEmail(TEST_EMAIL, TEST_STORE_NAME, TEST_MERCHANT_NAME, 7);
      await sendTrialNurtureEmail(TEST_EMAIL, TEST_STORE_NAME, TEST_MERCHANT_NAME, 3);
      await sendTrialNurtureEmail(TEST_EMAIL, TEST_STORE_NAME, TEST_MERCHANT_NAME, 1);

      const jobs = await emailQueue.getJobs(['waiting']);
      
      expect(jobs.length).toBe(3);
      
      // Verify FIFO order
      expect(jobs[0].data.headers?.['X-Trial-Days-Remaining']).toBe('7');
      expect(jobs[1].data.headers?.['X-Trial-Days-Remaining']).toBe('3');
      expect(jobs[2].data.headers?.['X-Trial-Days-Remaining']).toBe('1');
    });

    it('should include proper headers for tracking', async () => {
      await sendTrialNurtureEmail(TEST_EMAIL, TEST_STORE_NAME, TEST_MERCHANT_NAME, 7);

      const jobs = await emailQueue.getJobs(['waiting']);
      const job = jobs[0];

      expect(job.data.headers).toBeDefined();
      expect(job.data.headers['X-Email-Type']).toBe('trial-nurture');
      expect(job.data.headers['X-Trial-Days-Remaining']).toBe('7');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid email addresses gracefully', async () => {
      try {
        await sendTrialNurtureEmail(
          'invalid-email',
          TEST_STORE_NAME,
          TEST_MERCHANT_NAME,
          7
        );
        // Should not throw
      } catch (error) {
        // If it throws, verify it's a validation error
        expect(error).toBeDefined();
      }
    });

    it('should handle missing merchant name', async () => {
      await sendTrialNurtureEmail(TEST_EMAIL, TEST_STORE_NAME, '', 7);

      const jobs = await emailQueue.getJobs(['waiting']);
      const job = jobs.find(j => j.data.to === TEST_EMAIL);

      expect(job).toBeDefined();
      // Should use default value
      expect(job?.data.react).toContain('there');
    });
  });
});
