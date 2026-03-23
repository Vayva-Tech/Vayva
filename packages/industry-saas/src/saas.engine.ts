// @ts-nocheck
/**
 * SaaS Industry Engine
 */

import { IndustryEngine, Feature } from '@vayva/industry-core';
import type { SaaSConfig } from './types';
import { SaaSSubscriptionService } from './services/saas-subscription.service';
import { SaaSSubscriptionFeature } from './features/saas-subscription.feature';

export class SaaSEngine extends IndustryEngine<SaaSConfig> {
  private subscriptionService?: SaaSSubscriptionService;
  private subscriptionFeature?: SaaSSubscriptionFeature;

  async initialize(): Promise<void> {
    console.log('[SAAS] Initializing engine...');
    
    if (this.config.subscription !== false) {
      this.subscriptionService = new SaaSSubscriptionService(this.config.subscription);
      await this.subscriptionService.initialize();
      this.subscriptionFeature = new SaaSSubscriptionFeature(this.subscriptionService);
      this.features.set('subscription', this.subscriptionFeature as unknown as Feature);
    }
    
    console.log('[SAAS] Engine initialized');
  }

  get subscription(): SaaSSubscriptionFeature | undefined {
    return this.subscriptionFeature;
  }
}
