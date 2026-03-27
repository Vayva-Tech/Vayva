import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class LeadService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string, filters?: any) {
    const where: any = { storeId };

    if (filters?.status) {
      where.tags = { has: `status:${filters.status}` };
    }

    if (filters?.source) {
      where.tags = { 
        has: filters.source ? `source:${filters.source}` : undefined 
      };
    }

    const leads = await this.db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return leads.map((l) => ({
      id: l.id,
      name: `${l.firstName} ${l.lastName}`.trim(),
      email: l.email,
      phone: l.phone,
      notes: l.notes,
      tags: l.tags,
      status: l.tags?.find((t: string) => t.startsWith('status:'))?.replace('status:', '') || 'new',
      source: l.tags?.find((t: string) => t.startsWith('source:'))?.replace('source:', '') || 'direct',
      createdAt: l.createdAt,
    }));
  }

  async create(storeId: string, userId: string, data: any) {
    const { firstName, lastName, email, phone, notes, source, interestedIn } = data;

    if (!firstName && !email && !phone) {
      throw new Error('At least name, email, or phone is required');
    }

    const tags: string[] = ['status:new'];
    if (source) tags.push(`source:${source}`);
    if (interestedIn) tags.push(`interest:${interestedIn}`);

    const lead = await this.db.customer.create({
      data: {
        storeId,
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        tags,
      },
    });

    logger.info(`[Lead] Created ${lead.id} for store ${storeId}`);
    return { lead };
  }
}
