import { prisma } from '@vayva/infra/db';
import { sendEmail } from '@vayva/emails';
import { differenceInBusinessDays } from 'date-fns';

/**
 * ACCESSIBILITY SLA BREACH NOTIFICATION SYSTEM
 * 
 * Monitors accessibility issues for SLA breaches:
 * - Initial response must be within 5 business days
 * - High/critical severity issues require escalation
 * - Daily check runs via cron job
 */

interface SLABreachNotification {
  issueId: string;
  issueNumber: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedDate: Date;
  assignedTo: string | null;
  daysSinceReported: number;
  breachType: 'response_overdue' | 'resolution_overdue' | 'critical_escalation';
}

/**
 * Check for SLA breaches and send notifications
 * Run daily via cron job (e.g., GitHub Actions scheduled workflow)
 */
export async function checkSLABreaches(): Promise<void> {
  console.log('[SLA Monitor] Checking for accessibility SLA breaches...');
  
  try {
    // Get all open issues that haven't been responded to yet
    const openIssues = await prisma.accessibilityIssue.findMany({
      where: {
        status: {
          in: ['reported', 'triaged'], // Not yet in-progress
        },
      },
      include: {
        updates: {
          take: 1,
          orderBy: { date: 'asc' },
        },
      },
    });
    
    const breaches: SLABreachNotification[] = [];
    
    for (const issue of openIssues) {
      const daysSinceReported = differenceInBusinessDays(
        new Date(),
        new Date(issue.reportedDate)
      );
      
      // Check for response SLA breach (>5 business days without update)
      if (daysSinceReported > 5 && issue.updates.length === 0) {
        breaches.push({
          issueId: issue.id,
          issueNumber: issue.issueNumber,
          title: issue.title,
          severity: issue.severity as any,
          reportedDate: issue.reportedDate,
          assignedTo: issue.assignedTo,
          daysSinceReported,
          breachType: 'response_overdue',
        });
      }
      
      // Check for critical/high severity immediate escalation
      if ((issue.severity === 'critical' || issue.severity === 'high') && daysSinceReported > 1) {
        breaches.push({
          issueId: issue.id,
          issueNumber: issue.issueNumber,
          title: issue.title,
          severity: issue.severity as any,
          reportedDate: issue.reportedDate,
          assignedTo: issue.assignedTo,
          daysSinceReported,
          breachType: 'critical_escalation',
        });
      }
    }
    
    // Send notifications for each breach
    for (const breach of breaches) {
      await handleBreach(breach);
    }
    
    console.log(`[SLA Monitor] Found ${breaches.length} SLA breaches`);
    
  } catch (error) {
    console.error('[SLA Monitor] Error checking SLA breaches:', error);
    throw error;
  }
}

/**
 * Handle individual SLA breach
 */
async function handleBreach(breach: SLABreachNotification): Promise<void> {
  console.log(`[SLA Monitor] Handling breach for ${breach.issueNumber}`);
  
  // Determine recipients based on breach type and severity
  const recipients = determineRecipients(breach);
  
  // Send email notification
  await sendEmail({
    to: recipients,
    subject: `🚨 SLA Breach: Accessibility Issue ${breach.issueNumber}`,
    template: 'accessibility-sla-breach',
    data: {
      issueNumber: breach.issueNumber,
      title: breach.title,
      severity: breach.severity,
      reportedDate: breach.reportedDate.toISOString(),
      daysSinceReported: breach.daysSinceReported,
      assignedTo: breach.assignedTo,
      breachType: breach.breachType,
      actionRequired: getActionRequired(breach),
    },
  });
  
  // Log breach in database
  await prisma.issueUpdate.create({
    data: {
      issueId: breach.issueId,
      author: 'system-sla-monitor',
      comment: `SLA breach detected: ${breach.breachType}. Days since reported: ${breach.daysSinceReported}. Notification sent to ${recipients.join(', ')}`,
    },
  });
  
  // For critical breaches, also send Slack notification
  if (breach.severity === 'critical' || breach.breachType === 'critical_escalation') {
    await sendSlackNotification(breach);
  }
}

/**
 * Determine email recipients based on breach type
 */
function determineRecipients(breach: SLABreachNotification): string[] {
  const recipients: string[] = ['support@vayva.ng', 'compliance@vayva.ng'];
  
  // Add assigned team
  if (breach.assignedTo) {
    recipients.push(`${breach.assignedTo.toLowerCase().replace(' ', '.')}@vayva.ng`);
  }
  
  // Escalate to leadership for critical breaches
  if (breach.severity === 'critical' || breach.breachType === 'critical_escalation') {
    recipients.push('engineering-lead@vayva.ng');
    recipients.push('cto@vayva.ng');
  }
  
  return recipients;
}

/**
 * Get action required text based on breach type
 */
function getActionRequired(breach: SLABreachNotification): string {
  switch (breach.breachType) {
    case 'response_overdue':
      return 'Immediate response required. Acknowledge the issue and provide initial assessment within 24 hours.';
    case 'critical_escalation':
      return 'CRITICAL: High-severity issue requires immediate attention. Assign senior engineer and begin investigation.';
    default:
      return 'Review and respond to this accessibility issue as soon as possible.';
  }
}

/**
 * Send Slack notification for critical breaches
 */
async function sendSlackNotification(breach: SLABreachNotification): Promise<void> {
  const slackWebhookUrl = process.env.SLACK_ACCESSIBILITY_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    console.warn('[SLA Monitor] Slack webhook URL not configured');
    return;
  }
  
  const payload = {
    text: `🚨 Accessibility SLA Breach`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 Accessibility SLA Breach - ${breach.issueNumber}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Issue:*\n${breach.title}`,
          },
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${breach.severity.toUpperCase()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Reported:*\n${breach.reportedDate.toLocaleDateString()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Days Overdue:*\n${breach.daysSinceReported}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Action Required:*\n${getActionRequired(breach)}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View in Ops Console' },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/support/accessibility`,
          },
        ],
      },
    ],
  };
  
  await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Generate weekly SLA compliance report
 */
export async function generateWeeklySLAReport(): Promise<void> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const issues = await prisma.accessibilityIssue.findMany({
    where: {
      reportedDate: { gte: sevenDaysAgo },
    },
    include: {
      updates: true,
    },
  });
  
  const stats = {
    total: issues.length,
    respondedWithin24h: issues.filter(i => {
      const firstUpdate = i.updates[0];
      if (!firstUpdate) return false;
      const hoursToResponse = (firstUpdate.date.getTime() - i.reportedDate.getTime()) / (1000 * 60 * 60);
      return hoursToResponse <= 24;
    }).length,
    respondedWithin5days: issues.filter(i => {
      const firstUpdate = i.updates[0];
      if (!firstUpdate) return false;
      const daysToResponse = differenceInBusinessDays(firstUpdate.date, i.reportedDate);
      return daysToResponse <= 5;
    }).length,
    breached: issues.filter(i => {
      const firstUpdate = i.updates[0];
      if (!firstUpdate) return true;
      const daysToResponse = differenceInBusinessDays(firstUpdate.date, i.reportedDate);
      return daysToResponse > 5;
    }).length,
  };
  
  const complianceRate = stats.total > 0 
    ? ((stats.respondedWithin5days / stats.total) * 100).toFixed(1)
    : '100.0';
  
  // Send weekly report email
  await sendEmail({
    to: ['compliance@vayva.ng', 'engineering-lead@vayva.ng'],
    subject: `📊 Weekly Accessibility SLA Report - ${sevenDaysAgo.toLocaleDateString()}`,
    template: 'accessibility-weekly-report',
    data: {
      period: sevenDaysAgo.toLocaleDateString(),
      stats,
      complianceRate,
      issues: issues.map(i => ({
        number: i.issueNumber,
        title: i.title,
        severity: i.severity,
        status: i.status,
        updatesCount: i.updates.length,
      })),
    },
  });
}
