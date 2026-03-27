import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class DomainsService {
  constructor(private readonly db = prisma) {}

  async getDomains(storeId: string) {
    const domains = await this.db.domain.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return domains;
  }

  async createDomain(storeId: string, domainData: any) {
    const { domainName, customDomain, type } = domainData;

    const domain = await this.db.domain.create({
      data: {
        id: `dom-${Date.now()}`,
        storeId,
        domainName,
        customDomain: customDomain || null,
        type: type || 'default',
        status: 'pending_verification',
        verificationToken: `verify_${Math.random().toString(36).substr(2, 32)}`,
      },
    });

    logger.info(`[Domains] Created domain ${domain.id}`);
    return domain;
  }

  async verifyDomain(domainId: string, storeId: string) {
    const domain = await this.db.domain.findFirst({
      where: { id: domainId },
    });

    if (!domain || domain.storeId !== storeId) {
      throw new Error('Domain not found');
    }

    const verified = await this.db.domain.update({
      where: { id: domainId },
      data: {
        status: 'verified',
        verifiedAt: new Date(),
      },
    });

    logger.info(`[Domains] Verified domain ${domainId}`);
    return verified;
  }

  async deleteDomain(domainId: string, storeId: string) {
    const domain = await this.db.domain.findFirst({
      where: { id: domainId },
    });

    if (!domain || domain.storeId !== storeId) {
      throw new Error('Domain not found');
    }

    await this.db.domain.delete({
      where: { id: domainId },
    });

    logger.info(`[Domains] Deleted domain ${domainId}`);
    return { success: true };
  }
}
