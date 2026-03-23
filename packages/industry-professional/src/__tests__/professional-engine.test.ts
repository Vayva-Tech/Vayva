// @ts-nocheck
/**
 * Professional Engine Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ProfessionalEngine, 
  ProfessionalEngineFactory,
  createDefaultProfessionalConfig,
  type ProfessionalEngineConfig 
} from '../professional.engine.js';

describe('ProfessionalEngine', () => {
  let engine: ProfessionalEngine;

  beforeEach(() => {
    engine = new ProfessionalEngine();
  });

  describe('constructor', () => {
    it('should create engine with default config', () => {
      expect(engine).toBeDefined();
      const status = engine.getStatus();
      expect(status.initialized).toBe(false);
    });

    it('should accept custom config', () => {
      const customConfig: ProfessionalEngineConfig = {
        matterManagement: true,
        timeBilling: false,
        documentManagement: true,
      };
      const customEngine = new ProfessionalEngine(customConfig);
      expect(customEngine).toBeDefined();
    });
  });

  describe('initialize', () => {
    it('should initialize all services by default', async () => {
      await engine.initialize('tenant-123');
      
      const status = engine.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.servicesReady).toBe(true);
      expect(status.activeFeatures.length).toBeGreaterThan(0);
    });

    it('should activate matter management feature', async () => {
      await engine.initialize('tenant-123');
      
      const activeFeatures = engine.getActiveFeatures();
      expect(activeFeatures).toContain('matter-management');
    });

    it('should activate client relationship feature', async () => {
      await engine.initialize('tenant-123');
      
      const activeFeatures = engine.getActiveFeatures();
      expect(activeFeatures).toContain('client-relationship');
    });

    it('should activate billing feature when enabled', async () => {
      const config = createDefaultProfessionalConfig();
      config.timeBilling = true;
      const engineWithBilling = new ProfessionalEngine(config);
      
      await engineWithBilling.initialize('tenant-123');
      
      const activeFeatures = engineWithBilling.getActiveFeatures();
      expect(activeFeatures).toContain('time-billing');
    });
  });

  describe('getService', () => {
    beforeEach(async () => {
      await engine.initialize('tenant-123');
    });

    it('should return matter service', () => {
      const matterService = engine.getService('matter');
      expect(matterService).toBeDefined();
    });

    it('should return client service', () => {
      const clientService = engine.getService('client');
      expect(clientService).toBeDefined();
    });

    it('should return billing service', () => {
      const billingService = engine.getService('billing');
      expect(billingService).toBeDefined();
    });

    it('should return undefined for non-existent service', () => {
      const unknownService = engine.getService('unknown');
      expect(unknownService).toBeUndefined();
    });
  });

  describe('getFeature', () => {
    beforeEach(async () => {
      await engine.initialize('tenant-123');
    });

    it('should return matter management feature', () => {
      const feature = engine.getFeature('matter-management');
      expect(feature).toBeDefined();
    });

    it('should return client relationship feature', () => {
      const feature = engine.getFeature('client-relationship');
      expect(feature).toBeDefined();
    });

    it('should return undefined for unknown feature', () => {
      const feature = engine.getFeature('unknown-feature');
      expect(feature).toBeUndefined();
    });
  });

  describe('isFeatureEnabled', () => {
    it('should have matter management enabled by default', () => {
      expect(engine.isFeatureEnabled('matter-management')).toBe(true);
    });

    it('should have time billing enabled by default', () => {
      expect(engine.isFeatureEnabled('time-billing')).toBe(true);
    });

    it('should respect config disabling', () => {
      const disabledEngine = new ProfessionalEngine({
        matterManagement: false,
      });
      expect(disabledEngine.isFeatureEnabled('matter-management')).toBe(false);
    });
  });

  describe('isFeatureAvailable', () => {
    it('should not have features available before initialization', () => {
      const status = engine.isFeatureAvailable('matter-management');
      expect(status).toBe(false);
    });

    it('should have features available after initialization', async () => {
      await engine.initialize('tenant-123');
      
      const available = engine.isFeatureAvailable('matter-management');
      expect(available).toBe(true);
    });
  });

  describe('getDashboardEngine', () => {
    it('should return dashboard engine instance', () => {
      const dashboardEngine = engine.getDashboardEngine();
      expect(dashboardEngine).toBeDefined();
    });
  });

  describe('dispose', () => {
    it('should clear all services', async () => {
      await engine.initialize('tenant-123');
      await engine.dispose();
      
      const status = engine.getStatus();
      expect(status.servicesReady).toBe(false);
    });
  });
});

describe('ProfessionalEngineFactory', () => {
  it('should create engine with default config', () => {
    const engine = ProfessionalEngineFactory.create();
    expect(engine).toBeDefined();
  });

  it('should create engine with custom config', () => {
    const customConfig: ProfessionalEngineConfig = {
      matterManagement: true,
      trustAccounting: false,
    };
    const engine = ProfessionalEngineFactory.create(customConfig);
    expect(engine).toBeDefined();
  });

  it('should create default engine', () => {
    const engine = ProfessionalEngineFactory.createDefault();
    expect(engine).toBeDefined();
    
    const status = engine.getStatus();
    expect(status.initialized).toBe(false);
  });
});

describe('createDefaultProfessionalConfig', () => {
  it('should return config with all features enabled', () => {
    const config = createDefaultProfessionalConfig();
    
    expect(config.matterManagement).toBe(true);
    expect(config.timeBilling).toBe(true);
    expect(config.documentManagement).toBe(true);
    expect(config.calendarIntegration).toBe(true);
    expect(config.trustAccounting).toBe(true);
    expect(config.conflictChecking).toBe(true);
  });
});
