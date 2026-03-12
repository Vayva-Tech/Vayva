/**
 * Compliance Report Generator
 * Automated compliance reporting system
 */

import type { ComplianceFramework, ComplianceStatus } from '../engine';
import { auditLogger } from '../audit/audit-logger';

export interface ComplianceReport {
  id: string;
  storeId: string;
  reportType: ComplianceFramework | 'comprehensive';
  status: 'pending' | 'generated' | 'failed';
  generatedAt?: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    overallScore: number;
    criticalIssues: number;
    warnings: number;
    passedChecks: number;
    totalChecks: number;
  };
  findings: Array<{
    framework: ComplianceFramework;
    requirement: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'pass' | 'fail' | 'partial';
    description: string;
    remediation?: string;
  }>;
  recommendations: string[];
  downloadUrl?: string;
}

export interface ReportSchedule {
  id: string;
  storeId: string;
  reportType: ComplianceFramework | 'comprehensive';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  recipients: string[];
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt: Date;
}

export class ReportGenerator {
  private reports: Map<string, ComplianceReport> = new Map();
  private schedules: Map<string, ReportSchedule> = new Map();

  /**
   * Generate compliance report
   */
  async generateReport(
    storeId: string,
    reportType: ComplianceFramework | 'comprehensive',
    period: { start: Date; end: Date },
    complianceStatus: ComplianceStatus
  ): Promise<ComplianceReport> {
    const reportId = `report_${Date.now()}`;

    const report: ComplianceReport = {
      id: reportId,
      storeId,
      reportType,
      status: 'generated',
      generatedAt: new Date(),
      period,
      summary: {
        overallScore: complianceStatus.overallScore,
        criticalIssues: complianceStatus.criticalIssues,
        warnings: complianceStatus.warnings,
        passedChecks: 0,
        totalChecks: 0,
      },
      findings: [],
      recommendations: [],
    };

    // Process findings from compliance status
    for (const [framework, data] of Object.entries(complianceStatus.frameworks)) {
      for (const check of data.checks) {
        report.summary.totalChecks++;
        if (check.passed) {
          report.summary.passedChecks++;
        }

        if (!check.passed) {
          report.findings.push({
            framework: framework as ComplianceFramework,
            requirement: check.requirementId,
            severity: this.getSeverity(check.requirementId),
            status: 'fail',
            description: check.message,
            remediation: check.remediation,
          });
        }
      }
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report.findings);

    this.reports.set(reportId, report);

    // Log report generation
    await auditLogger.logAction({
      storeId,
      action: 'REPORT_GENERATED',
      entityType: 'COMPLIANCE_REPORT',
      entityId: reportId,
    });

    return report;
  }

  /**
   * Get report by ID
   */
  async getReport(reportId: string): Promise<ComplianceReport | undefined> {
    return this.reports.get(reportId);
  }

  /**
   * List reports for a store
   */
  async listReports(storeId: string): Promise<ComplianceReport[]> {
    return Array.from(this.reports.values())
      .filter(r => r.storeId === storeId)
      .sort((a, b) => (b.generatedAt?.getTime() || 0) - (a.generatedAt?.getTime() || 0));
  }

  /**
   * Schedule automated report
   */
  async scheduleReport(schedule: Omit<ReportSchedule, 'id' | 'nextRunAt'>): Promise<ReportSchedule> {
    const id = `schedule_${Date.now()}`;
    
    const newSchedule: ReportSchedule = {
      ...schedule,
      id,
      nextRunAt: this.calculateNextRun(schedule),
    };

    this.schedules.set(id, newSchedule);

    return newSchedule;
  }

  /**
   * Cancel scheduled report
   */
  async cancelSchedule(scheduleId: string): Promise<boolean> {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      schedule.isActive = false;
      return true;
    }
    return false;
  }

  /**
   * Get schedules for a store
   */
  async getSchedules(storeId: string): Promise<ReportSchedule[]> {
    return Array.from(this.schedules.values())
      .filter(s => s.storeId === storeId);
  }

  /**
   * Run scheduled reports
   */
  async runScheduledReports(): Promise<ComplianceReport[]> {
    const now = new Date();
    const reports: ComplianceReport[] = [];

    for (const schedule of this.schedules.values()) {
      if (!schedule.isActive || schedule.nextRunAt > now) {
        continue;
      }

      // In production, fetch actual compliance status
      // Mock status for now
      const mockStatus = {
        storeId: schedule.storeId,
        overallScore: 85,
        frameworks: {},
        criticalIssues: 0,
        warnings: 2,
      } as ComplianceStatus;

      const period = this.getPeriodForFrequency(schedule.frequency);

      const report = await this.generateReport(
        schedule.storeId,
        schedule.reportType,
        period,
        mockStatus
      );

      reports.push(report);

      // Update schedule
      schedule.lastRunAt = now;
      schedule.nextRunAt = this.calculateNextRun(schedule);
    }

    return reports;
  }

  /**
   * Export report to PDF
   */
  async exportToPDF(reportId: string): Promise<string> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // In production, generate actual PDF
    const downloadUrl = `/downloads/compliance/${reportId}.pdf`;
    report.downloadUrl = downloadUrl;

    return downloadUrl;
  }

  /**
   * Calculate next run date for schedule
   */
  private calculateNextRun(schedule: Omit<ReportSchedule, 'id' | 'nextRunAt'>): Date {
    const now = new Date();
    const next = new Date(now);

    switch (schedule.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 - next.getDay() + (schedule.dayOfWeek || 0)) % 7);
        next.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(schedule.dayOfMonth || 1);
        next.setHours(0, 0, 0, 0);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        next.setDate(1);
        next.setHours(0, 0, 0, 0);
        break;
    }

    return next;
  }

  /**
   * Get period for frequency
   */
  private getPeriodForFrequency(frequency: ReportSchedule['frequency']): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (frequency) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        break;
    }

    return { start, end };
  }

  /**
   * Get severity for requirement
   */
  private getSeverity(requirementId: string): 'critical' | 'high' | 'medium' | 'low' {
    if (requirementId.includes('critical') || requirementId.endsWith('-001') || requirementId.endsWith('-002')) {
      return 'critical';
    }
    if (requirementId.includes('high') || requirementId.endsWith('-003')) {
      return 'high';
    }
    if (requirementId.includes('medium')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(findings: ComplianceReport['findings']): string[] {
    const recommendations: string[] = [];

    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;

    if (criticalCount > 0) {
      recommendations.push(`Address ${criticalCount} critical compliance issues immediately to avoid regulatory penalties.`);
    }

    if (highCount > 0) {
      recommendations.push(`Prioritize ${highCount} high-severity findings in your next sprint.`);
    }

    if (findings.some(f => f.framework === 'ndpr' || f.framework === 'gdpr')) {
      recommendations.push('Review and update your privacy policy to ensure compliance with data protection regulations.');
    }

    if (findings.some(f => f.framework === 'pci_dss')) {
      recommendations.push('Conduct a security audit of your payment processing systems.');
    }

    if (findings.some(f => f.framework === 'hipaa')) {
      recommendations.push('Implement additional access controls for protected health information.');
    }

    recommendations.push('Schedule regular compliance reviews to maintain ongoing adherence.');

    return recommendations;
  }
}

export const reportGenerator = new ReportGenerator();
export default ReportGenerator;
