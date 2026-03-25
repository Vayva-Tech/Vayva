/**
 * Nightlife Service Singleton
 * Aggregates all nightlife services for easy API access
 */

import { EventAnalyticsService } from './event-analytics.service';
import { TableReservationManagerService } from './table-reservation-manager.service';
import { BottleServiceManagerService } from './bottle-service-manager.service';
import { NightlifePromoterService } from './nightlife-promoter.service';

export class NightlifeService {
  private analytics: EventAnalyticsService;
  private tableReservations: TableReservationManagerService;
  private bottleService: BottleServiceManagerService;
  private promoterSales: NightlifePromoterService;

  constructor() {
    this.analytics = new EventAnalyticsService();
    this.tableReservations = new TableReservationManagerService();
    this.bottleService = new BottleServiceManagerService();
    this.promoterSales = new NightlifePromoterService();
  }

  async getMetrics() {
    return this.analytics.getAttendanceMetrics();
  }

  async getTables() {
    return this.tableReservations.getTableStatus();
  }

  async getVIPList() {
    return this.promoterSales.getGuestList();
  }

  async getBottleOrders() {
    return this.bottleService.getBottleOrders();
  }

  async getPromoterSales() {
    return this.promoterSales.getPromoterPerformance();
  }

  async getDoorActivity() {
    return this.analytics.getDoorActivity();
  }

  async getSecurityIncidents() {
    // Would integrate with security incident tracking system
    return [];
  }

  async getReservations() {
    return this.tableReservations.getUpcomingReservations();
  }
}

// Export singleton instance
export const nightlifeService = new NightlifeService();
