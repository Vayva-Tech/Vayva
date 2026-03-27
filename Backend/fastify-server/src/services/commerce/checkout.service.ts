import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Checkout Service - Backend
 * Manages checkout flow from cart to order
 */
export class CheckoutService {
  constructor(private readonly db = prisma) {}

  /**
   * Initialize checkout from cart
   */
  async initializeCheckout(
    cartId: string,
    storeId: string,
    customerId?: string,
    checkoutData?: any
  ) {
    const cart = await this.db.cart.findFirst({
      where: { id: cartId, storeId },
      include: {
        items: {
          include: { variant: true },
        },
      },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate inventory for all items
    const inventoryIssues = await this.validateInventory(cart.items);
    if (inventoryIssues.length > 0) {
      throw new Error(`Inventory issues: ${inventoryIssues.join(', ')}`);
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = cart.discountAmount || 0;
    const shipping = cart.shippingCost || 0;
    const tax = cart.taxAmount || 0;
    const total = subtotal - discount + shipping + tax;

    // Create checkout session
    const checkout = await this.db.checkout.create({
      data: {
        id: `checkout-${Date.now()}`,
        storeId,
        cartId,
        customerId: customerId || null,
        status: 'INITIATED',
        subtotal,
        discount,
        shippingCost: shipping,
        taxAmount: tax,
        totalAmount: total,
        currency: cart.currency,
        shippingAddress: cart.shippingAddress || checkoutData?.shippingAddress,
        billingAddress: checkoutData?.billingAddress,
        shippingMethod: cart.shippingMethod,
        paymentMethod: checkoutData?.paymentMethod,
        customerEmail: checkoutData?.customerEmail,
        customerPhone: checkoutData?.customerPhone,
        notes: checkoutData?.notes,
      },
    });

    logger.info(`[Checkout] Initialized checkout ${checkout.id} from cart ${cartId}`);
    return checkout;
  }

  /**
   * Update checkout information
   */
  async updateCheckout(
    checkoutId: string,
    storeId: string,
    updates: {
      shippingAddress?: any;
      billingAddress?: any;
      shippingMethod?: string;
      paymentMethod?: string;
      customerEmail?: string;
      customerPhone?: string;
      notes?: string;
    }
  ) {
    const checkout = await this.db.checkout.findFirst({
      where: { id: checkoutId, storeId },
    });

    if (!checkout) {
      throw new Error('Checkout not found');
    }

    const updated = await this.db.checkout.update({
      where: { id: checkoutId },
      data: updates,
    });

    logger.info(`[Checkout] Updated checkout ${checkoutId}`);
    return updated;
  }

  /**
   * Process checkout and create order
   */
  async processCheckout(checkoutId: string, storeId: string, paymentResult?: any) {
    const checkout = await this.db.checkout.findFirst({
      where: { id: checkoutId, storeId },
      include: {
        cart: {
          include: {
            items: {
              include: { variant: true },
            },
          },
        },
      },
    });

    if (!checkout) {
      throw new Error('Checkout not found');
    }

    if (checkout.status !== 'INITIATED') {
      throw new Error('Checkout already processed');
    }

    // Verify payment if required
    if (paymentResult && !paymentResult.success) {
      await this.db.checkout.update({
        where: { id: checkoutId },
        data: { status: 'PAYMENT_FAILED' },
      });
      throw new Error('Payment failed');
    }

    try {
      // Create order from checkout
      const order = await this.createOrderFromCheckout(checkout);

      // Update checkout status
      await this.db.checkout.update({
        where: { id: checkoutId },
        data: {
          status: 'COMPLETED',
          orderId: order.id,
          completedAt: new Date(),
        },
      });

      // Mark cart as converted
      await this.db.cart.update({
        where: { id: checkout.cartId },
        data: { status: 'CONVERTED' },
      });

      // Deduct inventory
      await this.deductInventory(checkout.cart.items);

      logger.info(`[Checkout] Processed checkout ${checkoutId} -> Order ${order.id}`);
      return { success: true, order };
    } catch (error) {
      logger.error('[Checkout] Process failed:', error);
      await this.db.checkout.update({
        where: { id: checkoutId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  /**
   * Cancel checkout
   */
  async cancelCheckout(checkoutId: string, storeId: string, reason?: string) {
    const checkout = await this.db.checkout.findFirst({
      where: { id: checkoutId, storeId },
    });

    if (!checkout) {
      throw new Error('Checkout not found');
    }

    if (checkout.status !== 'INITIATED') {
      throw new Error('Cannot cancel processed checkout');
    }

    await this.db.checkout.update({
      where: { id: checkoutId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });

    // Reactivate cart
    await this.db.cart.update({
      where: { id: checkout.cartId },
      data: { status: 'ACTIVE' },
    });

    logger.info(`[Checkout] Cancelled checkout ${checkoutId}`);
    return { success: true };
  }

  /**
   * Get checkout by ID
   */
  async getCheckoutById(checkoutId: string, storeId: string) {
    return await this.db.checkout.findFirst({
      where: { id: checkoutId, storeId },
      include: {
        cart: {
          include: {
            items: {
              include: { variant: true },
            },
          },
        },
        order: true,
      },
    });
  }

  /**
   * Get store checkouts
   */
  async getStoreCheckouts(
    storeId: string,
    filters?: {
      page?: number;
      limit?: number;
      status?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const where: any = { storeId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const [checkouts, total] = await Promise.all([
      this.db.checkout.findMany({
        where,
        include: {
          cart: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.checkout.count({ where }),
    ]);

    return {
      checkouts,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get checkout statistics
   */
  async getCheckoutStats(storeId: string, period?: { from: Date; to: Date }) {
    const where: any = { storeId };
    
    if (period) {
      where.createdAt = { gte: period.from, lte: period.to };
    }

    const [total, completed, abandoned, failed, totalRevenue] = await Promise.all([
      this.db.checkout.count({ where }),
      this.db.checkout.count({ where: { ...where, status: 'COMPLETED' } }),
      this.db.checkout.count({ where: { ...where, status: 'ABANDONED' } }),
      this.db.checkout.count({ where: { ...where, status: 'FAILED' } }),
      this.db.checkout.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
    ]);

    const conversionRate = total > 0 ? (completed / total) * 100 : 0;
    const abandonmentRate = total > 0 ? (abandoned / total) * 100 : 0;

    return {
      totalCheckouts: total,
      completedCheckouts: completed,
      abandonedCheckouts: abandoned,
      failedCheckouts: failed,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      abandonmentRate: parseFloat(abandonmentRate.toFixed(2)),
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      averageOrderValue: completed > 0 
        ? (totalRevenue._sum.totalAmount || 0) / completed 
        : 0,
    };
  }

  /**
   * Validate inventory for cart items
   */
  private async validateInventory(items: any[]): Promise<string[]> {
    const issues: string[] = [];

    for (const item of items) {
      if (item.variant) {
        if (item.variant.quantity < item.quantity) {
          issues.push(`${item.productName} (${item.variantName}): Insufficient stock`);
        }
      } else {
        // Check product-level inventory if no variant
        const product = await this.db.product.findUnique({
          where: { id: item.productId },
        });
        
        if (product && product.stockQuantity !== undefined && product.stockQuantity < item.quantity) {
          issues.push(`${item.productName}: Insufficient stock`);
        }
      }
    }

    return issues;
  }

  /**
   * Create order from checkout
   */
  private async createOrderFromCheckout(checkout: any) {
    const orderItems = checkout.cart.items.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    return await this.db.order.create({
      data: {
        id: `order-${Date.now()}`,
        storeId: checkout.storeId,
        customerId: checkout.customerId,
        checkoutId: checkout.id,
        orderNumber: `ORD-${Date.now()}`,
        status: 'PENDING_PAYMENT',
        paymentStatus: checkout.paymentMethod ? 'INITIATED' : 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
        subtotal: checkout.subtotal,
        discountAmount: checkout.discount,
        shippingCost: checkout.shippingCost,
        taxAmount: checkout.taxAmount,
        totalAmount: checkout.totalAmount,
        currency: checkout.currency,
        customerEmail: checkout.customerEmail,
        customerPhone: checkout.customerPhone,
        shippingAddress: checkout.shippingAddress,
        billingAddress: checkout.billingAddress,
        shippingMethod: checkout.shippingMethod,
        paymentMethod: checkout.paymentMethod,
        notes: checkout.notes,
        items: {
          create: orderItems,
        },
      },
    });
  }

  /**
   * Deduct inventory after successful checkout
   */
  private async deductInventory(items: any[]) {
    for (const item of items) {
      if (item.variantId) {
        await this.db.productVariant.update({
          where: { id: item.variantId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      } else {
        const product = await this.db.product.findUnique({
          where: { id: item.productId },
        });
        
        if (product && product.stockQuantity !== undefined) {
          await this.db.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }
    }

    logger.info(`[Checkout] Deducted inventory for ${items.length} items`);
  }
}
