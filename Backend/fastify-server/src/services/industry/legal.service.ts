import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class LegalService {
  constructor(private readonly db = prisma) {}

  async getCases(storeId: string) {
    const cases = await this.db.legalCase.findMany({
      where: { storeId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
          },
        },
        hearings: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      title: c.title,
      type: c.type,
      status: c.status,
      priority: c.priority,
      clientName: c.client
        ? `${c.client.firstName} ${c.client.lastName}`
        : null,
      clientEmail: c.client?.email,
      clientPhone: c.client?.phone,
      description: c.description,
      documents: c.documents,
      nextHearing: c.hearings[0]?.scheduledDate,
      totalBillable: Number(c.totalBillable || 0),
      createdAt: c.createdAt,
    }));
  }
}
