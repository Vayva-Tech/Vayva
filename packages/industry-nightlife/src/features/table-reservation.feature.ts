// @ts-nocheck
/**
 * Table Reservation Feature
 */

import { TableReservationManagerService } from '../services/table-reservation-manager.service.js';

export class TableReservationFeature {
  constructor(private service: TableReservationManagerService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  createReservation(eventId: string, data: any) {
    return this.service.createReservation(eventId, data);
  }

  updateReservationStatus(id: string, status: string) {
    return this.service.updateReservationStatus(id, status);
  }

  getStatistics(eventId: string) {
    return this.service.getStatistics(eventId);
  }
}
