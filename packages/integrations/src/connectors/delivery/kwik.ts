/**
 * Kwik Delivery Connector
 * Integration with Kwik Delivery API (Nigeria)
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface KwikConfig extends ConnectorConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  vendorId?: string;
}

export interface KwikDeliveryRequest {
  orderId: string;
  pickupAddress: KwikAddress;
  deliveryAddress: KwikAddress;
  packageDescription: string;
  packageValue?: number;
  paymentMethod: 'prepaid' | 'cash_on_delivery';
  deliveryInstructions?: string;
  recipientPhone: string;
  recipientName: string;
}

export interface KwikAddress {
  street: string;
  city: string;
  state: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
}

export interface KwikDeliveryResponse {
  orderId: string;
  trackingId: string;
  status: KwikDeliveryStatus;
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  riderName?: string;
  riderPhone?: string;
  trackingUrl?: string;
  fee: number;
  currency: string;
}

export type KwikDeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface KwikPriceEstimate {
  fee: number;
  currency: string;
  estimatedPickupMinutes: number;
  estimatedDeliveryMinutes: number;
  distance: number;
  vehicleType: string;
}

export class KwikDeliveryConnector {
  private config: KwikConfig;
  private baseUrl: string;

  constructor(config: KwikConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.kwik.delivery/v1'
        : 'https://api-sandbox.kwik.delivery/v1';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      throw new Error(
        `Kwik API error: ${error.message ?? error.error ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get price estimate for delivery
   */
  async getPriceEstimate(
    pickup: KwikAddress,
    delivery: KwikAddress
  ): Promise<KwikPriceEstimate> {
    const result = await this.request<{
      fee: number;
      currency: string;
      estimated_pickup_minutes: number;
      estimated_delivery_minutes: number;
      distance: number;
      vehicle_type: string;
    }>('/estimate', {
      method: 'POST',
      body: JSON.stringify({
        pickup_address: pickup.street,
        pickup_city: pickup.city,
        pickup_state: pickup.state,
        pickup_lat: pickup.latitude,
        pickup_lng: pickup.longitude,
        delivery_address: delivery.street,
        delivery_city: delivery.city,
        delivery_state: delivery.state,
        delivery_lat: delivery.latitude,
        delivery_lng: delivery.longitude,
      }),
    });

    return {
      fee: result.fee,
      currency: result.currency,
      estimatedPickupMinutes: result.estimated_pickup_minutes,
      estimatedDeliveryMinutes: result.estimated_delivery_minutes,
      distance: result.distance,
      vehicleType: result.vehicle_type,
    };
  }

  /**
   * Create a delivery order
   */
  async createDelivery(
    request: KwikDeliveryRequest
  ): Promise<KwikDeliveryResponse> {
    const result = await this.request<{
      order_id: string;
      tracking_id: string;
      status: string;
      estimated_pickup_time?: string;
      estimated_delivery_time?: string;
      rider_name?: string;
      rider_phone?: string;
      tracking_url?: string;
      fee: number;
      currency: string;
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        external_order_id: request.orderId,
        pickup_address: {
          street: request.pickupAddress.street,
          city: request.pickupAddress.city,
          state: request.pickupAddress.state,
          latitude: request.pickupAddress.latitude,
          longitude: request.pickupAddress.longitude,
          landmark: request.pickupAddress.landmark,
        },
        delivery_address: {
          street: request.deliveryAddress.street,
          city: request.deliveryAddress.city,
          state: request.deliveryAddress.state,
          latitude: request.deliveryAddress.latitude,
          longitude: request.deliveryAddress.longitude,
          landmark: request.deliveryAddress.landmark,
        },
        package_description: request.packageDescription,
        package_value: request.packageValue,
        payment_method: request.paymentMethod,
        delivery_instructions: request.deliveryInstructions,
        recipient_phone: request.recipientPhone,
        recipient_name: request.recipientName,
        vendor_id: this.config.vendorId,
      }),
    });

    return {
      orderId: result.order_id,
      trackingId: result.tracking_id,
      status: result.status as KwikDeliveryStatus,
      estimatedPickupTime: result.estimated_pickup_time
        ? new Date(result.estimated_pickup_time)
        : undefined,
      estimatedDeliveryTime: result.estimated_delivery_time
        ? new Date(result.estimated_delivery_time)
        : undefined,
      riderName: result.rider_name,
      riderPhone: result.rider_phone,
      trackingUrl: result.tracking_url,
      fee: result.fee,
      currency: result.currency,
    };
  }

  /**
   * Track a delivery
   */
  async trackDelivery(trackingId: string): Promise<KwikDeliveryResponse> {
    const result = await this.request<{
      order_id: string;
      tracking_id: string;
      status: string;
      estimated_delivery_time?: string;
      rider_name?: string;
      rider_phone?: string;
      tracking_url?: string;
      fee: number;
      currency: string;
    }>(`/orders/${trackingId}`);

    return {
      orderId: result.order_id,
      trackingId: result.tracking_id,
      status: result.status as KwikDeliveryStatus,
      estimatedDeliveryTime: result.estimated_delivery_time
        ? new Date(result.estimated_delivery_time)
        : undefined,
      riderName: result.rider_name,
      riderPhone: result.rider_phone,
      trackingUrl: result.tracking_url,
      fee: result.fee,
      currency: result.currency,
    };
  }

  /**
   * Cancel a delivery
   */
  async cancelDelivery(trackingId: string, reason?: string): Promise<boolean> {
    try {
      await this.request(`/orders/${trackingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get delivery history
   */
  async getDeliveryHistory(from?: Date, to?: Date): Promise<KwikDeliveryResponse[]> {
    const params = new URLSearchParams({ limit: '100' });
    if (from) params.set('from', from.toISOString());
    if (to) params.set('to', to.toISOString());

    const result = await this.request<{
      orders: Array<{
        order_id: string;
        tracking_id: string;
        status: string;
        fee: number;
        currency: string;
      }>;
    }>(`/orders?${params.toString()}`);

    return result.orders.map((o) => ({
      orderId: o.order_id,
      trackingId: o.tracking_id,
      status: o.status as KwikDeliveryStatus,
      fee: o.fee,
      currency: o.currency,
    }));
  }

  /**
   * Bulk dispatch orders for fulfillment
   */
  async dispatchOrders(
    orders: Array<{
      id: string;
      recipientName: string;
      recipientPhone: string;
      deliveryAddress: KwikAddress;
      pickupAddress: KwikAddress;
      description: string;
      payOnDelivery?: boolean;
    }>
  ): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const order of orders) {
      try {
        await this.createDelivery({
          orderId: order.id,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          deliveryAddress: order.deliveryAddress,
          pickupAddress: order.pickupAddress,
          packageDescription: order.description,
          paymentMethod: order.payOnDelivery ? 'cash_on_delivery' : 'prepaid',
        });
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to dispatch order ${order.id}: ${error}`);
      }
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Attempt a price estimate with dummy data
      await this.getPriceEstimate(
        { street: 'Test', city: 'Lagos', state: 'Lagos' },
        { street: 'Test 2', city: 'Lagos', state: 'Lagos' }
      );
      return true;
    } catch {
      return false;
    }
  }
}

export default KwikDeliveryConnector;
