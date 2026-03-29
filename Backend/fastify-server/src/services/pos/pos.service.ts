import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

const CreatePOSTableSchema = z.object({
  storeId: z.string(),
  type: z.enum(['PRODUCT', 'SERVICE', 'TIME_SLOT', 'BUNDLE']),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  name: z.string().min(1),
  price: z.number().positive(),
  taxCategory: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const CreatePOSOrderSchema = z.object({
  storeId: z.string(),
  tableId: z.string().optional(),
  customerId: z.string().optional(),
  cashierId: z.string().optional(),
  items: z.array(z.object({
    posItemId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().optional().default(0),
    notes: z.string().optional(),
    modifiers: z.array(z.object({
      name: z.string(),
      value: z.string(),
      price: z.number().optional().default(0),
    })).optional(),
  })),
  paymentMethod: z.string().optional(),
  splitPayments: z.array(z.object({
    method: z.string(),
    amount: z.number().positive(),
  })).optional(),
  tip: z.number().optional().default(0),
  serviceCharge: z.number().optional().default(0),
  notes: z.string().optional(),
});

const ProcessSplitPaymentSchema = z.object({
  payments: z.array(z.object({
    method: z.string(),
    amount: z.number().positive(),
  })),
});

// ============================================================================
// Service Class
// ============================================================================

export class POSService {
  constructor(private readonly db = prisma) {}

  /**
   * Create a POS-able item (product, service, or time slot)
   */
  async createPOSTable(data: z.infer<typeof CreatePOSTableSchema>) {
    const parsed = CreatePOSTableSchema.parse(data);
    
    const posItem = await this.db.pOSTable.create({
      data: parsed,
    });

    logger.info(`[POS] Created POSTable ${posItem.id}`);
    return posItem;
  }

  /**
   * Get all POS items for a store
   */
  async getStorePOSItems(storeId: string, filters?: { type?: string; search?: string }) {
    const where: any = { storeId };
    
    if (filters?.type) {
      where.type = filters.type;
    }
    
    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return this.db.pOSTable.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single POS item by ID
   */
  async getPOSTableById(id: string, storeId: string) {
    const posItem = await this.db.pOSTable.findUnique({
      where: { id, storeId },
      include: {
        product: true,
      },
    });

    if (!posItem) {
      throw new Error('POS item not found');
    }

    return posItem;
  }

  /**
   * Update a POS item
   */
  async updatePOSTable(id: string, storeId: string, updates: Partial<z.infer<typeof CreatePOSTableSchema>>) {
    const existing = await this.getPOSTableById(id, storeId);
    
    const updated = await this.db.pOSTable.update({
      where: { id },
      data: updates,
    });

    logger.info(`[POS] Updated POSTable ${id}`);
    return updated;
  }

  /**
   * Delete a POS item
   */
  async deletePOSTable(id: string, storeId: string) {
    await this.getPOSTableById(id, storeId);
    
    await this.db.pOSTable.delete({
      where: { id },
    });

    logger.info(`[POS] Deleted POSTable ${id}`);
    return { success: true };
  }

  /**
   * Create POS order from cart
   */
  async createPOSOrder(data: z.infer<typeof CreatePOSOrderSchema>) {
    const parsed = CreatePOSOrderSchema.parse(data);
    
    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const item of parsed.items) {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      const itemTax = (itemSubtotal - itemDiscount) * 0.075; // 7.5% VAT
      
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;
    }

    const tip = parsed.tip || 0;
    const serviceCharge = parsed.serviceCharge || 0;
    const total = subtotal - totalDiscount + totalTax + tip + serviceCharge;

    // Create order transaction
    const order = await this.db.pOSOrder.create({
      data: {
        storeId: parsed.storeId,
        tableId: parsed.tableId,
        customerId: parsed.customerId,
        cashierId: parsed.cashierId,
        status: 'COMPLETED',
        paymentMethod: parsed.paymentMethod,
        paymentStatus: parsed.splitPayments ? 'PARTIAL' : parsed.paymentMethod ? 'PAID' : 'UNPAID',
        splitPayments: parsed.splitPayments,
        subtotal,
        tax: totalTax,
        discount: totalDiscount,
        tip,
        serviceCharge,
        total,
        receiptNumber: `POS-${Date.now()}`,
        notes: parsed.notes,
        items: {
          create: parsed.items.map(item => ({
            posItemId: item.posItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            subtotal: item.quantity * item.unitPrice,
            notes: item.notes,
            modifiers: item.modifiers,
          })),
        },
      },
      include: {
        items: {
          include: {
            posItem: true,
          },
        },
      },
    });

    logger.info(`[POS] Created order ${order.id} with total ₦${total}`);
    return order;
  }

  /**
   * Get POS order by ID
   */
  async getPOSOrder(orderId: string, storeId: string) {
    const order = await this.db.pOSOrder.findUnique({
      where: { id: orderId, storeId },
      include: {
        items: {
          include: {
            posItem: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new Error('POS order not found');
    }

    return order;
  }

  /**
   * Process split payment
   */
  async processSplitPayment(orderId: string, storeId: string, payments: Array<{ method: string; amount: number }>) {
    const order = await this.getPOSOrder(orderId, storeId);

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    if (Math.abs(totalPaid - Number(order.total)) > 0.01) {
      throw new Error(`Payment amounts don't match order total. Expected: ₦${order.total}, Got: ₦${totalPaid}`);
    }

    // Create payment records
    const createdPayments = await Promise.all(
      payments.map(payment => 
        this.db.pOSPayment.create({
          data: {
            orderId,
            method: payment.method,
            amount: payment.amount,
            status: 'COMPLETED',
          },
        })
      )
    );

    // Update order status
    const updatedOrder = await this.db.pOSOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        payments: {
          connect: createdPayments.map(p => ({ id: p.id })),
        },
      },
    });

    logger.info(`[POS] Processed split payment for order ${orderId}`);
    return { order: updatedOrder, payments: createdPayments };
  }

  /**
   * Generate receipt
   */
  async generateReceipt(orderId: string, storeId: string) {
    const order = await this.getPOSOrder(orderId, storeId);

    // Format receipt data
    const receipt = {
      receiptNumber: order.receiptNumber,
      storeId: order.storeId,
      date: order.createdAt,
      items: order.items.map(item => ({
        name: item.posItem.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      tip: Number(order.tip),
      serviceCharge: Number(order.serviceCharge),
      total: Number(order.total),
      payments: order.payments.map(payment => ({
        method: payment.method,
        amount: Number(payment.amount),
      })),
      balance: 0,
    };

    return receipt;
  }

  /**
   * Get today's POS statistics
   */
  async getTodayStats(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, totalRevenue, avgTransaction] = await Promise.all([
      this.db.pOSOrder.count({
        where: {
          storeId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.db.pOSOrder.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: {
          total: true,
        },
      }),
      this.db.pOSOrder.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _avg: {
          total: true,
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total) || 0,
      avgTransaction: Number(avgTransaction._avg.total) || 0,
    };
  }

  /**
   * Get recent POS orders
   */
  async getRecentOrders(storeId: string, limit = 20) {
    const orders = await this.db.pOSOrder.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: {
          take: 3,
          include: {
            posItem: true,
          },
        },
        payments: true,
      },
    });

    return orders;
  }
}

export const posService = new POSService();
