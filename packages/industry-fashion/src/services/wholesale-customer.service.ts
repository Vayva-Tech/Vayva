/**
 * Wholesale Customer Service
 * B2B customer management, tiered pricing, and account-specific features
 */

import { z } from 'zod';

// Schema definitions
export const WholesaleCustomerSchema = z.object({
  customerId: z.string(),
  companyName: z.string(),
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  creditLimit: z.number(),
  currentBalance: z.number(),
  paymentTerms: z.number(), // days
  discountTier: z.number(), // percentage
  active: z.boolean(),
  createdAt: z.date(),
  lastOrderDate: z.date().optional(),
  totalOrders: z.number(),
  lifetimeValue: z.number(),
});

export type WholesaleCustomer = z.infer<typeof WholesaleCustomerSchema>;

export const WholesaleOrderSchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    sku: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    discount: z.number(),
    total: z.number(),
  })),
  subtotal: z.number(),
  discount: z.number(),
  tax: z.number(),
  total: z.number(),
  status: z.enum(['pending', 'approved', 'processing', 'shipped', 'delivered']),
  orderDate: z.date(),
  shipDate: z.date().optional(),
  deliveryDate: z.date().optional(),
});

export type WholesaleOrder = z.infer<typeof WholesaleOrderSchema>;

export interface WholesaleCustomerConfig {
  enableCreditCheck?: boolean;
  enableTierPricing?: boolean;
  autoApproveThreshold?: number;
}

/**
 * Wholesale Customer Service
 * Manages B2B customer relationships and ordering
 */
export class WholesaleCustomerService {
  private config: WholesaleCustomerConfig;
  private customers: Map<string, WholesaleCustomer>;
  private orders: Map<string, WholesaleOrder>;

  constructor(config: WholesaleCustomerConfig = {}) {
    this.config = {
      enableCreditCheck: true,
      enableTierPricing: true,
      autoApproveThreshold: 1000,
      ...config,
    };
    this.customers = new Map();
    this.orders = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[WHOLESALE_CUSTOMER_SERVICE] Initializing...');
    // Initialize connections to customer database
    // Load customer data
  }

  /**
   * Register a new wholesale customer
   */
  async registerCustomer(customerData: Omit<WholesaleCustomer, 'customerId' | 'createdAt'>): Promise<WholesaleCustomer> {
    const customer: WholesaleCustomer = {
      ...customerData,
      customerId: this.generateCustomerId(),
      createdAt: new Date(),
    };

    this.customers.set(customer.customerId, customer);
    console.log(`[WHOLESALE_CUSTOMER_SERVICE] Registered customer: ${customer.companyName}`);
    return customer;
  }

  /**
   * Get customer by ID
   */
  getCustomer(customerId: string): WholesaleCustomer | undefined {
    return this.customers.get(customerId);
  }

  /**
   * Get all customers filtered by tier
   */
  getCustomersByTier(tier: WholesaleCustomer['tier']): WholesaleCustomer[] {
    return Array.from(this.customers.values()).filter(c => c.tier === tier);
  }

  /**
   * Update customer tier based on performance
   */
  async updateCustomerTier(customerId: string, newTier: WholesaleCustomer['tier']): Promise<void> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    customer.tier = newTier;
    customer.discountTier = this.calculateDiscountForTier(newTier);
    this.customers.set(customerId, customer);
    console.log(`[WHOLESALE_CUSTOMER_SERVICE] Updated ${customer.companyName} to ${newTier} tier`);
  }

  /**
   * Create a wholesale order
   */
  async createOrder(orderData: Omit<WholesaleOrder, 'orderId' | 'orderDate' | 'status'>): Promise<WholesaleOrder> {
    const customer = this.customers.get(orderData.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check credit limit
    if (customer.currentBalance + orderData.total > customer.creditLimit) {
      throw new Error('Credit limit exceeded');
    }

    const order: WholesaleOrder = {
      ...orderData,
      orderId: this.generateOrderId(),
      orderDate: new Date(),
      status: this.shouldAutoApprove(orderData.total) ? 'approved' : 'pending',
    };

    this.orders.set(order.orderId, order);
    console.log(`[WHOLESALE_CUSTOMER_SERVICE] Created order ${order.orderId} for ${customer.companyName}`);
    return order;
  }

  /**
   * Get customer's order history
   */
  getCustomerOrders(customerId: string): WholesaleOrder[] {
    return Array.from(this.orders.values()).filter(o => o.customerId === customerId);
  }

  /**
   * Calculate tiered pricing for customer
   */
  calculateTieredPrice(basePrice: number, customer: WholesaleCustomer): number {
    if (!this.config.enableTierPricing) {
      return basePrice;
    }
    return basePrice * (1 - customer.discountTier / 100);
  }

  /**
   * Get customer analytics
   */
  getCustomerAnalytics(customerId: string): {
    totalOrders: number;
    lifetimeValue: number;
    averageOrderValue: number;
    lastOrderDate: Date | undefined;
    creditUtilization: number;
  } {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const orders = this.getCustomerOrders(customerId);
    const totalOrders = orders.length;
    const lifetimeValue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? lifetimeValue / totalOrders : 0;
    const creditUtilization = (customer.currentBalance / customer.creditLimit) * 100;

    return {
      totalOrders,
      lifetimeValue,
      averageOrderValue,
      lastOrderDate: customer.lastOrderDate,
      creditUtilization,
    };
  }

  /**
   * Dispose of service resources
   */
  async dispose(): Promise<void> {
    console.log('[WHOLESALE_CUSTOMER_SERVICE] Disposing...');
    this.customers.clear();
    this.orders.clear();
  }

  private generateCustomerId(): string {
    return `WC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOrderId(): string {
    return `WO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldAutoApprove(amount: number): boolean {
    return amount <= (this.config.autoApproveThreshold || 1000);
  }

  private calculateDiscountForTier(tier: WholesaleCustomer['tier']): number {
    switch (tier) {
      case 'bronze': return 5;
      case 'silver': return 10;
      case 'gold': return 15;
      case 'platinum': return 20;
      default: return 0;
    }
  }
}
