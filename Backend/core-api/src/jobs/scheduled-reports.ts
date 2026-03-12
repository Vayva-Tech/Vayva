import { PrismaClient } from '@prisma/client';
import { sendClientReport } from '../services/email-automation';

const prisma = new PrismaClient();

/**
 * Automated Report Scheduler
 * 
 * Runs daily and sends weekly/monthly reports to clients
 * Triggered by cron job or Vercel Scheduled Functions
 */

interface ScheduledReport {
  id: string;
  storeId: number;
  clientId: string;
  clientEmail: string;
  projectName: string;
  frequency: 'weekly' | 'monthly';
  lastSent?: Date;
  nextSend: Date;
}

/**
 * Main scheduler function - call this daily via cron
 */
export async function runScheduledReports() {
  console.log('Starting scheduled report job...');

  try {
    const now = new Date();

    // Get all reports scheduled for today
    const reportsToSend = await prisma.scheduledReport.findMany({
      where: {
        nextSend: {
          lte: now,
        },
      },
      include: {
        store: true,
        project: true,
      },
    });

    console.log(`Found ${reportsToSend.length} reports to send`);

    for (const report of reportsToSend) {
      await processReport(report);
    }

    console.log('Scheduled report job completed');
    return { success: true, count: reportsToSend.length };
  } catch (error) {
    console.error('Error in scheduled reports:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Process individual report
 */
async function processReport(report: ScheduledReport) {
  try {
    console.log(`Processing report for ${report.clientEmail}`);

    // Gather report data based on frequency
    const reportData = await gatherReportData(report);

    if (!reportData) {
      console.warn(`No data available for report ${report.id}`);
      return;
    }

    // Send the email
    const result = await sendClientReport(report.clientEmail, reportData);

    if (result.success) {
      // Update next send date
      const nextSendDate = calculateNextSendDate(report.frequency);
      
      await prisma.scheduledReport.update({
        where: { id: report.id },
        data: {
          lastSent: new Date(),
          nextSend: nextSendDate,
        },
      });

      console.log(`Report sent successfully to ${report.clientEmail}`);
    } else {
      console.error(`Failed to send report to ${report.clientEmail}:`, result.error);
    }
  } catch (error) {
    console.error(`Error processing report ${report.id}:`, error);
  }
}

/**
 * Gather metrics and data for report
 */
async function gatherReportData(report: ScheduledReport) {
  const endDate = new Date();
  const startDate = new Date();

  // Set date range based on frequency
  if (report.frequency === 'weekly') {
    startDate.setDate(startDate.getDate() - 7);
  } else {
    startDate.setMonth(startDate.getMonth() - 1);
  }

  // Fetch project metrics
  const [timeEntries, tasks, invoices, milestones] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        projectId: report.projectId || undefined,
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.task.findMany({
      where: {
        projectId: report.projectId || undefined,
        completedAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.invoice.findMany({
      where: {
        projectId: report.projectId || undefined,
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.milestone.findMany({
      where: {
        projectId: report.projectId || undefined,
        dueDate: { gte: endDate },
      },
      orderBy: { dueDate: 'asc' },
      take: 3,
    }),
  ]);

  // Calculate metrics
  const totalHours = timeEntries.reduce((sum, te) => sum + (te.duration / 60), 0);
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  
  // You would calculate expenses and profit margin here based on your data model
  const totalExpenses = 0; // Placeholder
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

  return {
    clientName: 'Valued Client', // Would fetch from client table
    projectName: report.projectName,
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    metrics: {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profitMargin: Math.round(profitMargin),
      hoursWorked: Math.round(totalHours),
      tasksCompleted: tasks.length,
    },
    highlights: [
      `Completed ${tasks.length} tasks this ${report.frequency === 'weekly' ? 'week' : 'month'}`,
      `Logged ${Math.round(totalHours)} hours of work`,
      totalRevenue > 0 ? `Generated $${totalRevenue.toLocaleString()} in value` : '',
    ].filter(Boolean),
    upcomingMilestones: milestones.map(m => ({
      name: m.name,
      dueDate: m.dueDate.toISOString(),
    })),
  };
}

/**
 * Calculate next send date based on frequency
 */
function calculateNextSendDate(frequency: 'weekly' | 'monthly'): Date {
  const nextDate = new Date();
  
  if (frequency === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
}

/**
 * Create a new scheduled report subscription
 */
export async function createScheduledReport(data: {
  storeId: number;
  clientId: string;
  clientEmail: string;
  projectName: string;
  frequency: 'weekly' | 'monthly';
}) {
  const nextSend = calculateNextSendDate(data.frequency);

  const report = await prisma.scheduledReport.create({
    data: {
      storeId: data.storeId,
      clientId: data.clientId,
      clientEmail: data.clientEmail,
      projectName: data.projectName,
      frequency: data.frequency,
      nextSend,
    },
  });

  console.log(`Created scheduled report: ${report.id}`);
  return report;
}

/**
 * Cancel a scheduled report
 */
export async function cancelScheduledReport(reportId: string) {
  await prisma.scheduledReport.delete({
    where: { id: reportId },
  });

  console.log(`Cancelled scheduled report: ${reportId}`);
}
