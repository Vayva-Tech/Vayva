import { prisma, Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_AUTOPILOT_MODEL = process.env.AUTOPILOT_OPENROUTER_MODEL || 'google/gemini-2.5-flash';
const RULE_CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.AUTOPILOT_RULE_CONCURRENCY || 4) || 4));

interface AutopilotRuleDefinition {
  slug: string;
  title: string;
  category: string;
  triggerCondition: string;
  promptTemplate: string;
}

interface BusinessSnapshot {
  storeName: string;
  industrySlug: string;
  industryName: string;
  storeTone: string;
  externalIndustryBrief: string;
  deadStockCount: number;
  deadStockList: string;
  lowStockCount: number;
  lowStockList: string;
  overstockCount: number;
  overstockList: string;
  slowMoverCount: number;
  slowMoverList: string;
  flashSaleCandidateCount: number;
  flashSaleCandidates: string;
  weakDescriptionCount: number;
  weakDescriptionList: string;
  hasTopSellingProducts: boolean;
  topSellingList: string;
  abandonedCartCount: number;
  abandonedProducts: string;
  poorSeoTitleCount: number;
  poorSeoTitleList: string;
  dormantCustomerCount: number;
  recentBuyersWithoutReview: number;
  vipCustomerCount: number;
  vipCustomerList: string;
  lapsedDonorCount: number;
  lowCompletionLearnerCount: number;
  recentTestDriveCount: number;
  testDriveList: string;
  avgPrepTimeMinutes: number;
  prepTimeBreakdown: string;
  kitchenBacklog: number;
  noShowCount: number;
  emptySlotCount: number;
  emptySlotDetails: string;
  bookingUtilization: number;
  peakSlotDetails: string;
  lowTicketSalesEventCount: number;
  lowTicketEvents: string;
  overdueInvoiceCount: number;
  overdueInvoiceList: string;
  pendingQuoteCount: number;
  pendingQuoteList: string;
  openDisputeCount: number;
  disputeList: string;
  tableUtilizationBelow60: boolean;
  utilizationDetails: string;
  campaignsEndingSoonCount: number;
  campaignsEndingSoon: string;
  staleListingCount: number;
  staleListings: string;
  lowOccupancyPeriodCount: number;
  lowOccupancyPeriods: string;
  daysSinceLastPost: number;
  trendingTopics: string;
  daysSincePortfolioUpdate: number;
  recentProjects: string;
  hasRevenueData: boolean;
  revenueData: string;
  hasExpenseAnomaly: boolean;
  anomalyDetails: string;
  [key: string]: string | number | boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const i = nextIndex;
      nextIndex += 1;
      if (i >= items.length) return;
      results[i] = await mapper(items[i], i);
    }
  }

  const n = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

function evaluateCondition(condition: string, snapshot: BusinessSnapshot): boolean {
  try {
    const gtMatch = condition.match(/^(\w+)\s*>\s*(\d+)$/);
    if (gtMatch) {
      const val = Number(snapshot[gtMatch[1]] ?? 0);
      return val > Number(gtMatch[2]);
    }
    const boolMatch = condition.match(/^(\w+)$/);
    if (boolMatch) {
      return Boolean(snapshot[boolMatch[1]]);
    }
    return false;
  } catch {
    return false;
  }
}

function hydratePrompt(template: string, snapshot: BusinessSnapshot): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = snapshot[key];
    if (val === undefined || val === null) return '[N/A]';
    return String(val);
  });
}

function augmentPromptWithExternalContext(prompt: string, externalBrief: string): string {
  const trimmed = externalBrief.trim();
  if (!trimmed) return prompt;
  return `${prompt}\n\n--- External industry context (from integrations) ---\n${trimmed}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AutopilotService {
  constructor(private readonly db = prisma) {}

  async evaluateAutopilot(storeId: string): Promise<{
    rulesEvaluated: number;
    runsCreated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let runsCreated = 0;

    try {
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: { id: true, name: true, industrySlug: true, settings: true },
      });

      if (!store || !store.industrySlug) {
        return { rulesEvaluated: 0, runsCreated: 0, errors: ['Store not found or no industry set'] };
      }

      const industrySlug = store.industrySlug;
      const rules = this.getRulesForIndustry(industrySlug);

      if (rules.length === 0) {
        return { rulesEvaluated: 0, runsCreated: 0, errors: [] };
      }

      const snapshot = await this.gatherBusinessSnapshot(storeId, store.name, industrySlug, store.settings);

      const recentRuns = await this.db.autopilotRun.findMany({
        where: {
          storeId,
          status: 'PROPOSED',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        select: { ruleSlug: true },
      });
      const recentSlugs = new Set(recentRuns.map((r) => r.ruleSlug));

      const triggeredRules: AutopilotRuleDefinition[] = [];
      for (const rule of rules) {
        if (recentSlugs.has(rule.slug)) continue;
        if (evaluateCondition(rule.triggerCondition, snapshot)) {
          triggeredRules.push(rule);
        }
      }

      const results = await mapWithConcurrency(triggeredRules, RULE_CONCURRENCY, async (rule) => {
        try {
          const prompt = hydratePrompt(rule.promptTemplate, snapshot);
          const userContent = augmentPromptWithExternalContext(prompt, snapshot.externalIndustryBrief);
          const aiResponse = await this.callOpenRouterAutopilot(userContent, storeId);

          if (!aiResponse) {
            return { ok: false as const, slug: rule.slug, err: 'LLM call failed' };
          }

          const run = await this.db.autopilotRun.create({
            data: {
              storeId,
              ruleSlug: rule.slug,
              category: rule.category,
              status: 'PROPOSED',
              title: rule.title,
              summary: aiResponse,
              reasoning: `Triggered by: ${rule.triggerCondition}`,
              input: snapshot as unknown as Prisma.InputJsonValue,
            },
          });

          return { ok: true as const, slug: rule.slug };
        } catch (ruleError: unknown) {
          const ruleErrorMessage = ruleError instanceof Error ? ruleError.message : String(ruleError);
          return { ok: false as const, slug: rule.slug, err: ruleErrorMessage };
        }
      });

      for (const r of results) {
        if (r.ok) runsCreated += 1;
        else errors.push(`Rule ${r.slug}: ${r.err}`);
      }

      return { rulesEvaluated: rules.length, runsCreated, errors };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error('[Autopilot] Evaluation failed', { error: errMsg, storeId });
      return { rulesEvaluated: 0, runsCreated: 0, errors: [errMsg] };
    }
  }

  private getRulesForIndustry(industrySlug: string): AutopilotRuleDefinition[] {
    const defaultRules: AutopilotRuleDefinition[] = [
      {
        slug: 'low_stock_alert',
        title: 'Low Stock Alert',
        category: 'INVENTORY',
        triggerCondition: 'lowStockCount > 0',
        promptTemplate: 'The store has {{lowStockCount}} products running low on stock. List: {{lowStockList}}. Recommend a restocking strategy.',
      },
      {
        slug: 'abandoned_cart_recovery',
        title: 'Abandoned Cart Recovery',
        category: 'MARKETING',
        triggerCondition: 'abandonedCartCount > 0',
        promptTemplate: 'There are {{abandonedCartCount}} abandoned carts. Products: {{abandonedProducts}}. Suggest recovery campaigns.',
      },
      {
        slug: 'dormant_customer_reengagement',
        title: 'Dormant Customer Re-engagement',
        category: 'MARKETING',
        triggerCondition: 'dormantCustomerCount > 0',
        promptTemplate: '{{dormantCustomerCount}} customers haven\'t purchased in 60+ days. Recommend re-engagement strategies.',
      },
    ];

    return defaultRules;
  }

  private async gatherBusinessSnapshot(
    storeId: string,
    storeName: string,
    industrySlug: string,
    settings: unknown,
  ): Promise<BusinessSnapshot> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const storeSettings = isRecord(settings) ? settings : {};
    const aiAgent = isRecord(storeSettings.aiAgent) ? storeSettings.aiAgent : {};
    const storeTone = typeof aiAgent.tone === 'string' ? aiAgent.tone : 'professional';

    const autopilotCfg = isRecord(storeSettings.autopilot) ? storeSettings.autopilot : {};
    const externalIndustryBrief = typeof autopilotCfg.externalBrief === 'string'
      ? autopilotCfg.externalBrief.slice(0, 8000)
      : '';

    const industryNameMap: Record<string, string> = {
      retail: 'General Retail',
      fashion: 'Fashion & Apparel',
      electronics: 'Electronics',
      beauty: 'Beauty & Cosmetics',
      grocery: 'Grocery',
      food: 'Food & Restaurant',
      services: 'Services & Bookings',
      digital: 'Digital Products',
      events: 'Events & Ticketing',
      b2b: 'B2B & Wholesale',
      real_estate: 'Real Estate',
      automotive: 'Automotive',
      travel_hospitality: 'Travel & Hospitality',
      blog_media: 'Blog & Media',
      creative_portfolio: 'Creative Portfolio',
      nonprofit: 'Nonprofit',
      education: 'Education',
      marketplace: 'Marketplace',
      one_product: 'One Product Store',
      nightlife: 'Nightlife',
    };

    const [products, recentOrders, allOrders30d, dormantCheck, bookingsToday, blogPosts, vipCustomers, disputedOrders, abandonedCarts, overdueInvoices, endingFlashSales, portfolioProjects] = await Promise.all([
      this.db.product.findMany({
        where: { storeId, status: 'ACTIVE' },
        select: { id: true, title: true, price: true, createdAt: true, description: true, seoTitle: true },
        take: 200,
      }),
      this.db.order.findMany({
        where: { storeId, createdAt: { gte: sevenDaysAgo } },
        select: { id: true, total: true, createdAt: true, status: true },
      }),
      this.db.order.findMany({
        where: { storeId, createdAt: { gte: thirtyDaysAgo } },
        select: { id: true, total: true, status: true, createdAt: true },
        take: 1000,
      }),
      this.db.customer.count({ where: { storeId, createdAt: { lt: sixtyDaysAgo } } }).catch(() => 0),
      this.db.booking.findMany({
        where: { storeId, startsAt: { gte: todayStart } },
        select: { id: true, status: true, startsAt: true },
      }).catch(() => []),
      this.db.blogPost.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, createdAt: true, status: true },
      }).catch(() => []),
      this.db.customer.count({
        where: {
          storeId,
          orders: { some: { createdAt: { gte: thirtyDaysAgo }, total: { gte: 50000 } } },
        },
      }).catch(() => 0),
      this.db.order.count({ where: { storeId, status: 'DISPUTED' } }).catch(() => 0),
      this.db.cart.findMany({
        where: { updatedAt: { lt: oneHourAgo, gte: thirtyDaysAgo } },
        select: { id: true, items: { take: 6, select: { quantity: true, variant: { select: { title: true, product: { select: { title: true } } } } } } },
        take: 40,
      }).catch(() => []),
      this.db.invoiceV2.findMany({
        where: { storeId, status: { in: ['SENT', 'OVERDUE'] }, dueDate: { lt: now } },
        select: { id: true, invoiceNumber: true, totalKobo: true, dueDate: true },
        take: 15,
      }).catch(() => []),
      this.db.flashSale.findMany({
        where: { storeId, isActive: true, endTime: { lte: new Date(now.getTime() + 48 * 60 * 60 * 1000), gte: now } },
        select: { id: true, name: true, endTime: true, discount: true },
        take: 10,
      }).catch(() => []),
      this.db.portfolioProject.findMany({
        where: { storeId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, updatedAt: true },
      }).catch(() => []),
    ]);

    const orderItemsByProduct = await this.db.orderItem
      .groupBy({
        by: ['productId'],
        where: { order: { storeId, createdAt: { gte: thirtyDaysAgo } } },
        _sum: { quantity: true },
        _count: true,
      })
      .catch(() => []);

    const soldProductIds = new Set(orderItemsByProduct.map((oi) => oi.productId));
    const deadStock = products.filter((p) => !soldProductIds.has(p.id));
    const deadStockList = deadStock.slice(0, 10).map((p) => `- ${p.title} (₦${Number(p.price || 0).toLocaleString()})`).join('\n');

    const lowStockProducts = orderItemsByProduct.filter((oi) => (oi._sum?.quantity || 0) > 5 && (oi._sum?.quantity || 0) < 10).slice(0, 10);
    const lowStockList = lowStockProducts.length === 0
      ? 'None'
      : lowStockProducts.map((oi) => {
          const prod = products.find((p) => p.id === oi.productId);
          return `- ${prod?.title || 'Unknown'}: ~${oi._sum?.quantity ?? 0} units sold (30d)`;
        }).join('\n');

    const topSelling = orderItemsByProduct.sort((a, b) => (b._sum?.quantity || 0) - (a._sum?.quantity || 0)).slice(0, 5);
    const topSellingList = topSelling.map((oi) => {
      const prod = products.find((p) => p.id === oi.productId);
      return `- ${prod?.title || 'Unknown'}: ${oi._sum?.quantity || 0} sold`;
    }).join('\n');

    const totalRevenue30d = allOrders30d.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalRevenue7d = recentOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    const lastPost = blogPosts[0];
    const daysSinceLastPost = lastPost ? Math.floor((now.getTime() - new Date(lastPost.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 999;

    const noShows = bookingsToday.filter((b) => b.status === 'NO_SHOW' || b.status === 'CANCELLED');
    const confirmedBookings = bookingsToday.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
    const bookingUtilization = bookingsToday.length > 0 ? Math.round((confirmedBookings.length / bookingsToday.length) * 100) : 0;

    const weakDescProducts = products.filter((p) => !p.description || String(p.description).length < 20 || !p.seoTitle || String(p.seoTitle).length < 3);

    const abandonedCartCount = abandonedCarts.length;
    const abandonedProducts = abandonedCarts.flatMap((c) => c.items.map((it) => `- ${(it.variant?.product?.title || it.variant?.title || 'Product')} (qty ${it.quantity})`)).slice(0, 12).join('\n');

    const overdueInvoiceCount = overdueInvoices.length;
    const overdueInvoiceList = overdueInvoices.length > 0
      ? overdueInvoices.map((inv) => `- #${inv.invoiceNumber}: ₦${(Number(inv.totalKobo) / 100).toLocaleString()} (due ${inv.dueDate?.toLocaleDateString() ?? 'N/A'})`).join('\n')
      : 'None';

    const flashSaleCandidateCount = endingFlashSales.length;
    const flashSaleCandidates = endingFlashSales.length > 0
      ? endingFlashSales.map((fs) => `- ${fs.name}: ${fs.discount}% off (ends ${fs.endTime.toLocaleString()})`).join('\n')
      : 'None';

    const lastPortfolio = portfolioProjects[0];
    const daysSincePortfolioUpdate = lastPortfolio ? Math.floor((now.getTime() - lastPortfolio.updatedAt.getTime()) / (1000 * 60 * 60 * 24)) : daysSinceLastPost;
    const recentProjects = portfolioProjects.length > 0 ? portfolioProjects.map((p) => `- ${p.title || 'Project'}`).join('\n') : 'N/A';

    return {
      storeName,
      industrySlug,
      industryName: industryNameMap[industrySlug] || industrySlug,
      storeTone,
      externalIndustryBrief: externalIndustryBrief || 'No external industry briefing loaded.',
      deadStockCount: deadStock.length,
      deadStockList: deadStockList || 'None',
      lowStockCount: lowStockProducts.length,
      lowStockList,
      overstockCount: deadStock.length,
      overstockList: deadStockList || 'None',
      slowMoverCount: deadStock.length,
      slowMoverList: deadStockList || 'None',
      flashSaleCandidateCount,
      flashSaleCandidates,
      weakDescriptionCount: weakDescProducts.length,
      weakDescriptionList: weakDescProducts.slice(0, 5).map((p) => `- ${p.title || '[No title]'}`).join('\n'),
      hasTopSellingProducts: topSelling.length > 0,
      topSellingList: topSellingList || 'No sales data',
      abandonedCartCount,
      abandonedProducts: abandonedProducts || 'None',
      poorSeoTitleCount: weakDescProducts.filter((p) => !p.seoTitle).length,
      poorSeoTitleList: weakDescProducts.filter((p) => !p.seoTitle).slice(0, 5).map((p) => `- ${p.title || '[No title]'}`).join('\n'),
      dormantCustomerCount: dormantCheck,
      recentBuyersWithoutReview: 0,
      vipCustomerCount: vipCustomers,
      vipCustomerList: vipCustomers > 0 ? `${vipCustomers} high-value customers` : 'No VIP customers found',
      lapsedDonorCount: dormantCheck,
      lowCompletionLearnerCount: 0,
      recentTestDriveCount: 0,
      testDriveList: 'N/A',
      avgPrepTimeMinutes: 0,
      prepTimeBreakdown: 'N/A',
      kitchenBacklog: 0,
      noShowCount: noShows.length,
      emptySlotCount: Math.max(0, bookingsToday.length - confirmedBookings.length),
      emptySlotDetails: bookingsToday.length > 0 && bookingUtilization < 50 ? `${bookingUtilization}% utilization today` : 'N/A',
      bookingUtilization,
      peakSlotDetails: confirmedBookings.length > 0 ? `${confirmedBookings.length} confirmed bookings today` : 'No confirmed bookings today',
      lowTicketSalesEventCount: 0,
      lowTicketEvents: 'N/A',
      overdueInvoiceCount,
      overdueInvoiceList,
      pendingQuoteCount: 0,
      pendingQuoteList: 'N/A',
      openDisputeCount: disputedOrders,
      disputeList: disputedOrders > 0 ? `${disputedOrders} order(s) in DISPUTED status` : 'No active disputes',
      tableUtilizationBelow60: bookingsToday.length > 0 && bookingUtilization < 60,
      utilizationDetails: `${bookingUtilization}% booking utilization`,
      campaignsEndingSoonCount: 0,
      campaignsEndingSoon: 'N/A',
      staleListingCount: deadStock.length,
      staleListings: deadStockList || 'None',
      lowOccupancyPeriodCount: bookingsToday.length === 0 ? 1 : 0,
      lowOccupancyPeriods: bookingsToday.length === 0 ? 'No bookings scheduled today' : 'N/A',
      daysSinceLastPost,
      trendingTopics: topSellingList || 'N/A',
      daysSincePortfolioUpdate,
      recentProjects,
      hasRevenueData: totalRevenue30d > 0,
      revenueData: `Last 30 days: ₦${totalRevenue30d.toLocaleString()} | Last 7 days: ₦${totalRevenue7d.toLocaleString()} | Orders: ${allOrders30d.length}`,
      hasExpenseAnomaly: false,
      anomalyDetails: 'N/A',
    };
  }

  private async callOpenRouterAutopilot(userPrompt: string, storeId: string): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.warn('[Autopilot] OPENROUTER_API_KEY not configured');
      return null;
    }

    const model = DEFAULT_AUTOPILOT_MODEL;
    const maxAttempts = Math.min(6, Math.max(1, Number(process.env.AUTOPILOT_OPENROUTER_MAX_RETRIES || 4) || 4));

    const payload = JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: 'You are Vayva Autopilot, an AI business advisor. Provide concise, actionable recommendations. Use numbered lists. Be specific with numbers and percentages. Keep responses under 500 words.',
        },
        { role: 'user', content: userPrompt },
      ],
    });

    let lastStatus = 0;
    let lastDetail = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://vayva.tech',
            'X-Title': 'Vayva Autopilot',
          },
          body: payload,
          signal: AbortSignal.timeout(25000),
        });

        lastStatus = response.status;

        if (response.status === 429 || response.status === 502 || response.status === 503) {
          lastDetail = await response.text().catch(() => '');
          const retryAfter = response.headers.get('retry-after');
          const retrySec = retryAfter ? Number(retryAfter) : NaN;
          const waitMs = Number.isFinite(retrySec) && retrySec > 0 ? Math.min(30000, Math.max(500, retrySec * 1000)) : Math.min(20000, 400 * 2 ** (attempt - 1));
          logger.warn('[Autopilot] OpenRouter retryable response', { status: response.status, storeId, attempt, waitMs });
          if (attempt < maxAttempts) await sleep(waitMs);
          continue;
        }

        if (!response.ok) {
          lastDetail = await response.text().catch(() => '');
          logger.error('[Autopilot] OpenRouter API error', { status: response.status, storeId, detail: lastDetail.slice(0, 500) });
          return null;
        }

        const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data?.choices?.[0]?.message?.content;
        return typeof content === 'string' ? content : null;
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.warn('[Autopilot] OpenRouter attempt failed', { error: errMsg, storeId, attempt });
        if (attempt < maxAttempts) await sleep(Math.min(15000, 400 * 2 ** (attempt - 1)));
        else {
          logger.error('[Autopilot] OpenRouter call failed', { error: errMsg, storeId, lastStatus });
          return null;
        }
      }
    }

    logger.error('[Autopilot] OpenRouter exhausted retries', { storeId, lastStatus, detail: lastDetail.slice(0, 200) });
    return null;
  }
}
