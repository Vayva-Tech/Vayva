/**
 * Industry Engine Resolver
 * Universal resolver for loading and managing industry engines
 */

// Dynamic import map for industry engines
const industryEngineImports = {
  // Core industries
  retail: () => import('./engines/retail.js'),
  fashion: () => import('./engines/fashion.js'),
  restaurant: () => import('./engines/restaurant.js'),
  healthcare: () => import('./engines/healthcare.js'),
  beauty: () => import('./engines/beauty.js'),
  electronics: () => import('./engines/electronics.js'),
  automotive: () => import('./engines/automotive.js'),
  realestate: () => import('./engines/realestate.js'),
  travel: () => import('./engines/travel.js'),
  events: () => import('./engines/events.js'),
  nightlife: () => import('./engines/nightlife.js'),
  grocery: () => import('./engines/grocery.js'),
  b2b: () => import('./engines/b2b.js'),
  education: () => import('./engines/education.js'),
  nonprofit: () => import('./engines/nonprofit.js'),
  blog_media: () => import('./engines/blog-media.js'),
  creative_portfolio: () => import('./engines/creative-portfolio.js'),
  saas: () => import('./engines/saas.js'),
  legal: () => import('./engines/legal.js'),
  professional_services: () => import('./engines/professional-services.js'),
  wellness: () => import('./engines/wellness.js'),
  kitchen: () => import('./engines/kitchen.js'),
  wholesale: () => import('./engines/wholesale.js')
};

// Cache for loaded engines
const engineCache = new Map();

// Default fallback engine
class DefaultEngine {
  constructor() {
    this.name = 'default';
    this.features = ['basic-dashboard'];
  }
  
  async initialize() {
    console.log('[ENGINE_RESOLVER] Default engine initialized');
  }
  
  getDashboardConfig() {
    return {
      widgets: [
        { id: 'revenue', type: 'kpi-card', title: 'Revenue' },
        { id: 'orders', type: 'kpi-card', title: 'Orders' },
        { id: 'customers', type: 'kpi-card', title: 'Customers' }
      ]
    };
  }
}

export class IndustryEngineResolver {
  static async loadEngine(industrySlug) {
    // Check cache first
    if (engineCache.has(industrySlug)) {
      return engineCache.get(industrySlug);
    }
    
    try {
      // Try to load specific industry engine
      const importFn = industryEngineImports[industrySlug];
      if (importFn) {
        const module = await importFn();
        const engine = module.default || module.Engine || new DefaultEngine();
        engineCache.set(industrySlug, engine);
        return engine;
      }
      
      // Fallback to default engine
      console.warn(`[ENGINE_RESOLVER] No engine found for industry: ${industrySlug}, using default`);
      const defaultEngine = new DefaultEngine();
      engineCache.set(industrySlug, defaultEngine);
      return defaultEngine;
      
    } catch (error) {
      console.error(`[ENGINE_RESOLVER] Failed to load engine for ${industrySlug}:`, error);
      const defaultEngine = new DefaultEngine();
      engineCache.set(industrySlug, defaultEngine);
      return defaultEngine;
    }
  }
  
  static getSupportedIndustries() {
    return Object.keys(industryEngineImports);
  }
  
  static isIndustrySupported(industrySlug) {
    return industrySlug in industryEngineImports;
  }
  
  static clearCache() {
    engineCache.clear();
  }
  
  static preloadEngines(industries = []) {
    const promises = industries.map(industry => 
      this.loadEngine(industry).catch(() => null)
    );
    return Promise.all(promises);
  }
}

// Export utility functions
export function getIndustryEngine(industrySlug) {
  return IndustryEngineResolver.loadEngine(industrySlug);
}

export function preloadIndustryEngines(industries) {
  return IndustryEngineResolver.preloadEngines(industries);
}

export const SUPPORTED_INDUSTRIES = IndustryEngineResolver.getSupportedIndustries();