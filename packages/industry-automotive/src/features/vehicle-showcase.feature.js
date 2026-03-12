/**
 * Vehicle Showcase Feature
 * Manages vehicle display, filtering, and comparison functionality
 */

export class VehicleShowcaseFeature {
  constructor(galleryService, config = {}) {
    this.galleryService = galleryService;
    this.config = {
      enableComparison: true,
      enableVirtualTour: true,
      maxCompareItems: 4,
      ...config,
    };
  }

  async initialize() {
    await this.galleryService.initialize();
  }

  getShowcaseVehicles(filter = {}) {
    return this.galleryService.getVehicles(filter);
  }

  compareVehicles(vehicleIds) {
    if (!this.config.enableComparison) {
      throw new Error('Vehicle comparison is disabled');
    }

    if (vehicleIds.length > this.config.maxCompareItems) {
      throw new Error(`Maximum ${this.config.maxCompareItems} vehicles can be compared`);
    }

    // Simple comparison implementation
    return vehicleIds.map(id => this.galleryService.getVehicleById(id)).filter(Boolean);
  }

  getFeaturedShowcase(limit = 6) {
    // Return featured vehicles (first N vehicles for now)
    const vehicles = this.galleryService.getVehicles({});
    return vehicles.slice(0, limit);
  }

  searchShowcase(query) {
    const vehicles = this.galleryService.getVehicles({});
    return vehicles.filter(v => 
      v.make.toLowerCase().includes(query.toLowerCase()) ||
      v.model.toLowerCase().includes(query.toLowerCase())
    );
  }

  getInventoryOverview() {
    const vehicles = this.galleryService.getVehicles({});
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      reserved: vehicles.filter(v => v.status === 'reserved').length,
      sold: vehicles.filter(v => v.status === 'sold').length,
    };
  }
}