/**
 * Nonprofit Industry Features
 */

export class DonorManagementFeature {
  constructor(donorService) {
    this.donorService = donorService;
  }
  
  async initialize() {
    await this.donorService.initialize();
  }
  
  async addDonor(donorData) {
    return this.donorService.addDonor(donorData);
  }
  
  async getDonors(filters) {
    return this.donorService.getDonors(filters);
  }
  
  async recordDonation(donationData) {
    return this.donorService.recordDonation(donationData);
  }
  
  getDonationStats() {
    return this.donorService.getDonationStats();
  }
}

export class CampaignManagerFeature {
  constructor(campaignService) {
    this.campaignService = campaignService;
  }
  
  async initialize() {
    await this.campaignService.initialize();
  }
  
  async createCampaign(campaignData) {
    return this.campaignService.createCampaign(campaignData);
  }
  
  async getCampaigns(filters) {
    return this.campaignService.getCampaigns(filters);
  }
  
  getCampaignStats() {
    return this.campaignService.getCampaignStats();
  }
}

export class GrantTrackerFeature {
  constructor(grantService) {
    this.grantService = grantService;
  }
  
  async initialize() {
    await this.grantService.initialize();
  }
  
  async addGrant(grantData) {
    return this.grantService.addGrant(grantData);
  }
  
  async getGrants(filters) {
    return this.grantService.getGrants(filters);
  }
  
  async submitReport(reportData) {
    return this.grantService.submitReport(reportData);
  }
  
  getGrantStats() {
    return this.grantService.getGrantStats();
  }
}