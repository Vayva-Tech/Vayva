/**
 * Nonprofit Industry Engine
 * Main orchestrator for nonprofit features
 */

export class NonprofitEngine {
  constructor(config = {}) {
    this.config = {
      donorManagement: true,
      campaignManager: true,
      grantTracker: true,
      ...config,
    };
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      servicesReady: false,
    };
  }

  async initialize() {
    try {
      // Initialize services
      if (this.config.donorManagement) {
        this.donorService = { name: 'DonorManagementService' };
        this.status.activeFeatures.push('donor-management');
      }
      
      if (this.config.campaignManager) {
        this.campaignService = { name: 'CampaignManagerService' };
        this.status.activeFeatures.push('campaign-manager');
      }
      
      if (this.config.grantTracker) {
        this.grantService = { name: 'GrantTrackerService' };
        this.status.activeFeatures.push('grant-tracker');
      }
      
      this.status.servicesReady = true;
      this.status.initialized = true;
      
      console.warn(`[NONPROFIT_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[NONPROFIT_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  getStatus() {
    return { ...this.status };
  }

  getActiveFeatures() {
    return [...this.status.activeFeatures];
  }

  isFeatureAvailable(featureId) {
    return this.status.activeFeatures.includes(featureId);
  }

  getService(serviceName) {
    switch (serviceName) {
      case 'donor':
        return this.donorService;
      case 'campaign':
        return this.campaignService;
      case 'grant':
        return this.grantService;
      default:
        return null;
    }
  }

  async dispose() {
    // Cleanup if needed
  }
}

export class NonprofitEngineFactory {
  static create(config) {
    return new NonprofitEngine(config);
  }

  static createDefault() {
    return new NonprofitEngine({
      donorManagement: true,
      campaignManager: true,
      grantTracker: true,
    });
  }
}

export function createDefaultNonprofitConfig() {
  return {
    donorManagement: true,
    campaignManager: true,
    grantTracker: true,
  };
}