/**
 * Seating Chart Designer Feature
 */

import { SeatingChartDesignerService } from '../services/seating-chart-designer.service.js';

export class SeatingChartDesignerFeature {
  constructor(private service: SeatingChartDesignerService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  createSeatingChart(eventId: string, name: string, capacity: number) {
    return this.service.createSeatingChart(eventId, name, capacity);
  }

  addTable(chartId: string, data: any) {
    return this.service.addTable(chartId, data);
  }

  assignGuestToTable(chartId: string, guestId: string, tableId: string) {
    return this.service.assignGuestToTable(chartId, guestId, tableId);
  }

  getStatistics(chartId: string) {
    return this.service.getStatistics(chartId);
  }
}
