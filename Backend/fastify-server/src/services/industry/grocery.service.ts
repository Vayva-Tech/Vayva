import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class GroceryService {
  constructor(private readonly db = prisma) {}

  async getSuppliers(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.category) where.categories = { has: filters.category };
    if (filters.minRating) where.rating = { gte: filters.minRating };
    if (filters.maxRating) where.rating = { lte: filters.maxRating };
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { contactEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      this.db.supplier.findMany({
        where,
        include: {
          products: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.supplier.count({ where }),
    ]);

    return {
      suppliers,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async createSupplier(storeId: string, supplierData: any) {
    const {
      name,
      contactName,
      contactEmail,
      contactPhone,
      address,
      website,
      paymentTerms,
      minimumOrder,
      deliveryDays,
      categories,
      certifications,
      notes,
    } = supplierData;

    const supplier = await this.db.supplier.create({
      data: {
        id: `sup-${Date.now()}`,
        storeId,
        name,
        contactName,
        contactEmail,
        contactPhone,
        address,
        website: website || null,
        paymentTerms,
        minimumOrder,
        deliveryDays,
        categories: categories || [],
        certifications: certifications || [],
        rating: 0,
        status: 'active',
        notes: notes || null,
      },
    });

    logger.info(`[Grocery] Created supplier ${supplier.id}`);
    return supplier;
  }

  async getSupplierById(supplierId: string, storeId: string) {
    return await this.db.supplier.findFirst({
      where: { id: supplierId, storeId },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateSupplier(supplierId: string, storeId: string, updates: any) {
    const supplier = await this.db.supplier.findFirst({
      where: { id: supplierId, storeId },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    const updated = await this.db.supplier.update({
      where: { id: supplierId },
      data: updates,
    });

    logger.info(`[Grocery] Updated supplier ${supplierId}`);
    return updated;
  }

  async deleteSupplier(supplierId: string, storeId: string) {
    const supplier = await this.db.supplier.findFirst({
      where: { id: supplierId, storeId },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    await this.db.supplier.delete({
      where: { id: supplierId },
    });

    logger.info(`[Grocery] Deleted supplier ${supplierId}`);
    return { success: true };
  }

  async getSupplierProducts(supplierId: string, storeId: string) {
    const products = await this.db.product.findMany({
      where: {
        supplierId,
        storeId,
      },
      include: {
        variants: true,
      },
      orderBy: { name: 'asc' },
    });

    return products;
  }

  async getDepartments(storeId: string) {
    const departments = await this.db.department.findMany({
      where: { storeId, active: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return departments;
  }

  async createDepartment(storeId: string, departmentData: any) {
    const { name, description, manager } = departmentData;

    const department = await this.db.department.create({
      data: {
        id: `dept-${Date.now()}`,
        storeId,
        name,
        description: description || null,
        manager: manager || null,
        active: true,
      },
    });

    logger.info(`[Grocery] Created department ${department.id}`);
    return department;
  }

  async getDashboardStats(storeId: string) {
    const [
      totalSuppliers,
      activeSuppliers,
      totalProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
    ] = await Promise.all([
      this.db.supplier.count({ where: { storeId } }),
      this.db.supplier.count({ where: { storeId, status: 'active' } }),
      this.db.product.count({ where: { storeId } }),
      this.db.productVariant.count({
        where: {
          product: { storeId },
          quantity: { lte: 10 },
        },
      }),
      this.db.order.count({ where: { storeId } }),
      this.db.order.count({ where: { storeId, status: 'PENDING' } }),
    ]);

    return {
      suppliers: {
        total: totalSuppliers,
        active: activeSuppliers,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
    };
  }
}
