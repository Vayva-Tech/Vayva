import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class MarketplaceService {
  constructor(private readonly db = prisma) {}

  async getVendors(storeId: string) {
    const vendors = await this.db.marketplaceVendor.findMany({
      where: { storeId },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return vendors.map((v) => ({
      id: v.id,
      name: v.name,
      email: v.email,
      phone: v.phone,
      businessName: v.businessName,
      rcNumber: v.rcNumber,
      tin: v.tin,
      status: v.status,
      commissionRate: v.commissionRate ? Number(v.commissionRate) : null,
      products: v.products,
      productCount: v._count.products,
      orderCount: v._count.orders,
    }));
  }
}
