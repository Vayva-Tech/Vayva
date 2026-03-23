// @ts-nocheck
/**
 * Property Management Feature
 */

import { PropertyManagementService, Property, Showing, PropertyConfig } from '../services/property-management.service';

export class PropertyManagementFeature {
  constructor(private service: PropertyManagementService) {}

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    return this.service.createProperty(propertyData);
  }

  async updatePrice(propertyId: string, newPrice: number): Promise<boolean> {
    return this.service.updatePrice(propertyId, newPrice);
  }

  async scheduleShowing(showingData: Partial<Showing>): Promise<Showing> {
    return this.service.scheduleShowing(showingData);
  }

  async getUpcomingShowings(daysAhead?: number): Promise<Showing[]> {
    return this.service.getUpcomingShowings(daysAhead);
  }

  async getStatistics() {
    return this.service.getStatistics();
  }

  async getPriceByType() {
    return this.service.getPriceByType();
  }
}
