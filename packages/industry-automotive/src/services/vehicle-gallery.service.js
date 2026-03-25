/**
 * Vehicle Gallery Service
 * Manages vehicle inventory display, filtering, and showcase features
 */

export class VehicleGalleryService {
  constructor() {
    this.vehicles = [];
    this.filters = {};
  }

  async initialize() {
    // Initialize service
    console.warn('[VEHICLE_GALLERY_SERVICE] Initialized');
  }

  async getVehicles(filter = {}) {
    // Return filtered vehicles
    return this.vehicles.filter(vehicle => {
      if (filter.make && !filter.make.includes(vehicle.make)) return false;
      if (filter.model && !filter.model.includes(vehicle.model)) return false;
      if (filter.yearRange && (vehicle.year < filter.yearRange[0] || vehicle.year > filter.yearRange[1])) return false;
      if (filter.priceRange && (vehicle.price < filter.priceRange[0] || vehicle.price > filter.priceRange[1])) return false;
      if (filter.condition && vehicle.condition !== filter.condition) return false;
      return true;
    });
  }

  async getVehicleById(id) {
    return this.vehicles.find(v => v.id === id);
  }

  async addVehicle(vehicle) {
    this.vehicles.push(vehicle);
    return vehicle;
  }

  async updateVehicle(id, updates) {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      this.vehicles[index] = { ...this.vehicles[index], ...updates };
      return this.vehicles[index];
    }
    return null;
  }

  async deleteVehicle(id) {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      return this.vehicles.splice(index, 1)[0];
    }
    return null;
  }
}