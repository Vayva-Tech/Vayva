import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class WholesaleService {
  constructor(private readonly db = prisma) {}

  async getCustomers(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.tier) where.tier = filters.tier;
    if (filters.search) {
      where.OR = [
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { contactName: { contains: filters.search, mode: 'insensitive' } },
        { contactEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.db.wholesaleCustomer.findMany({
        where,
        include: {
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { companyName: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.wholesaleCustomer.count({ where }),
    ]);

    return { customers, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createCustomer(storeId: string, customerData: any) {
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      billingAddress,
      shippingAddress,
      creditLimit,
      paymentTerms,
      taxId,
      tier,
      notes,
    } = customerData;

    const customer = await this.db.wholesaleCustomer.create({
      data: {
        id: `wc-${Date.now()}`,
        storeId,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        billingAddress,
        shippingAddress: shippingAddress || billingAddress,
        creditLimit: creditLimit || 0,
        paymentTerms: paymentTerms || 30,
        taxId: taxId || null,
        tier: tier || 'bronze',
        status: 'active',
        notes: notes || null,
      },
    });

    logger.info(`[Wholesale] Created customer ${customer.id}`);
    return customer;
  }

  async getCustomerOrders(customerId: string, storeId: string) {
    const orders = await this.db.wholesaleOrder.findMany({
      where: { customerId, storeId },
      include: {
        items: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async getProducts(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.category) where.category = filters.category;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const [products, total] = await Promise.all([
      this.db.wholesaleProduct.findMany({
        where,
        include: {
          inventory: true,
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.wholesaleProduct.count({ where }),
    ]);

    return { products, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createProduct(storeId: string, productData: any) {
    const {
      name,
      sku,
      description,
      category,
      minOrderQuantity,
      price,
      wholesalePrice,
    } = productData;

    const product = await this.db.wholesaleProduct.create({
      data: {
        id: `wp-${Date.now()}`,
        storeId,
        name,
        sku,
        description: description || null,
        category: category || null,
        minOrderQuantity: minOrderQuantity || 1,
        price,
        wholesalePrice,
        isActive: true,
      },
    });

    logger.info(`[Wholesale] Created product ${product.id}`);
    return product;
  }

  async getProductInventory(productId: string, storeId: string) {
    const inventory = await this.db.productInventory.findFirst({
      where: { productId, storeId },
    });

    return inventory || { quantity: 0, reserved: 0, available: 0 };
  }

  async updateProductInventory(productId: string, storeId: string, updates: any) {
    const { quantity, reserved } = updates;

    const inventory = await this.db.productInventory.upsert({
      where: { productId_storeId: { productId, storeId } },
      create: {
        productId,
        storeId,
        quantity: quantity || 0,
        reserved: reserved || 0,
        available: (quantity || 0) - (reserved || 0),
      },
      update: {
        quantity: quantity !== undefined ? quantity : undefined,
        reserved: reserved !== undefined ? reserved : undefined,
        available: {
          set: (quantity !== undefined ? quantity : 0) - (reserved !== undefined ? reserved : 0),
        },
      },
    });

    logger.info(`[Wholesale] Updated inventory for product ${productId}`);
    return inventory;
  }

  async getPurchaseOrders(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.supplierId) where.supplierId = filters.supplierId;

    const [orders, total] = await Promise.all([
      this.db.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.purchaseOrder.count({ where }),
    ]);

    return { orders, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createPurchaseOrder(storeId: string, orderData: any) {
    const { supplierId, items, expectedDelivery, notes } = orderData;

    const order = await this.db.purchaseOrder.create({
      data: {
        id: `po-${Date.now()}`,
        storeId,
        supplierId,
        status: 'draft',
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalPrice: item.quantity * item.unitCost,
          })),
        },
      },
      include: { items: true, supplier: true },
    });

    logger.info(`[Wholesale] Created purchase order ${order.id}`);
    return order;
  }

  async autoGeneratePurchaseOrder(storeId: string, productId: string, reorderPoint: number) {
    const inventory = await this.db.productInventory.findFirst({
      where: { productId, storeId },
    });

    if (!inventory || inventory.quantity >= reorderPoint) {
      throw new Error('No reorder needed');
    }

    const product = await this.db.wholesaleProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const suggestedQuantity = (reorderPoint * 2) - inventory.quantity;

    return {
      productId,
      productName: product.name,
      currentStock: inventory.quantity,
      reorderPoint,
      suggestedQuantity,
      estimatedCost: suggestedQuantity * product.wholesalePrice,
    };
  }

  async getShipments(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.orderId) where.orderId = filters.orderId;

    const [shipments, total] = await Promise.all([
      this.db.wholesaleShipment.findMany({
        where,
        include: {
          order: true,
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.wholesaleShipment.count({ where }),
    ]);

    return { shipments, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createShipment(storeId: string, shipmentData: any) {
    const { orderId, trackingNumber, carrier, shippedAt } = shipmentData;

    const order = await this.db.wholesaleOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.storeId !== storeId) {
      throw new Error('Order not found');
    }

    const shipment = await this.db.wholesaleShipment.create({
      data: {
        id: `ws-${Date.now()}`,
        storeId,
        orderId,
        customerId: order.customerId,
        trackingNumber: trackingNumber || null,
        carrier: carrier || null,
        status: 'shipped',
        shippedAt: shippedAt ? new Date(shippedAt) : new Date(),
      },
      include: { order: true, customer: true },
    });

    logger.info(`[Wholesale] Created shipment ${shipment.id}`);
    return shipment;
  }

  async getWholesaleStats(storeId: string) {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      lowStockProducts,
    ] = await Promise.all([
      this.db.wholesaleCustomer.count({ where: { storeId } }),
      this.db.wholesaleCustomer.count({ where: { storeId, status: 'active' } }),
      this.db.wholesaleProduct.count({ where: { storeId } }),
      this.db.wholesaleOrder.count({ where: { storeId } }),
      this.db.wholesaleOrder.count({ where: { storeId, status: 'pending' } }),
      this.db.wholesaleOrder.aggregate({
        where: { storeId, status: 'completed' },
        _sum: { totalAmount: true },
      }),
      this.db.productInventory.count({
        where: {
          storeId,
          quantity: { lte: 10 },
        },
      }),
    ]);

    return {
      customers: { total: totalCustomers, active: activeCustomers },
      products: { total: totalProducts, lowStock: lowStockProducts },
      orders: { total: totalOrders, pending: pendingOrders },
      revenue: { total: totalRevenue._sum.totalAmount || 0 },
    };
  }
}
