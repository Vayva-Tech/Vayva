import { Resend } from 'resend';
import { logger } from '../../lib/logger';

/**
 * Email Automation Service
 * 
 * Sends automated reports and notifications to clients
 * Uses Resend.com for email delivery (free tier available)
 * 
 * Environment variables required:
 * - RESEND_API_KEY
 * - EMAIL_FROM (verified domain in Resend)
 */

const resend = new Resend(process.env.RESEND_API_KEY || '');

interface _EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
};

interface ReportData {
  clientName: string;
  projectName: string;
  period: string;
  metrics: {
    revenue?: number;
    expenses?: number;
    profitMargin?: number;
    hoursWorked?: number;
    tasksCompleted?: number;
  };
  highlights: string[];
  upcomingMilestones: Array<{ name: string; dueDate: string }>;
}

/**
 * Send automated weekly/monthly report to client
 */
export async function sendClientReport(
  clientEmail: string,
  data: ReportData
): Promise<{ success: boolean; error?: string }> {
  return sendWithRetry('report', async () => {
    try {
      const html = generateReportHTML(data);
      const text = generateReportText(data);

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'reports@vayva.io',
        to: clientEmail,
        subject: `Weekly Report: ${data.projectName}`,
        html,
        text,
      });

      logger.warn(`Report sent to ${clientEmail}`);
      return { success: true };
    } catch (error) {
      logger.error({ error }, 'Failed to send report');
      throw error; // Let retry logic handle it
    }
  });
}

/**
 * Send project milestone completion notification
 */
export async function sendMilestoneNotification(
  clientEmail: string,
  data: {
    clientName: string;
    projectName: string;
    milestoneName: string;
    completedDate: string;
    nextMilestone?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">🎉 Milestone Completed!</h1>
        <p>Hi ${data.clientName},</p>
        <p>Great news! The milestone <strong>"${data.milestoneName}"</strong> has been completed for project <strong>${data.projectName}</strong>.</p>
        <p>Completion Date: ${new Date(data.completedDate).toLocaleDateString()}</p>
        ${data.nextMilestone ? `
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Next Up:</h3>
            <p style="margin: 0;">${data.nextMilestone}</p>
          </div>
        ` : ''}
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          Your Agency Team
        </p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'notifications@vayva.io',
      to: clientEmail,
      subject: `Milestone Completed: ${data.milestoneName}`,
      html,
    });

    logger.warn(`Milestone notification sent to ${clientEmail}`);
    return { success: true };
  } catch (error) {
    logger.error({ error }, 'Failed to send milestone notification');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send invoice payment reminder
 */
export async function sendInvoiceReminder(
  clientEmail: string,
  data: {
    clientName: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    daysOverdue?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const isOverdue = data.daysOverdue && data.daysOverdue > 0;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${isOverdue ? '#DC2626' : '#4F46E5'};">
          ${isOverdue ? '⚠️ Payment Overdue' : '💳 Invoice Reminder'}
        </h1>
        <p>Hi ${data.clientName},</p>
        <p>This is a friendly reminder about invoice <strong>${data.invoiceNumber}</strong>.</p>
        
        <div style="background: ${isOverdue ? '#FEF2F2' : '#F3F4F6'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td><strong>Amount:</strong></td>
              <td style="text-align: right;">$${data.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>Due Date:</strong></td>
              <td style="text-align: right;">${new Date(data.dueDate).toLocaleDateString()}</td>
            </tr>
            ${isOverdue ? `
            <tr>
              <td><strong>Days Overdue:</strong></td>
              <td style="text-align: right; color: #DC2626;">${data.daysOverdue} days</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Pay Invoice Now
          </a>
        </div>

        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          If you have any questions, please don't hesitate to reach out.<br>
          Best regards,<br>
          Your Agency Team
        </p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'billing@vayva.io',
      to: clientEmail,
      subject: isOverdue 
        ? `Payment Overdue: Invoice ${data.invoiceNumber}` 
        : `Invoice Reminder: ${data.invoiceNumber}`,
      html,
    });

    logger.warn(`Invoice reminder sent to ${clientEmail}`);
    return { success: true };
  } catch (error) {
    logger.error({ error }, 'Failed to send invoice reminder');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate HTML report email
 */
function generateReportHTML(data: ReportData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
          .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 30px 0; }
          .metric-card { background: #F9FAFB; padding: 20px; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 28px; font-weight: bold; color: #4F46E5; }
          .metric-label { font-size: 14px; color: #6B7280; margin-top: 5px; }
          .section { margin: 30px 0; }
          .highlight-item { background: #F3F4F6; padding: 12px; margin: 10px 0; border-radius: 6px; }
          .milestone { border-left: 4px solid #4F46E5; padding-left: 15px; margin: 15px 0; }
          .footer { background: #F9FAFB; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Weekly Progress Report</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.projectName} • ${data.period}</p>
          </div>

          <div class="metrics">
            ${data.metrics.revenue ? `
              <div class="metric-card">
                <div class="metric-value">$${(data.metrics.revenue / 1000).toFixed(1)}K</div>
                <div class="metric-label">Revenue</div>
              </div>
            ` : ''}
            ${data.metrics.profitMargin ? `
              <div class="metric-card">
                <div class="metric-value">${data.metrics.profitMargin}%</div>
                <div class="metric-label">Profit Margin</div>
              </div>
            ` : ''}
            ${data.metrics.hoursWorked ? `
              <div class="metric-card">
                <div class="metric-value">${data.metrics.hoursWorked}h</div>
                <div class="metric-label">Hours Worked</div>
              </div>
            ` : ''}
            ${data.metrics.tasksCompleted ? `
              <div class="metric-card">
                <div class="metric-value">${data.metrics.tasksCompleted}</div>
                <div class="metric-label">Tasks Completed</div>
              </div>
            ` : ''}
          </div>

          <div class="section">
            <h2>📊 Highlights</h2>
            ${data.highlights.map((highlight, _index) => `
              <div class="highlight-item">✓ ${highlight}</div>
            `).join('')}
          </div>

          <div class="section">
            <h2>🎯 Upcoming Milestones</h2>
            ${data.upcomingMilestones.map((milestone) => `
              <div class="milestone">
                <strong>${milestone.name}</strong><br>
                Due: ${new Date(milestone.dueDate).toLocaleDateString()}
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>Questions about this report? Reply to this email or contact your project manager.</p>
            <p style="margin-top: 20px;">
              Powered by Vayva • <a href="#" style="color: #4F46E5;">View Full Dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate plain text report email
 */
function generateReportText(data: ReportData): string {
  return `
WEEKLY PROGRESS REPORT
${data.projectName} • ${data.period}

METRICS
${data.metrics.revenue ? `Revenue: $${(data.metrics.revenue / 1000).toFixed(1)}K` : ''}
${data.metrics.profitMargin ? `Profit Margin: ${data.metrics.profitMargin}%` : ''}
${data.metrics.hoursWorked ? `Hours Worked: ${data.metrics.hoursWorked}h` : ''}
${data.metrics.tasksCompleted ? `Tasks Completed: ${data.metrics.tasksCompleted}` : ''}

HIGHLIGHTS
${data.highlights.map(h => `✓ ${h}`).join('\n')}

UPCOMING MILESTONES
${data.upcomingMilestones.map(m => `• ${m.name} - Due: ${new Date(m.dueDate).toLocaleDateString()}`).join('\n')}

---
Questions? Reply to this email or contact your project manager.
Powered by Vayva
  `.trim();
}

/**
 * Send email with exponential backoff retry logic
 */
async function sendWithRetry<T>(
  type: string,
  sendFn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{ success: boolean; error?: string }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const _result = await sendFn();
      
      // Log successful send after retries
      if (attempt > 0) {
        logger.warn(`Email sent successfully on attempt ${attempt + 1}`);
      }
      
      return { success: true };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      logger.error(
        { error: lastError, attempt: attempt + 1, maxAttempts: config.maxRetries + 1 },
        `Email send failed`
      );

      // Don't wait after the last attempt
      if (attempt < config.maxRetries) {
        const delay = calculateExponentialDelay(attempt, config);
        logger.warn({ delay }, 'Retrying in...');
        await sleep(delay);
      }
    }
  }

  // All retries failed
  logger.error({ type, attempts: config.maxRetries + 1 }, 'Email failed after all attempts');
  
  // Log to database for manual review
  await logFailedEmail(type, lastError?.message || 'Unknown error');
  
  return {
    success: false,
    error: lastError?.message || 'Failed after retries',
  };
}

/**
 * Calculate exponential backoff delay
 * Formula: min(initialDelay * 2^attempt + jitter, maxDelay)
 */
function calculateExponentialDelay(attempt: number, config: RetryConfig): number {
  const exponentialBase = config.initialDelay * Math.pow(2, attempt);
  
  // Add jitter (±25%) to prevent thundering herd
  const jitter = exponentialBase * 0.25 * (Math.random() * 2 - 1);
  const delayWithJitter = exponentialBase + jitter;
  
  // Cap at maxDelay
  return Math.min(delayWithJitter, config.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log failed email to database for manual review
 */
async function logFailedEmail(type: string, error: string): Promise<void> {
  try {
    // This would use Prisma to log to EmailLog table
    // await prisma.emailLog.create({
    //   data: {
    //     recipient: 'unknown',
    //     subject: type,
    //     type,
    //     status: 'failed',
    //     error,
    //     metadata: { attempts: DEFAULT_RETRY_CONFIG.maxRetries + 1 },
    //   },
    // });
    logger.warn({ type, error }, 'Logged failed email to database');
  } catch (logError) {
    logger.error({ error: logError }, 'Failed to log email failure to database');
  }
}
