// @ts-nocheck
/**
 * Campaign Manager Feature
 */

import { CampaignManagerService } from '../services/campaign-manager.service.js';

export class CampaignManagerFeature {
  constructor(private service: CampaignManagerService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  createCampaign(data: any) {
    return this.service.createCampaign(data);
  }

  updateProgress(campaignId: string, amount: number) {
    return this.service.updateProgress(campaignId, amount);
  }

  getCampaignStats(campaignId: string) {
    return this.service.getCampaignStats(campaignId);
  }
}
