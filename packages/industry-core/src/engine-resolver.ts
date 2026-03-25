/**
 * Industry Engine Resolver
 * ========================
 * Universal resolver for loading and managing industry engines across all templates
 */

// TEMPORARY: Using string type instead of IndustrySlug due to import issues
// import type { IndustrySlug } from '@vayva/shared';
type IndustrySlug = string;

// TEMPORARY: Commenting out problematic imports for Phase 6 cleanup
// These will be fixed in subsequent phases

// Dynamic import map for all industry engines
const industryEngineImports = {
  /*
  automotive: () => import('@vayva/industry-automotive/engine'),
  grocery: () => import('@vayva/industry-grocery/engine'),
  events: () => import('@vayva/industry-events/engine'),
  wholesale: () => import('@vayva/industry-wholesale/engine'),
  nightlife: () => import('@vayva/industry-nightlife/engine'),
  nonprofit: () => import('@vayva/industry-nonprofit/engine'),
  petcare: () => import('@vayva/industry-petcare/engine'),
  realestate: () => import('@vayva/industry-realestate/engine'),
  travel: () => import('@vayva/industry-travel/engine'),
  saas: () => import('@vayva/industry-saas/engine'),
  specialized: () => import('@vayva/industry-specialized/engine'),
  services: () => import('@vayva/industry-services/engine'),
  'blog-media': () => import('@vayva/industry-blog-media/engine'),
  analytics: () => import('@vayva/industry-analytics/engine'),
  // Legacy/pre-existing industries
  fashion: () => import('@vayva/industry-fashion/engine'),
  food: () => import('@vayva/industry-food/engine'),
  healthcare: () => import('@vayva/industry-healthcare/engine'),
  education: () => import('@vayva/industry-education/engine'),
  retail: () => import('@vayva/industry-retail/engine'),
  restaurant: () => import('@vayva/industry-restaurant/engine'),
  wellness: () => import('@vayva/industry-wellness/engine'),
  legal: () => import('@vayva/industry-legal/engine'),
  creative: () => import('@vayva/industry-creative/engine'),
  professional: () => import('@vayva/industry-professional/engine'),
  */
} as const;

export type IndustryEngineMap = typeof industryEngineImports;
export type AvailableIndustry = keyof IndustryEngineMap;

/**
 * Industry Engine Instance
 */
export interface IndustryEngineInstance {
  industry: IndustrySlug;
  engine: any;
  features: Map<string, any>;
  initialized: boolean;
}

/**
 * Industry Engine Manager
 * Singleton for managing industry engine lifecycle across the application
 */
export class IndustryEngineManager {
  private static instance: IndustryEngineManager;
  private engineCache: Map<IndustrySlug, IndustryEngineInstance>;
  private initializationPromises: Map<IndustrySlug, Promise<void>>;

  private constructor() {
    this.engineCache = new Map();
    this.initializationPromises = new Map();
  }

  static getInstance(): IndustryEngineManager {
    if (!IndustryEngineManager.instance) {
      IndustryEngineManager.instance = new IndustryEngineManager();
    }
    return IndustryEngineManager.instance;
  }

  /**
   * Get or create an industry engine instance
   */
  async getEngine(industry: IndustrySlug): Promise<IndustryEngineInstance | null> {
    // Check cache first
    const cached = this.engineCache.get(industry);
    if (cached && cached.initialized) {
      return cached;
    }

    // Check if already initializing
    const existingPromise = this.initializationPromises.get(industry);
    if (existingPromise) {
      await existingPromise;
      return this.engineCache.get(industry) || null;
    }

    // Initialize new engine
    const promise = this.initializeEngine(industry);
    this.initializationPromises.set(industry, promise);

    try {
      await promise;
      return this.engineCache.get(industry) || null;
    } finally {
      this.initializationPromises.delete(industry);
    }
  }

  /**
   * Initialize a specific industry engine
   */
  private async initializeEngine(industry: IndustrySlug): Promise<void> {
    // TEMPORARY: Return early for Phase 6 cleanup
    console.warn(`[IndustryEngine] Skipping initialization for ${industry} during Phase 6 cleanup`);
    return;
    
    /*
    const importer = industryEngineImports[industry as AvailableIndustry];
    
    if (!importer) {
      console.warn(`[IndustryEngine] No engine found for industry: ${industry}`);
      return;
    }

    try {
      const module = await importer();
      const EngineClass = module[`${this.capitalizeFirst(industry)}Engine`];
      
      if (!EngineClass) {
        console.warn(`[IndustryEngine] Engine class not found for: ${industry}`);
        return;
      }

      const engine = new EngineClass({});
      await engine.initialize();

      const instance: IndustryEngineInstance = {
        industry,
        engine,
        features: engine.features || new Map(),
        initialized: true,
      };

      this.engineCache.set(industry, instance);
      console.warn(`[IndustryEngine] Initialized: ${industry}`);
    } catch (error) {
      console.error(`[IndustryEngine] Failed to initialize ${industry}:`, error);
      throw error;
    }
    */
  }

  /**
   * Get all available industries
   */
  getAvailableIndustries(): IndustrySlug[] {
    return Object.keys(industryEngineImports) as IndustrySlug[];
  }

  /**
   * Check if an industry engine is available
   */
  isIndustryAvailable(industry: string): boolean {
    return industry in industryEngineImports;
  }

  /**
   * Clear engine cache (useful for testing/hot reload)
   */
  async clearCache(): Promise<void> {
    for (const [industry, instance] of this.engineCache.entries()) {
      if (instance.engine?.dispose) {
        await instance.engine.dispose();
      }
    }
    this.engineCache.clear();
    this.initializationPromises.clear();
  }

  /**
   * Get engine statistics
   */
  getStats(): {
    totalCached: number;
    initialized: number;
    initializing: number;
  } {
    return {
      totalCached: this.engineCache.size,
      initialized: Array.from(this.engineCache.values()).filter(i => i.initialized).length,
      initializing: this.initializationPromises.size,
    };
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Hook for React components to use industry engines
 */
export function useIndustryEngine(industry: IndustrySlug) {
  const manager = IndustryEngineManager.getInstance();
  
  // In a real React hook, you'd use useState/useEffect here
  // This is a simplified version for the service layer
  return {
    getEngine: () => manager.getEngine(industry),
    isAvailable: manager.isIndustryAvailable(industry),
  };
}

/**
 * Utility function to resolve industry from tenant/store config
 */
export async function resolveIndustryEngine(tenantConfig: {
  industry?: string;
  templateId?: string;
}): Promise<IndustryEngineInstance | null> {
  const industry = tenantConfig.industry || 'retail'; // Default fallback
  
  const manager = IndustryEngineManager.getInstance();
  return await manager.getEngine(industry as IndustrySlug);
}

// Export singleton instance
export const industryEngineManager = IndustryEngineManager.getInstance();
