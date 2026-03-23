// @ts-nocheck
/**
 * Grant Tracker Service
 * Manages grant applications, deadlines, and reporting
 */

import { z } from 'zod';

export interface Grant {
  id: string;
  name: string;
  funder: string;
  amount: number;
  status: 'research' | 'draft' | 'submitted' | 'awarded' | 'rejected';
  deadline: Date;
  awardedDate?: Date;
  description?: string;
  requirements?: string[];
  reportDueDate?: Date;
}

export interface GrantReport {
  id: string;
  grantId: string;
  reportType: 'interim' | 'final' | 'financial';
  dueDate: Date;
  submittedDate?: Date;
  status: 'pending' | 'in-progress' | 'submitted' | 'overdue';
}

export interface GrantConfig {
  enableDeadlineReminders?: boolean;
  trackReporting?: boolean;
  enableFinancialTracking?: boolean;
}

const GrantSchema = z.object({
  id: z.string(),
  name: z.string(),
  funder: z.string(),
  amount: z.number().min(0),
  status: z.enum(['research', 'draft', 'submitted', 'awarded', 'rejected']),
  deadline: z.date(),
  awardedDate: z.date().optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  reportDueDate: z.date().optional(),
});

export class GrantTrackerService {
  private grants: Map<string, Grant>;
  private reports: Map<string, GrantReport>;
  private config: GrantConfig;

  constructor(config: GrantConfig = {}) {
    this.config = {
      enableDeadlineReminders: true,
      trackReporting: true,
      enableFinancialTracking: true,
      ...config,
    };
    this.grants = new Map();
    this.reports = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[GRANT_TRACKER] Initializing service...');
    
    // Initialize with sample grants
    this.initializeSampleGrants();
    
    console.log('[GRANT_TRACKER] Service initialized');
  }

  private initializeSampleGrants(): void {
    const now = new Date();
    const sampleGrants: Grant[] = [
      {
        id: 'g1',
        name: 'Community Development Grant',
        funder: 'XYZ Foundation',
        amount: 50000,
        status: 'submitted',
        deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        description: 'Supporting local youth programs',
      },
      {
        id: 'g2',
        name: 'Education Initiative',
        funder: 'ABC Trust',
        amount: 75000,
        status: 'draft',
        deadline: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        description: 'After-school tutoring program',
      },
      {
        id: 'g3',
        name: 'Health & Wellness Fund',
        funder: 'State Health Dept',
        amount: 100000,
        status: 'awarded',
        deadline: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        awardedDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
    ];

    sampleGrants.forEach(grant => this.grants.set(grant.id, grant));
  }

  createGrant(grantData: Partial<Grant>): Grant {
    const grant: Grant = {
      ...grantData,
      id: grantData.id || `grant_${Date.now()}`,
      status: grantData.status || 'research',
    } as Grant;

    GrantSchema.parse(grant);
    this.grants.set(grant.id, grant);
    return grant;
  }

  updateGrantStatus(grantId: string, status: Grant['status']): boolean {
    const grant = this.grants.get(grantId);
    if (!grant) return false;

    grant.status = status;
    if (status === 'awarded') {
      grant.awardedDate = new Date();
    }
    return true;
  }

  getUpcomingDeadlines(daysAhead: number = 30): Grant[] {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return Array.from(this.grants.values()).filter(
      g => g.status !== 'awarded' && 
           g.status !== 'rejected' && 
           g.deadline <= cutoff &&
           g.deadline >= new Date()
    );
  }

  getStatistics(): {
    totalGrants: number;
    totalAmount: number;
    awardedAmount: number;
    pendingAmount: number;
    successRate: number;
    upcomingDeadlines: number;
  } {
    const allGrants = Array.from(this.grants.values());
    const awarded = allGrants.filter(g => g.status === 'awarded');
    const rejected = allGrants.filter(g => g.status === 'rejected');
    const pending = allGrants.filter(g => ['research', 'draft', 'submitted'].includes(g.status));

    const totalApplied = awarded.length + rejected.length + pending.length;
    const successRate = totalApplied > 0 ? (awarded.length / totalApplied) * 100 : 0;

    return {
      totalGrants: allGrants.length,
      totalAmount: allGrants.reduce((sum, g) => sum + g.amount, 0),
      awardedAmount: awarded.reduce((sum, g) => sum + g.amount, 0),
      pendingAmount: pending.reduce((sum, g) => sum + g.amount, 0),
      successRate: Math.round(successRate * 100) / 100,
      upcomingDeadlines: this.getUpcomingDeadlines().length,
    };
  }

  getPipelineBreakdown(): Record<string, number> {
    const allGrants = Array.from(this.grants.values());
    return {
      research: allGrants.filter(g => g.status === 'research').length,
      draft: allGrants.filter(g => g.status === 'draft').length,
      submitted: allGrants.filter(g => g.status === 'submitted').length,
      awarded: allGrants.filter(g => g.status === 'awarded').length,
      rejected: allGrants.filter(g => g.status === 'rejected').length,
    };
  }
}
