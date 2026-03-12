/**
 * Delivery Route Optimization Feature
 * Manages delivery route planning and optimization
 */

import { DeliveryRouteOptimizerService, type DeliveryRoute, type DeliveryStop } from '../services/delivery-route-optimizer.service.js';

export interface DeliveryOptimizationConfig {
  enableAutoOptimize?: boolean;
}

export class DeliveryOptimizationFeature {
  private service: DeliveryRouteOptimizerService;
  private config: DeliveryOptimizationConfig;

  constructor(
    service: DeliveryRouteOptimizerService,
    config: DeliveryOptimizationConfig = {}
  ) {
    this.service = service;
    this.config = {
      enableAutoOptimize: true,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  /**
   * Create route
   */
  createRoute(data: Partial<DeliveryRoute>): Promise<DeliveryRoute> {
    return this.service.createRoute(data);
  }

  /**
   * Optimize route
   */
  optimizeRoute(routeId: string): DeliveryRoute | null {
    return this.service.optimizeRoute(routeId);
  }

  /**
   * Get routes by date
   */
  getRoutesByDate(date: Date): DeliveryRoute[] {
    return this.service.getRoutesByDate(date);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.service.getStatistics();
  }
}
