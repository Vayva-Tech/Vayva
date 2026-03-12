import { prisma } from "@vayva/db";

export interface Vendor {
  id: string;
  storeId: string;
  userId?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: "pending" | "active" | "suspended" | "inactive";
  contactInfo: {
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  settings: {
    commissionRate: number; // percentage
    paymentSchedule: "daily" | "weekly" | "biweekly" | "monthly";
    shippingPolicy?: string;
    returnPolicy?: string;
    customDomain?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    rating: number;
    reviewCount: number;
    joinedAt: Date;
  };
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
  };
  documents?: Array<{
    type: "business_reg" | "tax_id" | "id_proof" | "address_proof";
    url: string;
    verified: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  productId: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  price: number;
  compareAtPrice?: number;
  inventory: number;
  isFulfillmentManaged: boolean;
  shippingMethods: string[];
  createdAt: Date;
}

export interface VendorOrder {
  id: string;
  vendorId: string;
  orderId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    commission: number;
  }>;
  subtotal: number;
  commission: number;
  payout: number;
  shippingCost: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  fulfillmentStatus: "unfulfilled" | "partial" | "fulfilled";
  trackingInfo?: {
    carrier: string;
    trackingNumber: string;
    url: string;
    shippedAt: Date;
  };
  payoutStatus: "pending" | "scheduled" | "paid";
  payoutDate?: Date;
  createdAt: Date;
}

export interface VendorPayout {
  id: string;
  vendorId: string;
  amount: number;
  orderIds: string[];
  status: "pending" | "processing" | "paid" | "failed";
  paymentMethod: "bank_transfer" | "mobile_money" | "wallet";
  transactionId?: string;
  processedAt?: Date;
  periodStart: Date;
  periodEnd: Date;
  notes?: string;
  createdAt: Date;
}

export class MultiVendorService {
  private readonly DEFAULT_COMMISSION_RATE = 10; // 10%

  /**
   * Register a new vendor
   */
  async registerVendor(
    storeId: string,
    data: {
      name: string;
      description?: string;
      contactInfo: Vendor["contactInfo"];
      bankAccount?: Vendor["bankAccount"];
      documents?: Vendor["documents"];
      userId?: string;
    }
  ): Promise<Vendor> {
    // Check if vendor name is unique
    const existing = await prisma.vendor.findFirst({
      where: { storeId, name: data.name },
    });

    if (existing) {
      throw new Error("A vendor with this name already exists");
    }

    // Generate slug
    const slug = this.generateSlug(data.name);

    // Check if slug exists
    const slugExists = await prisma.vendor.findFirst({
      where: { storeId, slug },
    });

    const finalSlug = slugExists ? `${slug}-${Date.now()}` : slug;

    const vendor = await prisma.vendor.create({
      data: {
        storeId,
        userId: data.userId,
        name: data.name,
        slug: finalSlug,
        description: data.description,
        status: "pending",
        contactInfo: data.contactInfo,
        settings: {
          commissionRate: this.DEFAULT_COMMISSION_RATE,
          paymentSchedule: "weekly",
          shippingPolicy: "",
          returnPolicy: "",
        },
        stats: {
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          rating: 0,
          reviewCount: 0,
          joinedAt: new Date(),
        },
        bankAccount: data.bankAccount,
        documents: data.documents || [],
      },
    });

    return this.mapVendor(vendor);
  }

  /**
   * Approve vendor application
   */
  async approveVendor(vendorId: string, approvedBy: string): Promise<Vendor> {
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: "active",
        approvedAt: new Date(),
        approvedBy,
      },
    });

    // Create vendor wallet
    await prisma.vendorWallet.create({
      data: {
        vendorId,
        balance: 0,
        pendingPayout: 0,
        lifetimeEarnings: 0,
      },
    });

    return this.mapVendor(vendor);
  }

  /**
   * Suspend vendor
   */
  async suspendVendor(vendorId: string, reason: string, suspendedBy: string): Promise<Vendor> {
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        status: "suspended",
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedBy,
      },
    });

    // Suspend all products
    await prisma.vendorProduct.updateMany({
      where: { vendorId },
      data: { status: "suspended" },
    });

    return this.mapVendor(vendor);
  }

  /**
   * Add product to vendor
   */
  async addVendorProduct(
    vendorId: string,
    data: {
      productId?: string; // Existing product or create new
      name?: string;
      description?: string;
      price: number;
      compareAtPrice?: number;
      inventory: number;
      images?: string[];
      categoryId?: string;
      attributes?: Record<string, string>;
      isFulfillmentManaged?: boolean;
      shippingMethods?: string[];
    }
  ): Promise<VendorProduct> {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new Error("Vendor not found");
    if (vendor.status !== "active") throw new Error("Vendor is not active");

    let productId = data.productId;

    // Create new product if needed
    if (!productId) {
      if (!data.name) throw new Error("Product name is required");

      const product = await prisma.product.create({
        data: {
          storeId: vendor.storeId,
          name: data.name,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          categoryId: data.categoryId,
          vendorId,
          status: "pending", // Pending admin approval
          attributes: data.attributes || {},
          images: data.images?.map((url, index) => ({
            url,
            position: index,
            alt: data.name,
          })),
        },
      });

      productId = product.id;

      // Create inventory
      await prisma.inventory.create({
        data: {
          productId,
          quantity: data.inventory,
          managedBy: vendorId,
        },
      });
    }

    // Create vendor product relationship
    const vendorProduct = await prisma.vendorProduct.create({
      data: {
        vendorId,
        productId,
        status: "pending",
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        inventory: data.inventory,
        isFulfillmentManaged: data.isFulfillmentManaged ?? true,
        shippingMethods: data.shippingMethods || [],
      },
    });

    // Update vendor stats
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        stats: {
          ...(vendor.stats as Record<string, unknown>),
          totalProducts: ((vendor.stats as { totalProducts: number })?.totalProducts || 0) + 1,
        },
      },
    });

    return this.mapVendorProduct(vendorProduct);
  }

  /**
   * Approve vendor product
   */
  async approveProduct(vendorProductId: string, approvedBy: string): Promise<VendorProduct> {
    const vendorProduct = await prisma.vendorProduct.update({
      where: { id: vendorProductId },
      data: { status: "approved" },
    });

    // Update product status
    await prisma.product.update({
      where: { id: vendorProduct.productId },
      data: { status: "active" },
    });

    return this.mapVendorProduct(vendorProduct);
  }

  /**
   * Process order items for vendor
   */
  async processVendorOrder(orderId: string): Promise<VendorOrder[]> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new Error("Order not found");

    const vendorOrders: VendorOrder[] = [];
    const vendorItems = new Map<string, typeof order.items>();

    // Group items by vendor
    for (const item of order.items) {
      const vendorId = (item.product as { vendorId?: string })?.vendorId;
      if (vendorId) {
        if (!vendorItems.has(vendorId)) {
          vendorItems.set(vendorId, []);
        }
        vendorItems.get(vendorId)!.push(item);
      }
    }

    // Create vendor orders
    for (const [vendorId, items] of vendorItems) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) continue;

      const commissionRate = (vendor.settings as { commissionRate: number })?.commissionRate || this.DEFAULT_COMMISSION_RATE;

      const orderItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        commission: Math.round(item.price * item.quantity * (commissionRate / 100)),
      }));

      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const commission = orderItems.reduce((sum, item) => sum + item.commission, 0);
      const payout = subtotal - commission;

      const vendorOrder = await prisma.vendorOrder.create({
        data: {
          vendorId,
          orderId,
          items: orderItems,
          subtotal,
          commission,
          payout,
          shippingCost: 0, // Calculated later
          status: "pending",
          fulfillmentStatus: "unfulfilled",
          payoutStatus: "pending",
        },
      });

      vendorOrders.push(this.mapVendorOrder(vendorOrder));

      // Update vendor stats
      await this.updateVendorStats(vendorId, subtotal);
    }

    return vendorOrders;
  }

  /**
   * Vendor confirms order and prepares for shipment
   */
  async confirmVendorOrder(vendorOrderId: string): Promise<VendorOrder> {
    const vendorOrder = await prisma.vendorOrder.update({
      where: { id: vendorOrderId },
      data: { status: "confirmed" },
    });

    return this.mapVendorOrder(vendorOrder);
  }

  /**
   * Vendor ships order
   */
  async shipVendorOrder(
    vendorOrderId: string,
    trackingInfo: {
      carrier: string;
      trackingNumber: string;
      url?: string;
    }
  ): Promise<VendorOrder> {
    const vendorOrder = await prisma.vendorOrder.update({
      where: { id: vendorOrderId },
      data: {
        status: "shipped",
        fulfillmentStatus: "fulfilled",
        trackingInfo: {
          ...trackingInfo,
          shippedAt: new Date(),
        },
      },
    });

    // Notify customer
    await this.notifyCustomerOfShipment(vendorOrder.orderId, trackingInfo);

    return this.mapVendorOrder(vendorOrder);
  }

  /**
   * Calculate vendor payout
   */
  async calculatePayout(
    vendorId: string,
    options: {
      periodStart: Date;
      periodEnd: Date;
      orderIds?: string[];
    }
  ): Promise<{
    amount: number;
    orderCount: number;
    commission: number;
    shippingCost: number;
    adjustments: number;
  }> {
    const where: Record<string, unknown> = {
      vendorId,
      status: { in: ["delivered", "shipped"] },
      payoutStatus: "pending",
      createdAt: {
        gte: options.periodStart,
        lte: options.periodEnd,
      },
    };

    if (options.orderIds?.length) {
      where.orderId = { in: options.orderIds };
    }

    const orders = await prisma.vendorOrder.findMany({ where });

    let totalPayout = 0;
    let totalCommission = 0;
    let totalShipping = 0;

    for (const order of orders) {
      totalPayout += order.payout;
      totalCommission += order.commission;
      totalShipping += order.shippingCost;
    }

    // Calculate adjustments (refunds, etc)
    const adjustments = await this.calculateAdjustments(vendorId, options.periodStart, options.periodEnd);

    return {
      amount: totalPayout - adjustments,
      orderCount: orders.length,
      commission: totalCommission,
      shippingCost: totalShipping,
      adjustments,
    };
  }

  /**
   * Create payout batch
   */
  async createPayout(
    vendorId: string,
    data: {
      periodStart: Date;
      periodEnd: Date;
      orderIds?: string[];
      paymentMethod: VendorPayout["paymentMethod"];
    }
  ): Promise<VendorPayout> {
    const calculation = await this.calculatePayout(vendorId, {
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      orderIds: data.orderIds,
    });

    const payout = await prisma.vendorPayout.create({
      data: {
        vendorId,
        amount: calculation.amount,
        orderIds: data.orderIds || [],
        status: "pending",
        paymentMethod: data.paymentMethod,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        notes: `Commission: ₦${calculation.commission / 100}, Shipping: ₦${calculation.shippingCost / 100}, Adjustments: ₦${calculation.adjustments / 100}`,
      },
    });

    // Update orders to scheduled
    const where: Record<string, unknown> = {
      vendorId,
      payoutStatus: "pending",
      createdAt: {
        gte: data.periodStart,
        lte: data.periodEnd,
      },
    };

    if (data.orderIds?.length) {
      where.orderId = { in: data.orderIds };
    }

    await prisma.vendorOrder.updateMany({
      where,
      data: { payoutStatus: "scheduled", payoutDate: new Date() },
    });

    // Update vendor wallet
    await prisma.vendorWallet.update({
      where: { vendorId },
      data: {
        pendingPayout: { increment: calculation.amount },
      },
    });

    return this.mapPayout(payout);
  }

  /**
   * Process payout payment
   */
  async processPayoutPayment(
    payoutId: string,
    transactionId: string
  ): Promise<VendorPayout> {
    const payout = await prisma.vendorPayout.update({
      where: { id: payoutId },
      data: {
        status: "paid",
        transactionId,
        processedAt: new Date(),
      },
    });

    // Update wallet
    await prisma.vendorWallet.update({
      where: { vendorId: payout.vendorId },
      data: {
        balance: { decrement: payout.amount },
        pendingPayout: { decrement: payout.amount },
        lifetimeEarnings: { increment: payout.amount },
      },
    });

    // Update vendor orders
    await prisma.vendorOrder.updateMany({
      where: {
        vendorId: payout.vendorId,
        orderId: { in: payout.orderIds as string[] },
      },
      data: { payoutStatus: "paid" },
    });

    return this.mapPayout(payout);
  }

  /**
   * Get vendor dashboard stats
   */
  async getVendorStats(vendorId: string, period: "day" | "week" | "month" | "year" = "month"): Promise<{
    revenue: number;
    orders: number;
    products: number;
    commission: number;
    averageOrderValue: number;
    topProducts: Array<{ name: string; sales: number; revenue: number }>;
    salesChart: Array<{ date: string; revenue: number; orders: number }>;
  }> {
    const now = new Date();
    const periodStart = new Date();

    switch (period) {
      case "day":
        periodStart.setDate(now.getDate() - 1);
        break;
      case "week":
        periodStart.setDate(now.getDate() - 7);
        break;
      case "month":
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case "year":
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const [vendor, orders, products] = await Promise.all([
      prisma.vendor.findUnique({ where: { id: vendorId } }),
      prisma.vendorOrder.findMany({
        where: {
          vendorId,
          createdAt: { gte: periodStart },
          status: { in: ["confirmed", "shipped", "delivered"] },
        },
      }),
      prisma.vendorProduct.findMany({
        where: { vendorId },
        include: { product: true },
      }),
    ]);

    const revenue = orders.reduce((sum, o) => sum + o.payout, 0);
    const commission = orders.reduce((sum, o) => sum + o.commission, 0);

    // Build sales chart
    const salesByDay = new Map<string, { revenue: number; orders: number }>();
    for (const order of orders) {
      const date = order.createdAt.toISOString().split("T")[0];
      const existing = salesByDay.get(date);
      if (existing) {
        existing.revenue += order.payout;
        existing.orders += 1;
      } else {
        salesByDay.set(date, { revenue: order.payout, orders: 1 });
      }
    }

    return {
      revenue,
      orders: orders.length,
      products: products.length,
      commission,
      averageOrderValue: orders.length > 0 ? revenue / orders.length : 0,
      topProducts: [], // Would need more detailed aggregation
      salesChart: Array.from(salesByDay.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  /**
   * Get store vendors
   */
  async getStoreVendors(
    storeId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<Vendor[]> {
    const where: Record<string, unknown> = { storeId };
    if (options?.status) where.status = options.status;

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return vendors.map((v) => this.mapVendor(v));
  }

  // Private methods
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  }

  private async updateVendorStats(vendorId: string, revenue: number): Promise<void> {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return;

    const stats = vendor.stats as Record<string, number>;

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        stats: {
          ...stats,
          totalOrders: (stats.totalOrders || 0) + 1,
          totalRevenue: (stats.totalRevenue || 0) + revenue,
        },
      },
    });
  }

  private async calculateAdjustments(
    vendorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Calculate refunds, chargebacks, etc
    const refunds = await prisma.vendorRefund.findMany({
      where: {
        vendorId,
        createdAt: { gte: startDate, lte: endDate },
        status: "approved",
      },
    });

    return refunds.reduce((sum, r) => sum + r.amount, 0);
  }

  private async notifyCustomerOfShipment(
    orderId: string,
    trackingInfo: { carrier: string; trackingNumber: string; url?: string }
  ): Promise<void> {
    // Send email/push notification to customer
    console.log(`[Vendor] Notifying customer about shipment: ${orderId}`, trackingInfo);
  }

  private mapVendor(data: Record<string, unknown>): Vendor {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      userId: data.userId ? String(data.userId) : undefined,
      name: String(data.name),
      slug: String(data.slug),
      description: data.description ? String(data.description) : undefined,
      logo: data.logo ? String(data.logo) : undefined,
      banner: data.banner ? String(data.banner) : undefined,
      status: data.status as Vendor["status"],
      contactInfo: data.contactInfo as Vendor["contactInfo"],
      settings: data.settings as Vendor["settings"],
      stats: data.stats as Vendor["stats"],
      bankAccount: data.bankAccount as Vendor["bankAccount"],
      documents: (data.documents as Vendor["documents"]) || [],
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }

  private mapVendorProduct(data: Record<string, unknown>): VendorProduct {
    return {
      id: String(data.id),
      vendorId: String(data.vendorId),
      productId: String(data.productId),
      status: data.status as VendorProduct["status"],
      price: Number(data.price),
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
      inventory: Number(data.inventory),
      isFulfillmentManaged: Boolean(data.isFulfillmentManaged),
      shippingMethods: (data.shippingMethods as string[]) || [],
      createdAt: data.createdAt as Date,
    };
  }

  private mapVendorOrder(data: Record<string, unknown>): VendorOrder {
    return {
      id: String(data.id),
      vendorId: String(data.vendorId),
      orderId: String(data.orderId),
      items: data.items as VendorOrder["items"],
      subtotal: Number(data.subtotal),
      commission: Number(data.commission),
      payout: Number(data.payout),
      shippingCost: Number(data.shippingCost),
      status: data.status as VendorOrder["status"],
      fulfillmentStatus: data.fulfillmentStatus as VendorOrder["fulfillmentStatus"],
      trackingInfo: data.trackingInfo as VendorOrder["trackingInfo"],
      payoutStatus: data.payoutStatus as VendorOrder["payoutStatus"],
      payoutDate: data.payoutDate as Date,
      createdAt: data.createdAt as Date,
    };
  }

  private mapPayout(data: Record<string, unknown>): VendorPayout {
    return {
      id: String(data.id),
      vendorId: String(data.vendorId),
      amount: Number(data.amount),
      orderIds: (data.orderIds as string[]) || [],
      status: data.status as VendorPayout["status"],
      paymentMethod: data.paymentMethod as VendorPayout["paymentMethod"],
      transactionId: data.transactionId ? String(data.transactionId) : undefined,
      processedAt: data.processedAt as Date,
      periodStart: data.periodStart as Date,
      periodEnd: data.periodEnd as Date,
      notes: data.notes ? String(data.notes) : undefined,
      createdAt: data.createdAt as Date,
    };
  }
}

// Export singleton instance
export const multiVendorService = new MultiVendorService();
