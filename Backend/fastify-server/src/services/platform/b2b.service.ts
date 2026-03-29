import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class B2BService {
  constructor(private readonly db = prisma) {}

  async getCreditApplications(storeId: string) {
    const applications = await this.db.b2bCreditApplication.findMany({
      where: { storeId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            industrySlug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      storeId: app.storeId,
      storeName: app.store.name,
      industry: app.store.industrySlug,
      requestedAmount: Number(app.requestedAmount),
      status: app.status,
      purpose: app.purpose,
      businessName: app.businessName,
      rcNumber: app.rcNumber,
      tin: app.tin,
      monthlyRevenue: app.monthlyRevenue ? Number(app.monthlyRevenue) : null,
      submittedAt: app.createdAt,
      reviewedAt: app.reviewedAt,
      approvedAt: app.approvedAt,
    }));
  }

  async getRFQs(storeId: string) {
    const rfqs = await this.db.b2bRfq.findMany({
      where: { buyerStoreId: storeId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        responses: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rfqs.map((rfq) => ({
      id: rfq.id,
      title: rfq.title,
      description: rfq.description,
      quantity: rfq.quantity,
      deadline: rfq.deadline,
      status: rfq.status,
      items: rfq.items.map((item) => ({
        id: item.id,
        productName: item.product?.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
      })),
      responses: rfq.responses.map((response) => ({
        id: response.id,
        vendorName: response.vendor?.name,
        price: response.price ? Number(response.price) : null,
        message: response.message,
        status: response.status,
      })),
      createdAt: rfq.createdAt,
    }));
  }
}
