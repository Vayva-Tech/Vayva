import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

const PLAN_HIERARCHY: any = {
  free: 0,
  growth: 1,
  pro: 2,
};

export class TemplateService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { plan: true, industrySlug: true },
    });

    const templates = await this.db.templateManifest.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
    });

    const storeIndustrySlug = store?.industrySlug ? String(store.industrySlug) : null;

    return templates.map((t) => {
      const requiredPlan = 'free';
      const recommended = storeIndustrySlug ? true : false;

      return {
        id: t.id,
        key: t.id,
        name: t.name,
        description: t.description,
        category: 'Storefront',
        previewImageUrl: t.previewImageUrl,
        version: t.version,
        requiredPlan,
        isLocked: false,
        industrySlugs: [],
        isRecommended: recommended,
        configSchema: t.configSchema,
        supportedPages: t.supportedPages,
      };
    });
  }
}
