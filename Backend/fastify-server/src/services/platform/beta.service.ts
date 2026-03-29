import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BetaService {
  constructor(private readonly db = prisma) {}

  async getDesktopAppWaitlist(storeId: string) {
    const entries = await this.db.desktopAppWaitlist.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((e) => ({
      id: e.id,
      storeId: e.storeId,
      email: e.email,
      name: e.name,
      company: e.company,
      platform: e.platform,
      useCase: e.useCase,
      status: e.status,
      invitedAt: e.invitedAt,
      createdAt: e.createdAt,
    }));
  }
}
