/**
 * Vehicle Showcase Feature
 * Manages vehicle display, filtering, and comparison functionality
 */

import { VehicleGalleryService, type Vehicle, type VehicleFilter } from '../services/vehicle-gallery.service.js';

export interface VehicleShowcaseConfig {
  enableComparison?: boolean;
  enableVirtualTour?: boolean;
  maxCompareItems?: number;
}

export class VehicleShowcaseFeature {
  private galleryService: VehicleGalleryService;
  private config: VehicleShowcaseConfig;

  constructor(
    galleryService: VehicleGalleryService,
    config: VehicleShowcaseConfig = {}
  ) {
    this.galleryService = galleryService;
    this.config = {
      enableComparison: true,
      enableVirtualTour: true,
      maxCompareItems: 4,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    await this.galleryService.initialize();
  }

  /**
   * Get vehicles for showcase with filtering
   */
  getShowcaseVehicles(filter?: VehicleFilter): Vehicle[] {
    return this.galleryService.getVehicles(filter);
  }

  /**
   * Compare vehicles side-by-side
   */
  compareVehicles(vehicleIds: string[]): Vehicle[] {
    if (!this.config.enableComparison) {
      throw new Error('Vehicle comparison is disabled');
    }

    if (vehicleIds.length > this.config.maxCompareItems!) {
      throw new Error(`Maximum ${this.config.maxCompareItems} vehicles can be compared`);
    }

    return this.galleryService.compareVehicles(vehicleIds);
  }

  /**
   * Get featured vehicles for homepage
   */
  getFeaturedShowcase(limit: number = 6): Vehicle[] {
    return this.galleryService.getFeaturedVehicles(limit);
  }

  /**
   * Search vehicles
   */
  searchShowcase(query: string): Vehicle[] {
    return this.galleryService.searchVehicles(query);
  }

  /**
   * Get inventory statistics for dashboard
   */
  getInventoryOverview() {
    return this.galleryService.getInventoryStats();
  }
}
