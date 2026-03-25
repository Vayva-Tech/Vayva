/**
 * SLA BREACH MONITORING & NOTIFICATION SYSTEM
 * 
 * Monitor compliance issue resolution times
 * Send automated breach notifications
 * WCAG 2.1 AA + GDPR accountability
 */

import { prisma } from '@vayva/db';
import { sendEmail } from '@vayva/emails';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SLABreach {
  issueId: string;
  issueTitle: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedDate: Date;
  targetDate: Date;
  daysOverdue: number;
  assignedTo: string;
  status: string;
}

export interface BreachNotification {
  recipient: string;
  type: 'warning' | 'breach' | 'critical';
  breaches: SLABreach[];
  totalOverdue: number;
}

// ============================================================================
// SLA TARGETS (in days)
// ============================================================================

const SLA_TARGETS = {
  critical: 7,    // Critical accessibility issues - 7 days
  high: 14,       // High severity - 14 days
  medium: 30,     // Medium severity - 30 days
  low: 90,        // Low priority - 90 days
};

// ============================================================================
// MAIN MONITORING FUNCTION
// ============================================================================

/**
 * Check for SLA breaches and send notifications
 * Run daily via cron job
 */
export async function checkSLABreaches() {
  console.log('[SLA Monitor] Checking for breaches...');
  
  const now = new Date();
  const warnings: SLABreach[] = [];
  const breaches: SLABreach[] = [];
  
  try {
    // Get all open accessibility issues
    const issues = await prisma.accessibilityIssue.findMany({
      where: {
        status: {
          in: ['reported', 'triaged', 'in-progress'],
        },
      },
      include: {
        updates: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });
    
    // Check each issue
    for (const issue of issues) {
      const slaTarget = SLA_TARGETS[issue.severity as keyof typeof SLA_TARGETS];
      const targetDate = new Date(issue.reportedDate);
      targetDate.setDate(targetDate.getDate() + slaTarget);
      
      const daysRemaining = Math.ceil(
        (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Update target date in database
      await prisma.accessibilityIssue.update({
        where: { id: issue.id },
        data: { targetDate },
      });
      
      // Check for warning (within 7 days of deadline)
      if (daysRemaining > 0 && daysRemaining <= 7) {
        warnings.push({
          issueId: issue.id,
          issueTitle: issue.title,
          severity: issue.severity as any,
          reportedDate: issue.reportedDate,
          targetDate,
          daysOverdue: 0,
          assignedTo: issue.assignedTo || 'Unassigned',
          status: issue.status,
        });
      }
      
      // Check for breach (past deadline)
      if (daysRemaining <= 0) {
        const daysOverdue = Math.abs(daysRemaining);
        breaches.push({
          issueId: issue.id,
          issueTitle: issue.title,
          severity: issue.severity as any,
          reportedDate: issue.reportedDate,
          targetDate,
          daysOverdue,
          assignedTo: issue.assignedTo || 'Unassigned',
          status: issue.status,
        });
      }
    }
    
    console.log(`[SLA Monitor] Found ${warnings.length} warnings, ${breaches.length} breaches`);
    
    // Send notifications
    if (warnings.length > 0) {
      await sendWarningNotifications(warnings);
    }
    
    if (breaches.length > 0) {
      await sendBreachNotifications(breaches);
    }
    
    return {
      warnings: warnings.length,
      breaches: breaches.length,
      totalChecked: issues.length,
    };
    
  } catch (error) {
    console.error('[SLA Monitor] Error:', error);
    throw error;
  }
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Send warning notifications (approaching deadline)
 */
async function sendWarningNotifications(warnings: SLABreach[]) {
  const groupedByAssignee = groupByAssignee(warnings);
  
  for (const [assignee, issues] of Object.entries(groupedByAssignee)) {
    const htmlContent = generateWarningEmail(issues, assignee);
    
    await sendEmail({
      to: assignee === 'Unassigned' ? 'compliance@vayva.ng' : assignee,
      cc: ['compliance@vayva.ng'],
      subject: `⚠️ SLA Warning: ${issues.length} Issue(s) Approaching Deadline`,
      html: htmlContent,
      tags: ['sla-warning', 'accessibility'],
    });
    
    console.log(`[SLA Monitor] Sent warning to ${assignee} for ${issues.length} issues`);
  }
}

/**
 * Send breach notifications (past deadline)
 */
async function sendBreachNotifications(breaches: SLABreach[]) {
  const groupedByAssignee = groupByAssignee(breaches);
  
  // Notify assignees
  for (const [assignee, issues] of Object.entries(groupedByAssignee)) {
    const isCritical = issues.some(i => i.severity === 'critical');
    const htmlContent = generateBreachEmail(issues, assignee, isCritical);
    
    await sendEmail({
      to: assignee === 'Unassigned' ? 'compliance@vayva.ng' : assignee,
      cc: ['compliance@vayva.ng', 'cto@vayva.ng'],
      subject: `🚨 SLA BREACH: ${issues.length} Issue(s) Overdue - ${isCritical ? 'CRITICAL' : 'Action Required'}`,
      html: htmlContent,
      tags: ['sla-breach', 'accessibility'],
    });
    
    console.log(`[SLA Monitor] Sent breach notification to ${assignee} for ${issues.length} issues`);
  }
  
  // Send weekly summary to leadership
  if (breaches.length >= 3) {
    await sendLeadershipSummary(breaches);
  }
}

/**
 * Send summary to leadership team
 */
async function sendLeadershipSummary(breaches: SLABreach[]) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <h2 style="color: #dc2626;">🚨 Weekly SLA Breach Summary</h2>
  
  <p>Total Breaches This Week: <strong>${breaches.length}</strong></p>
  
  <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
    <thead>
      <tr style="background: #f3f4f6;">
        <th style="padding: 12px; border: 1px solid #e5e7eb;">Issue</th>
        <th style="padding: 12px; border: 1px solid #e5e7eb;">Severity</th>
        <th style="padding: 12px; border: 1px solid #e5e7eb;">Days Overdue</th>
        <th style="padding: 12px; border: 1px solid #e5e7eb;">Assigned To</th>
      </tr>
    </thead>
    <tbody>
      ${breaches.map(b => `
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${b.issueTitle}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">
            <span style="padding: 4px 8px; border-radius: 4px; background: ${getSeverityColor(b.severity)}; color: white;">
              ${b.severity.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #dc2626; font-weight: 600;">
            ${b.daysOverdue} days
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${b.assignedTo}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <p style="margin-top: 20px;">
    <strong>Action Required:</strong> Please review these breaches with your teams and ensure adequate resources are allocated to address accessibility compliance.
  </p>
  
  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
    This is an automated report from the Vayva SLA Monitoring System.<br/>
    For questions, contact: compliance@vayva.ng
  </p>
</body>
</html>
  `;
  
  await sendEmail({
    to: ['cto@vayva.ng', 'compliance@vayva.ng'],
    subject: `📊 Weekly SLA Breach Summary: ${breaches.length} Issues Overdue`,
    html: htmlContent,
    tags: ['sla-summary', 'leadership'],
  });
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

function generateWarningEmail(issues: SLABreach[], assignee: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <h2 style="color: #f59e0b;">⚠️ SLA Deadline Warning</h2>
  
  <p>Hi ${assignee === 'Unassigned' ? 'Team' : assignee},</p>
  
  <p>The following accessibility issue(s) are approaching their SLA deadline:</p>
  
  <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
    <thead>
      <tr style="background: #fef3c7;">
        <th style="padding: 12px; border: 1px solid #fcd34d;">Issue</th>
        <th style="padding: 12px; border: 1px solid #fcd34d;">Severity</th>
        <th style="padding: 12px; border: 1px solid #fcd34d;">Due Date</th>
        <th style="padding: 12px; border: 1px solid #fcd34d;">Days Remaining</th>
      </tr>
    </thead>
    <tbody>
      ${issues.map(i => {
        const daysRemaining = Math.ceil(
          (i.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return `
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">
              <a href="https://ops.vayva.ng/support/accessibility" style="color: #2563eb; text-decoration: none;">
                ${i.issueTitle}
              </a>
            </td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">
              <span style="padding: 4px 8px; border-radius: 4px; background: ${getSeverityColor(i.severity)}; color: white;">
                ${i.severity.toUpperCase()}
              </span>
            </td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${i.targetDate.toLocaleDateString()}</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #f59e0b;">
              ${daysRemaining} days
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  
  <p style="margin-top: 20px;">
    <strong>Action Required:</strong> Please prioritize these issues to avoid SLA breach.
  </p>
  
  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
    This is an automated notification from the Vayva SLA Monitoring System.<br/>
    For questions, contact: compliance@vayva.ng
  </p>
</body>
</html>
  `;
}

function generateBreachEmail(issues: SLABreach[], assignee: string, isCritical: boolean) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <h2 style="color: #dc2626;">🚨 SLA BREACH NOTIFICATION</h2>
  
  <p>Hi ${assignee === 'Unassigned' ? 'Team' : assignee},</p>
  
  <p style="color: #dc2626; font-weight: 600;">
    The following accessibility issue(s) have exceeded their SLA targets:
  </p>
  
  <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
    <thead>
      <tr style="background: #fee2e2;">
        <th style="padding: 12px; border: 1px solid #fca5a5;">Issue</th>
        <th style="padding: 12px; border: 1px solid #fca5a5;">Severity</th>
        <th style="padding: 12px; border: 1px solid #fca5a5;">Due Date</th>
        <th style="padding: 12px; border: 1px solid #fca5a5;">Days Overdue</th>
      </tr>
    </thead>
    <tbody>
      ${issues.map(i => `
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">
            <a href="https://ops.vayva.ng/support/accessibility" style="color: #2563eb; text-decoration: none;">
              ${i.issueTitle}
            </a>
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">
            <span style="padding: 4px 8px; border-radius: 4px; background: ${getSeverityColor(i.severity)}; color: white;">
              ${i.severity.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${i.targetDate.toLocaleDateString()}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #dc2626;">
            ${i.daysOverdue} days
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  ${isCritical ? `
    <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
      <strong>⚠️ CRITICAL:</strong> One or more breaches involves critical-severity accessibility issues. 
      Immediate action is required to ensure WCAG 2.1 AA compliance and prevent potential legal exposure.
    </div>
  ` : ''}
  
  <p style="margin-top: 20px;">
    <strong>Immediate Actions Required:</strong>
  </p>
  <ul style="line-height: 1.8;">
    <li>Review and prioritize breached issues</li>
    <li>Allocate necessary resources for resolution</li>
    <li>Update issue status in Ops Console</li>
    <li>Provide estimated resolution timeline</li>
  </ul>
  
  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
    This is an automated notification from the Vayva SLA Monitoring System.<br/>
    For questions, contact: compliance@vayva.ng
  </p>
</body>
</html>
  `;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function groupByAssignee(issues: SLABreach[]): Record<string, SLABreach[]> {
  return issues.reduce((acc, issue) => {
    const key = issue.assignedTo || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {} as Record<string, SLABreach[]>);
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#f59e0b',
    low: '#10b981',
  };
  return colors[severity] || '#6b7280';
}

/**
 * Get SLA statistics for dashboard
 */
export async function getSLAStats() {
  const now = new Date();
  
  const totalIssues = await prisma.accessibilityIssue.count({
    where: { status: { in: ['reported', 'triaged', 'in-progress'] } },
  });
  
  const breachedIssues = await prisma.accessibilityIssue.count({
    where: {
      status: { in: ['reported', 'triaged', 'in-progress'] },
      targetDate: { lt: now },
    },
  });
  
  const upcomingDeadlines = await prisma.accessibilityIssue.count({
    where: {
      status: { in: ['reported', 'triaged', 'in-progress'] },
      targetDate: {
        gt: now,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });
  
  const complianceRate = totalIssues > 0
    ? ((totalIssues - breachedIssues) / totalIssues) * 100
    : 100;
  
  return {
    totalIssues,
    breachedIssues,
    upcomingDeadlines,
    complianceRate: complianceRate.toFixed(1),
  };
}
