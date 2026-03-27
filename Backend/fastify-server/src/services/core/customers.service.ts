import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Customers Service - Backend
 * Manages customer data, segmentation, and history
 */
export class CustomersService {
  constructor(private readonly db = prisma) {}

  /**
   * Create a new customer
   */
  async createCustomer(customerData: any) {
    const {
      storeId,
      email,
      phone,
      firstName,
      lastName,
      addresses,
      tags,
    } = customerData;

    try {
      const customer = await this.db.customer.create({
        data: {
          id: `cust-${Date.now()}`,
          storeId,
          email,
          phone: phone || null,
          firstName: firstName || null,
          lastName: lastName || null,
          acceptsMarketing: customerData.acceptsMarketing || false,
          tags: tags || [],
        },
      });

      // Create addresses if provided
      if (addresses && addresses.length > 0) {
        await this.db.customerAddress.createMany({
          data: addresses.map((addr: any) => ({
            id: `addr-${Date.now()}-${Math.random()}`,
            customerId: customer.id,
            type: addr.type || 'shipping',
            street: addr.street,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            zipCode: addr.zipCode,
            isDefault: addr.isDefault || false,
          })),
        });
      }

      logger.info(`[Customers] Created customer ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('[Customers] Create failed:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Get customers for a store
   */
  async getStoreCustomers(
    storeId: string,
    filters?: {
      search?: string;
      segment?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { storeId };

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const [customers, total] = await Promise.all([
      this.db.customer.findMany({
        where,
        include: {
          addresses: true,
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.customer.count({ where }),
    ]);

    return { customers, total, limit, offset };
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: string, storeId: string) {
    const customer = await this.db.customer.findFirst({
      where: { id: customerId, storeId },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return customer;
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, storeId: string, updates: any) {
    const customer = await this.getCustomerById(customerId, storeId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    const updated = await this.db.customer.update({
      where: { id: customerId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    logger.info(`[Customers] Updated customer ${customerId}`);
    return updated;
  }

  /**
   * Add customer address
   */
  async addAddress(customerId: string, storeId: string, addressData: any) {
    const customer = await this.getCustomerById(customerId, storeId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    const address = await this.db.customerAddress.create({
      data: {
        id: `addr-${Date.now()}`,
        customerId,
        type: addressData.type || 'shipping',
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        zipCode: addressData.zipCode,
        isDefault: addressData.isDefault || false,
      },
    });

    logger.info(`[Customers] Added address ${address.id}`);
    return address;
  }

  /**
   * Get customer order history
   */
  async getCustomerOrderHistory(customerId: string, storeId: string) {
    const orders = await this.db.order.findMany({
      where: { customerId, storeId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

    return {
      orders,
      totalOrders: orders.length,
      totalSpent,
      averageOrderValue,
      lastOrderDate: orders[0]?.createdAt || null,
    };
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(storeId: string) {
    const [totalCustomers, newCustomersThisMonth, topCustomers] = await Promise.all([
      this.db.customer.count({
        where: { storeId },
      }),
      this.db.customer.count({
        where: {
          storeId,
          createdAt: {
            gte: new Date(new Date().setDate(1)), // First day of current month
          },
        },
      }),
      this.db.customer.findMany({
        where: { storeId },
        include: {
          _count: {
            select: { orders: true },
          },
          orders: {
            select: { totalAmount: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalCustomers,
      newCustomersThisMonth,
      topCustomers: topCustomers.map((c) => ({
        id: c.id,
        email: c.email,
        orderCount: c._count.orders,
        totalSpent: c.orders.reduce((sum, o) => sum + o.totalAmount, 0),
      })),
    };
  }

  /**
   * Search customers
   */
  async searchCustomers(storeId: string, query: string, limit = 20) {
    const customers = await this.db.customer.findMany({
      where: {
        storeId,
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
      },
      include: {
        addresses: true,
      },
      take: limit,
    });

    return customers;
  }
}
