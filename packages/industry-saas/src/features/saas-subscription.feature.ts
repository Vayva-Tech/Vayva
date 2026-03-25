/**
 * SaaS Subscription Feature
 */

import { SaaSSubscriptionService, Subscription, UsageRecord, Invoice, SaaSConfig } from '../services/saas-subscription.service';

export class SaaSSubscriptionFeature {
  constructor(private service: SaaSSubscriptionService) {}

  async createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    return this.service.createSubscription(subscriptionData);
  }

  async updateStatus(subscriptionId: string, status: Subscription['status']): Promise<boolean> {
    return this.service.updateStatus(subscriptionId, status);
  }

  async recordUsage(subscriptionId: string, metric: string, quantity: number): Promise<UsageRecord> {
    return this.service.recordUsage(subscriptionId, metric, quantity);
  }

  async getUpcomingRenewals(daysAhead?: number): Promise<Subscription[]> {
    return this.service.getUpcomingRenewals(daysAhead);
  }

  async getStatistics() {
    return this.service.getStatistics();
  }

  async getRevenueByPlan() {
    return this.service.getRevenueByPlan();
  }
}
