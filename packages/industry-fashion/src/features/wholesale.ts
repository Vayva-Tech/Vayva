// @ts-nocheck
import { prisma } from '@vayva/prisma';

export interface WholesalePortalConfig {
  buyerApprovalRequired: boolean;
  netTerms: NetTermsConfig;
  bulkPricing: BulkPricingTier[];
  customCatalogs: boolean;
  showroomMode: boolean;
}

export interface NetTermsConfig {
  enabled: boolean;
  defaultTerms: 'net30' | 'net60' | 'cod';
  creditCheckRequired: boolean;
}

export interface BulkPricingTier {
  minQuantity: number;
  discountPercent: number;
}

export interface WholesaleOrderInput {
  buyerId: string;
  items: WholesaleLineItemInput[];
  terms: 'net30' | 'net60' | 'cod';
  notes?: string;
}

export interface WholesaleLineItemInput {
  productId: string;
  quantity: number;
}

export class WholesaleService {
  /**
   * Register a new wholesale buyer
   */
  async registerBuyer(
    storeId: string,
    data: {
      companyName: string;
      contactName: string;
      email: string;
      phone?: string;
      taxId?: string;
    }
  ) {
    const buyer = await prisma.wholesaleBuyer.create({
      data: {
        storeId,
        ...data,
        status: 'pending',
        creditLimit: 0,
        creditUsed: 0,
      },
    });

    return buyer;
  }

  /**
   * Approve a wholesale buyer and set credit terms
   */
  async approveBuyer(
    buyerId: string,
    creditLimit: number,
    netTerms: 'net30' | 'net60' | 'cod'
  ) {
    const buyer = await prisma.wholesaleBuyer.update({
      where: { id: buyerId },
      data: {
        status: 'approved',
        creditLimit,
        netTerms,
      },
    });

    return buyer;
  }

  /**
   * Create a wholesale order
   */
  async createOrder(
    storeId: string,
    input: WholesaleOrderInput
  ) {
    const buyer = await prisma.wholesaleBuyer.findUnique({
      where: { id: input.buyerId },
    });

    if (!buyer || buyer.status !== 'approved') {
      throw new Error('Buyer not found or not approved');
    }

    // Get product details and calculate pricing
    const productIds = input.items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    interface ProductInfo {
      id: string;
      price: number;
    }
    
    const productMap = new Map<string, ProductInfo>(
      products.map((p: { id: string; price: unknown }) => [p.id, { id: p.id, price: Number(p.price) || 0 }])
    );

    let subtotal = 0;
    const orderItems = input.items.map(item => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Apply bulk pricing
      const unitPrice = this.calculateBulkPrice(product.price, item.quantity);
      const total = unitPrice * item.quantity;
      subtotal += total;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        total,
      };
    });

    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over $1000
    const total = subtotal + tax + shipping;

    // Check credit limit for net terms
    if (input.terms !== 'cod') {
      const availableCredit = buyer.creditLimit - buyer.creditUsed;
      if (total > availableCredit) {
        throw new Error('Order exceeds available credit');
      }
    }

    // Create order
    const order = await prisma.wholesaleOrder.create({
      data: {
        buyerId: input.buyerId,
        storeId,
        status: 'pending_approval',
        terms: input.terms,
        subtotal,
        tax,
        shipping,
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * Approve a wholesale order
   */
  async approveOrder(orderId: string) {
    const order = await prisma.wholesaleOrder.update({
      where: { id: orderId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
      },
    });

    // Update buyer's credit used if net terms
    if (order.terms !== 'cod') {
      await prisma.wholesaleBuyer.update({
        where: { id: order.buyerId },
        data: {
          creditUsed: {
            increment: order.total,
          },
        },
      });
    }

    return order;
  }

  /**
   * Mark order as shipped
   */
  async shipOrder(orderId: string, _trackingNumber?: string) {
    const order = await prisma.wholesaleOrder.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        shippedAt: new Date(),
      },
    });

    return order;
  }

  /**
   * Get buyer's available catalog
   */
  async getBuyerCatalog(buyerId: string) {
    const buyer = await prisma.wholesaleBuyer.findUnique({
      where: { id: buyerId },
    });

    if (!buyer) {
      throw new Error('Buyer not found');
    }

    let products;
    if (buyer.customCatalogEnabled && buyer.allowedProductIds.length > 0) {
      products = await prisma.product.findMany({
        where: {
          id: { in: buyer.allowedProductIds },
          status: 'ACTIVE',
        },
      });
    } else {
      products = await prisma.product.findMany({
        where: {
          storeId: buyer.storeId,
          status: 'ACTIVE',
        },
      });
    }

    return products.map((p: { id: string; price: unknown; [key: string]: unknown }) => ({
      ...p,
      wholesalePrice: this.calculateBulkPrice(Number(p.price), 1),
      bulkTiers: [
        { minQty: 12, price: this.calculateBulkPrice(Number(p.price), 12) },
        { minQty: 48, price: this.calculateBulkPrice(Number(p.price), 48) },
        { minQty: 100, price: this.calculateBulkPrice(Number(p.price), 100) },
      ],
    }));
  }

  private calculateBulkPrice(basePrice: number, quantity: number): number {
    const tiers = [
      { min: 100, discount: 0.30 },
      { min: 48, discount: 0.20 },
      { min: 12, discount: 0.10 },
      { min: 1, discount: 0.40 }, // Wholesale is 40% off retail by default
    ];

    const tier = tiers.find(t => quantity >= t.min);
    const discount = tier?.discount || 0.40;

    return Math.round(basePrice * (1 - discount) * 100) / 100;
  }

  /**
   * Get pending orders for merchant dashboard
   */
  async getPendingOrders(storeId: string) {
    const orders = await prisma.wholesaleOrder.findMany({
      where: {
        storeId,
        status: 'pending_approval',
      },
      include: {
        buyer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }
}

export const wholesale = new WholesaleService();
