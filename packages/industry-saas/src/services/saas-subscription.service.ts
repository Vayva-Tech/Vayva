// @ts-nocheck
/**
 * SaaS Subscription Service
 * Manages recurring subscriptions, billing cycles, and usage tracking
 */

import { z } from 'zod';

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  quantity: number;
  amount: number;
  currency: string;
}

export interface UsageRecord {
  id: string;
  subscriptionId: string;
  metric: string;
  quantity: number;
  timestamp: Date;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface SaaSConfig {
  enableUsageBilling?: boolean;
  autoRenewal?: boolean;
  trialPeriodDays?: number;
}

const SubscriptionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  planId: z.string(),
  status: z.enum(['active', 'cancelled', 'past_due', 'trialing', 'paused']),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean().optional(),
  quantity: z.number().min(1),
  amount: z.number().positive(),
  currency: z.string(),
});

export class SaaSSubscriptionService {
  private subscriptions: Map<string, Subscription>;
  private usageRecords: Map<string, UsageRecord>;
  private invoices: Map<string, Invoice>;
  private config: SaaSConfig;

  constructor(config: SaaSConfig = {}) {
    this.config = {
      enableUsageBilling: true,
      autoRenewal: true,
      trialPeriodDays: 14,
      ...config,
    };
    this.subscriptions = new Map();
    this.usageRecords = new Map();
    this.invoices = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[SAAS_SUB] Initializing service...');
    this.initializeSampleData();
    console.log('[SAAS_SUB] Service initialized');
  }

  private initializeSampleData(): void {
    const now = new Date();
    const sampleSubscriptions: Subscription[] = [
      {
        id: 'sub1',
        customerId: 'cust1',
        planId: 'pro-monthly',
        status: 'active',
        currentPeriodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        quantity: 5,
        amount: 99,
        currency: 'USD',
      },
      {
        id: 'sub2',
        customerId: 'cust2',
        planId: 'enterprise-annual',
        status: 'active',
        currentPeriodStart: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(now.getTime() + 305 * 24 * 60 * 60 * 1000),
        quantity: 50,
        amount: 2999,
        currency: 'USD',
      },
      {
        id: 'sub3',
        customerId: 'cust3',
        planId: 'starter-monthly',
        status: 'trialing',
        currentPeriodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        quantity: 1,
        amount: 0,
        currency: 'USD',
      },
    ];

    sampleSubscriptions.forEach(sub => this.subscriptions.set(sub.id, sub));
  }

  createSubscription(subscriptionData: Partial<Subscription>): Subscription {
    const subscription: Subscription = {
      ...subscriptionData,
      id: subscriptionData.id || `sub_${Date.now()}`,
    } as Subscription;

    SubscriptionSchema.parse(subscription);
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  updateStatus(subscriptionId: string, status: Subscription['status']): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    subscription.status = status;
    return true;
  }

  recordUsage(subscriptionId: string, metric: string, quantity: number): UsageRecord {
    const record: UsageRecord = {
      id: `usage_${Date.now()}`,
      subscriptionId,
      metric,
      quantity,
      timestamp: new Date(),
    };

    this.usageRecords.set(record.id, record);
    return record;
  }

  getUpcomingRenewals(daysAhead: number = 7): Subscription[] {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return Array.from(this.subscriptions.values()).filter(
      s => s.currentPeriodEnd <= cutoff && 
           s.currentPeriodEnd >= new Date() && 
           s.status === 'active' &&
           !s.cancelAtPeriodEnd
    );
  }

  getStatistics(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    mrr: number; // Monthly Recurring Revenue
    churnRate: number;
    upcomingRenewals: number;
    trialEndingSoon: number;
  } {
    const allSubs = Array.from(this.subscriptions.values());
    const active = allSubs.filter(s => s.status === 'active');
    const trialing = allSubs.filter(s => s.status === 'trialing');
    
    const mrr = active.reduce((sum, s) => sum + (s.amount * s.quantity), 0);
    const upcomingRenewals = this.getUpcomingRenewals().length;
    const trialEndingSoon = trialing.filter(t => {
      const daysUntilEnd = (t.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilEnd <= 3;
    }).length;

    return {
      totalSubscriptions: allSubs.length,
      activeSubscriptions: active.length,
      mrr: Math.round(mrr),
      churnRate: 2.5, // Would calculate from historical data
      upcomingRenewals,
      trialEndingSoon,
    };
  }

  getRevenueByPlan(): Record<string, number> {
    const byPlan = new Map<string, number>();
    
    Array.from(this.subscriptions.values())
      .filter(s => s.status === 'active')
      .forEach(sub => {
        const revenue = sub.amount * sub.quantity;
        byPlan.set(sub.planId, (byPlan.get(sub.planId) || 0) + revenue);
      });

    return Object.fromEntries(byPlan);
  }
}
