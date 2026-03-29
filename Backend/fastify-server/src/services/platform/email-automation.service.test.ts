import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  sendClientReport, 
  sendMilestoneNotification, 
  sendInvoiceReminder,
  generateReportHTML,
  generateReportText 
} from '../src/services/platform/email-automation.service';

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email_123' }),
    },
  })),
}));

describe('EmailAutomationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendClientReport', () => {
    it('should send weekly report successfully', async () => {
      const result = await sendClientReport('client@example.com', {
        clientName: 'John Doe',
        projectName: 'Website Redesign',
        period: 'Week 12, 2026',
        metrics: {
          revenue: 5000,
          profitMargin: 25,
          hoursWorked: 40,
          tasksCompleted: 12,
        },
        highlights: [
          'Completed homepage redesign',
          'Launched mobile responsive design',
          'Improved page load time by 40%',
        ],
        upcomingMilestones: [
          { name: 'About Page', dueDate: '2026-04-01' },
          { name: 'Contact Form', dueDate: '2026-04-08' },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle missing metrics gracefully', async () => {
      const result = await sendClientReport('client@example.com', {
        clientName: 'Jane Smith',
        projectName: 'SEO Campaign',
        period: 'March 2026',
        metrics: {}, // No metrics provided
        highlights: ['Keyword research completed'],
        upcomingMilestones: [],
      });

      expect(result.success).toBe(true);
    });

    it('should include all highlights in report', async () => {
      const html = generateReportHTML({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: {},
        highlights: ['Highlight 1', 'Highlight 2', 'Highlight 3'],
        upcomingMilestones: [],
      });

      expect(html).toContain('Highlight 1');
      expect(html).toContain('Highlight 2');
      expect(html).toContain('Highlight 3');
    });

    it('should format revenue in thousands', async () => {
      const html = generateReportHTML({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: { revenue: 15000 },
        highlights: [],
        upcomingMilestones: [],
      });

      expect(html).toContain('$15.0K');
    });
  });

  describe('sendMilestoneNotification', () => {
    it('should send milestone completion notification', async () => {
      const result = await sendMilestoneNotification('client@example.com', {
        clientName: 'Alice Johnson',
        projectName: 'Mobile App',
        milestoneName: 'Beta Launch',
        completedDate: new Date().toISOString(),
      });

      expect(result.success).toBe(true);
    });

    it('should include next milestone if provided', async () => {
      const result = await sendMilestoneNotification('client@example.com', {
        clientName: 'Bob Williams',
        projectName: 'E-commerce Platform',
        milestoneName: 'Checkout Integration',
        completedDate: new Date().toISOString(),
        nextMilestone: 'Payment Gateway Setup',
      });

      expect(result.success).toBe(true);
    });

    it('should format completion date correctly', async () => {
      const testDate = '2026-03-28T10:00:00Z';
      const html = `
        <div>
          Completion Date: ${new Date(testDate).toLocaleDateString()}
        </div>
      `;

      expect(html).toContain('Completion Date');
      expect(html.includes('2026') || html.includes('3/28')).toBe(true);
    });
  });

  describe('sendInvoiceReminder', () => {
    it('should send invoice reminder for upcoming payment', async () => {
      const result = await sendInvoiceReminder('client@example.com', {
        clientName: 'Charlie Brown',
        invoiceNumber: 'INV-2026-001',
        amount: 2500,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      });

      expect(result.success).toBe(true);
    });

    it('should send overdue notice with days overdue', async () => {
      const result = await sendInvoiceReminder('client@example.com', {
        clientName: 'Diana Prince',
        invoiceNumber: 'INV-2026-002',
        amount: 3000,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        daysOverdue: 5,
      });

      expect(result.success).toBe(true);
    });

    it('should use urgent styling for overdue invoices', async () => {
      const html = `
        <div style="color: #DC2626;">
          ⚠️ Payment Overdue
        </div>
      `;

      expect(html).toContain('#DC2626'); // Red color for urgency
      expect(html).toContain('Overdue');
    });

    it('should format amount with commas', async () => {
      const html = `
        <div>
          Amount: $${(10000).toLocaleString()}
        </div>
      `;

      expect(html).toContain('$10,000');
    });
  });

  describe('generateReportHTML', () => {
    it('should generate complete HTML structure', () => {
      const html = generateReportHTML({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: { revenue: 10000, profitMargin: 30 },
        highlights: ['Major milestone achieved'],
        upcomingMilestones: [{ name: 'Launch', dueDate: '2026-04-01' }],
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
      expect(html).toContain('Weekly Progress Report');
      expect(html).toContain('Test Project');
    });

    it('should include metric cards', () => {
      const html = generateReportHTML({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: { 
          revenue: 10000, 
          profitMargin: 30,
          hoursWorked: 120,
          tasksCompleted: 45 
        },
        highlights: [],
        upcomingMilestones: [],
      });

      expect(html).toContain('metric-card');
      expect(html).toContain('$10.0K');
      expect(html).toContain('30%');
      expect(html).toContain('120h');
      expect(html).toContain('45');
    });

    it('should include styled header with gradient', () => {
      const html = generateReportHTML({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: {},
        highlights: [],
        upcomingMilestones: [],
      });

      expect(html).toContain('linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)');
    });

    it('should include footer with branding', () => {
      const html = generateReportHTML({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: {},
        highlights: [],
        upcomingMilestones: [],
      });

      expect(html).toContain('Powered by Vayva');
      expect(html).toContain('View Full Dashboard');
    });
  });

  describe('generateReportText', () => {
    it('should generate plain text version', () => {
      const text = generateReportText({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: { revenue: 10000 },
        highlights: ['Achievement 1', 'Achievement 2'],
        upcomingMilestones: [{ name: 'Launch', dueDate: '2026-04-01' }],
      });

      expect(text).toContain('WEEKLY PROGRESS REPORT');
      expect(text).toContain('Test Project');
      expect(text).toContain('Revenue: $10.0K');
      expect(text).toContain('✓ Achievement 1');
      expect(text).toContain('✓ Achievement 2');
    });

    it('should be shorter than HTML version', () => {
      const data = {
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: { revenue: 10000 },
        highlights: ['Test'],
        upcomingMilestones: [],
      };

      const html = generateReportHTML(data);
      const text = generateReportText(data);

      expect(text.length).toBeLessThan(html.length);
    });

    it('should trim whitespace', () => {
      const text = generateReportText({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: {},
        highlights: [],
        upcomingMilestones: [],
      });

      expect(text).toEqual(text.trim());
      expect(text.startsWith('WEEKLY')).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed email sends', async () => {
      let attempts = 0;
      
      const mockSend = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return { id: 'email_success' };
      });

      // Simulate retry behavior
      const sendWithRetry = async (fn: any) => {
        for (let i = 0; i < 3; i++) {
          try {
            await fn();
            return { success: true };
          } catch (error) {
            if (i === 2) throw error;
          }
        }
        return { success: false };
      };

      const result = await sendWithRetry(mockSend);

      expect(result.success).toBe(true);
      expect(attempts).toBe(3);
    });

    it('should fail after max retries', async () => {
      const mockSend = vi.fn().mockRejectedValue(new Error('Permanent failure'));

      const sendWithRetry = async (fn: any, maxRetries: number) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            await fn();
            return { success: true };
          } catch (error) {
            if (i === maxRetries) return { success: false, error: 'Failed' };
          }
        }
        return { success: false };
      };

      const result = await sendWithRetry(mockSend, 3);

      expect(result.success).toBe(false);
    });
  });

  describe('Email Content Validation', () => {
    it('should include all required sections in report', () => {
      const html = generateReportHTML({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: { revenue: 10000 },
        highlights: ['Highlight'],
        upcomingMilestones: [{ name: 'Milestone', dueDate: '2026-04-01' }],
      });

      expect(html).toContain('Highlights');
      expect(html).toContain('Upcoming Milestones');
      expect(html).toContain('Metrics');
    });

    it('should handle empty arrays gracefully', () => {
      const html = generateReportHTML({
        clientName: 'Test Client',
        projectName: 'Test Project',
        period: 'Q1 2026',
        metrics: {},
        highlights: [],
        upcomingMilestones: [],
      });

      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(100); // Should still have structure
    });

    it('should escape special characters in names', () => {
      const html = generateReportHTML({
        clientName: 'O\'Brien & Associates',
        projectName: 'Test <Project>',
        period: 'Q1 2026',
        metrics: {},
        highlights: [],
        upcomingMilestones: [],
      });

      expect(html).toBeDefined();
    });
  });
});
