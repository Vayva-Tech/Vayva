/**
 * Bottle Service Manager Feature
 */

import { BottleServiceManagerService } from '../services/bottle-service-manager.service.js';
import type { BottleServiceOrder } from '../services/bottle-service-manager.service.js';

export class BottleServiceManagerFeature {
  constructor(private service: BottleServiceManagerService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  createOrder(data: any) {
    return this.service.createOrder(data);
  }

  updateOrderStatus(orderId: string, status: BottleServiceOrder['status']) {
    return this.service.updateOrderStatus(orderId, status);
  }

  getStatistics() {
    return this.service.getOrderStatistics();
  }
}
