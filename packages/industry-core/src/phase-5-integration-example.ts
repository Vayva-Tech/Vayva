/**
 * Phase 5 Integration Example
 * ============================
 * How to use Phase 5 industry engines in merchant admin and templates
 */

import { industryEngineManager, resolveIndustryEngine } from '@vayva/industry-core';

// ============================================================================
// EXAMPLE 1: Using Industry Engine in Merchant Admin Dashboard
// ============================================================================

export async function useInMerchantAdmin() {
  // Get the automotive industry engine
  const automotiveEngine = await industryEngineManager.getEngine('automotive');
  
  if (automotiveEngine) {
    // Access vehicle inventory service
    const inventoryFeature = automotiveEngine.engine.inventory;
    const vehicles = await inventoryFeature?.getAvailableVehicles();
    
    // Access service scheduling
    const serviceFeature = automotiveEngine.engine.serviceScheduler;
    const appointments = await serviceFeature?.getUpcomingAppointments();
    
    console.warn('Vehicles:', vehicles);
    console.warn('Appointments:', appointments);
  }
}

// ============================================================================
// EXAMPLE 2: Dynamic Industry Resolution Based on Tenant Config
// ============================================================================

export async function useInTenantContext(tenantConfig: {
  industry: string;
  tenantId: string;
}) {
  // Resolve the correct industry engine based on tenant settings
  const engineInstance = await resolveIndustryEngine({
    industry: tenantConfig.industry,
  });
  
  if (engineInstance) {
    // Engine is ready to use with all features
    const features = engineInstance.features;
    
    // Example: Nonprofit industry
    if (tenantConfig.industry === 'nonprofit') {
      const donorFeature = engineInstance.engine.donorManagement;
      const donors = await donorFeature?.getDonors();
      
      const campaignFeature = engineInstance.engine.campaignManager;
      const campaigns = await campaignFeature?.getCampaigns();
    }
    
    // Example: Nightlife industry
    if (tenantConfig.industry === 'nightlife') {
      const promoterFeature = engineInstance.engine.promoterManagement;
      const bottleServiceFeature = engineInstance.engine.bottleService;
      const analyticsFeature = engineInstance.engine.analytics;
    }
  }
}

// ============================================================================
// EXAMPLE 3: React Component Integration (Pseudocode)
// ============================================================================

/*
import React, { useEffect, useState } from 'react';
import { industryEngineManager } from '@vayva/industry-core';

function IndustryDashboard({ industrySlug }) {
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadEngine() {
      const instance = await industryEngineManager.getEngine(industrySlug);
      setEngine(instance);
      setLoading(false);
    }
    
    loadEngine();
  }, [industrySlug]);
  
  if (loading) return <div>Loading industry engine...</div>;
  if (!engine) return <div>Industry not supported</div>;
  
  // Render industry-specific dashboard
  return (
    <div>
      <h1>{industrySlug} Dashboard</h1>
      {/* Access engine features *\/}
      <pre>{JSON.stringify(engine.features, null, 2)}</pre>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 4: API Route Integration (Next.js)
// ============================================================================

/*
// app/api/[industry]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { industryEngineManager } from '@vayva/industry-core';

export async function GET(
  request: NextRequest,
  { params }: { params: { industry: string } }
) {
  try {
    const engine = await industryEngineManager.getEngine(params.industry);
    
    if (!engine) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      );
    }
    
    // Get statistics from the industry engine
    const stats = await engine.engine.getStatistics?.();
    
    return NextResponse.json({
      industry: params.industry,
      stats,
      features: Array.from(engine.features.keys()),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load industry data' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// EXAMPLE 5: Service Layer - Business Logic Abstraction
// ============================================================================

export class IndustryServiceLayer {
  private static instance: IndustryServiceLayer;
  
  private constructor() {}
  
  static getInstance(): IndustryServiceLayer {
    if (!IndustryServiceLayer.instance) {
      IndustryServiceLayer.instance = new IndustryServiceLayer();
    }
    return IndustryServiceLayer.instance;
  }
  
  /**
   * Get aggregated statistics across multiple industries
   */
  async getMultiIndustryStats(industries: string[]) {
    const manager = industryEngineManager;
    const results = new Map();
    
    for (const industry of industries) {
      const engine = await manager.getEngine(industry as any);
      
      if (engine && engine.engine.getStatistics) {
        const stats = await engine.engine.getStatistics();
        results.set(industry, stats);
      }
    }
    
    return Object.fromEntries(results);
  }
  
  /**
   * Execute industry-specific action
   */
  async executeIndustryAction<T>(
    industry: string,
    featureName: string,
    actionName: string,
    ...args: any[]
  ): Promise<T | null> {
    const engine = await industryEngineManager.getEngine(industry as any);
    
    if (!engine || !engine.engine[featureName]) {
      console.error(`Feature ${featureName} not found for ${industry}`);
      return null;
    }
    
    const feature = engine.engine[featureName];
    
    if (!feature[actionName]) {
      console.error(`Action ${actionName} not found on ${featureName}`);
      return null;
    }
    
    return await feature[actionName](...args);
  }
}

// ============================================================================
// EXAMPLE 6: Template Backend Integration
// ============================================================================

/*
// In template backend service
import { IndustryServiceLayer } from './phase-5-integration-example';

class TemplateBackendService {
  private industryService = IndustryServiceLayer.getInstance();
  
  async getDashboardData() {
    const tenantIndustry = await this.getTenantIndustry();
    
    // Fetch data using industry engine
    const stats = await this.industryService.executeIndustryAction(
      tenantIndustry,
      'dashboard',
      'getStatistics'
    );
    
    return {
      industry: tenantIndustry,
      stats,
      features: this.getAvailableFeatures(tenantIndustry),
    };
  }
  
  private getTenantIndustry(): Promise<string> {
    // Fetch from database/config
    return Promise.resolve('automotive');
  }
}
*/

// ============================================================================
// AVAILABLE INDUSTRIES & FEATURES
// ============================================================================

/**
 * Complete list of Phase 5 industries and their features:
 * 
 * AUTOMOTIVE:
 *   - VehicleInventory (inventory management, stock alerts)
 *   - ServiceScheduling (appointments, technician assignment)
 *   - DigitalRetail (financing, trade-in, checkout)
 * 
 * GROCERY:
 *   - GroceryInventory (stock tracking, expiration dates)
 *   - OrderProcessing (order fulfillment, delivery routes)
 *   - FreshnessTracking (quality control, waste reduction)
 * 
 * EVENTS:
 *   - EventManagement (event creation, venue management)
 *   - TicketingRegistration (ticket sales, attendee tracking)
 * 
 * WHOLESALE:
 *   - WholesaleOrderManagement (bulk orders, B2B pricing)
 *   - BulkPricing (tiered pricing, volume discounts)
 *   - DistributionNetwork (shipping, warehouse management)
 * 
 * NIGHTLIFE (Enhanced):
 *   - PromoterManagement (commission tracking, performance)
 *   - TableReservations (VIP bookings, table assignments)
 *   - BottleServiceManager (premium inventory, bottle orders) ⭐ NEW
 *   - EventAnalytics (real-time metrics, demographics) ⭐ NEW
 * 
 * NONPROFIT (Enhanced):
 *   - DonorManagement (donor profiles, donation tracking)
 *   - CampaignManager (fundraising campaigns, goal tracking)
 *   - GrantTracker (grant applications, deadline management) ⭐ NEW
 * 
 * PET CARE:
 *   - PetHealthRecords (medical history, vaccinations)
 * 
 * REAL ESTATE:
 *   - PropertyManagement (listings, showings, client management)
 * 
 * TRAVEL:
 *   - TravelBooking (flights, hotels, car rentals, packages)
 * 
 * SAAS:
 *   - SubscriptionManagement (recurring billing, usage tracking)
 * 
 * SPECIALIZED:
 *   - ServiceManagement (professional services, appointments)
 * 
 * SERVICES:
 *   - ServicesBooking (service appointments, provider scheduling)
 * 
 * BLOG/MEDIA:
 *   - ContentManagement (posts, articles, engagement analytics)
 */

// ============================================================================
// READY TO USE!
// ============================================================================

console.warn('Phase 5 Integration Ready! 🚀');
console.warn('Available industries:', industryEngineManager.getAvailableIndustries());
