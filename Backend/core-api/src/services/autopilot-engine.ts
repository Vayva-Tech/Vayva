import { prisma, Prisma } from "@vayva/db";
import { logger, urls } from "@vayva/shared";
import { getRulesForIndustry } from "@/config/autopilot-rules";
import type { IndustrySlug } from "@/lib/templates/types";

// ---------------------------------------------------------------------------
// Autopilot Engine
//
// Evaluates industry-specific rules against live business data, calls Groq
// for AI-generated recommendations, and creates AutopilotRun records with
// status PROPOSED for merchant review.
//
// Designed to be called daily via cron or manually via API.
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface BusinessSnapshot {
  storeName: string;
  industrySlug: IndustrySlug;
  industryName: string;
  storeTone: string;
  // Inventory
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
  // Marketing
  weakDescriptionCount: number;
  weakDescriptionList: string;
  hasTopSellingProducts: boolean;
  topSellingList: string;
  abandonedCartCount: number;
  abandonedProducts: string;
  poorSeoTitleCount: number;
  poorSeoTitleList: string;
  // Engagement
  dormantCustomerCount: number;
  recentBuyersWithoutReview: number;
  vipCustomerCount: number;
  vipCustomerList: string;
  lapsedDonorCount: number;
  lowCompletionLearnerCount: number;
  recentTestDriveCount: number;
  testDriveList: string;
  // Operations
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
  // Content
  daysSinceLastPost: number;
  trendingTopics: string;
  daysSincePortfolioUpdate: number;
  recentProjects: string;
  // Financial
  hasRevenueData: boolean;
  revenueData: string;
  hasExpenseAnomaly: boolean;
  anomalyDetails: string;
  [key: string]: string | number | boolean;
}

// ---------------------------------------------------------------------------
// Core evaluation function
// ---------------------------------------------------------------------------

export async function evaluateAutopilot(storeId: string): Promise<{
  rulesEvaluated: number;
  runsCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let runsCreated = 0;

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        industrySlug: true,
        settings: true,
      },
    });

    if (!store || !store.industrySlug) {
      return {
        rulesEvaluated: 0,
        runsCreated: 0,
        errors: ["Store not found or no industry set"],
      };
    }

    const industrySlug = store.industrySlug as IndustrySlug;
    const rules = getRulesForIndustry(industrySlug);

    if (rules.length === 0) {
      return { rulesEvaluated: 0, runsCreated: 0, errors: [] };
    }

    // Gather business snapshot
    const snapshot = await gatherBusinessSnapshot(
      storeId,
      store.name,
      industrySlug,
      store.settings,
    );

    // Check which rules already have a recent PROPOSED run (avoid duplicates)
    const recentRuns = await prisma.autopilotRun.findMany({
      where: {
        storeId,
        status: "PROPOSED",
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { ruleSlug: true },
    });
    const recentSlugs = new Set(recentRuns.map((r) => r.ruleSlug));

    // Evaluate each rule
    for (const rule of rules) {
      if (recentSlugs.has(rule.slug)) continue;

      try {
        const triggered = evaluateCondition(rule.triggerCondition, snapshot);
        if (!triggered) continue;

        const prompt = hydratePrompt(rule.promptTemplate, snapshot);
        const aiResponse = await callGroq(prompt, storeId);

        if (!aiResponse) {
          errors.push(`Groq call failed for rule: ${rule.slug}`);
          continue;
        }

        await prisma.autopilotRun.create({
          data: {
            storeId,
            ruleSlug: rule.slug,
            category: rule.category,
            status: "PROPOSED",
            title: rule.title,
            summary: aiResponse,
            reasoning: `Triggered by: ${rule.triggerCondition}`,
            input: snapshot as unknown as Prisma.InputJsonValue,
          },
        });

        runsCreated++;
      } catch (ruleError: unknown) {
        const ruleErrorMessage =
          ruleError instanceof Error ? ruleError.message : String(ruleError);
        errors.push(`Rule ${rule.slug}: ${ruleErrorMessage}`);
      }
    }

    return { rulesEvaluated: rules.length, runsCreated, errors };
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[AutopilotEngine] Evaluation failed", {
      error: _errMsg,
      storeId,
    });
    return { rulesEvaluated: 0, runsCreated: 0, errors: [_errMsg] };
  }
}

// ---------------------------------------------------------------------------
// Condition evaluator — simple expression parser
// ---------------------------------------------------------------------------

function evaluateCondition(
  condition: string,
  snapshot: BusinessSnapshot,
): boolean {
  try {
    // Handle simple comparisons: "field > value", "field === true", etc.
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

// ---------------------------------------------------------------------------
// Prompt hydration — replace {{placeholders}} with snapshot values
// ---------------------------------------------------------------------------

function hydratePrompt(template: string, snapshot: BusinessSnapshot): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = snapshot[key];
    if (val === undefined || val === null) return "[N/A]";
    return String(val);
  });
}

// ---------------------------------------------------------------------------
// Groq LLM call
// ---------------------------------------------------------------------------

async function callGroq(
  prompt: string,
  storeId: string,
): Promise<string | null> {
  try {
    const apiKey =
      process.env.GROQ_API_KEY_SUPPORT || process.env.GROQ_API_KEY_MERCHANT;
    if (!apiKey) {
      logger.warn("[AutopilotEngine] No Groq API key configured");
      return null;
    }

    const response = await fetch(`${urls.groqBase()}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        temperature: 0.4,
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content:
              "You are Vayva Autopilot, an AI business advisor. Provide concise, actionable recommendations. Use numbered lists. Be specific with numbers and percentages. Keep responses under 500 words.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      logger.error("[AutopilotEngine] Groq API error", {
        status: response.status,
        storeId,
      });
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    // Log usage
    const usage = data?.usage;
    if (usage) {
      await prisma.aiUsageEvent
        .create({
          data: {
            storeId,
            model: "llama3-70b-8192",
            inputTokens: usage.prompt_tokens || 0,
            outputTokens: usage.completion_tokens || 0,
            channel: "INAPP",
            success: true,
            requestId: `autopilot-${Date.now()}`,
          },
        })
        .catch(() => {});
    }

    return typeof content === "string" ? content : null;
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[AutopilotEngine] Groq call failed", {
      error: _errMsg,
      storeId,
    });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Business snapshot gatherer — queries live data
// ---------------------------------------------------------------------------

async function gatherBusinessSnapshot(
  storeId: string,
  storeName: string,
  industrySlug: IndustrySlug,
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
  const storeTone =
    typeof aiAgent.tone === "string" ? aiAgent.tone : "professional";

  const industryNameMap: Record<string, string> = {
    retail: "General Retail",
    fashion: "Fashion & Apparel",
    electronics: "Electronics",
    beauty: "Beauty & Cosmetics",
    grocery: "Grocery",
    food: "Food & Restaurant",
    services: "Services & Bookings",
    digital: "Digital Products",
    events: "Events & Ticketing",
    b2b: "B2B & Wholesale",
    real_estate: "Real Estate",
    automotive: "Automotive",
    travel_hospitality: "Travel & Hospitality",
    blog_media: "Blog & Media",
    creative_portfolio: "Creative Portfolio",
    nonprofit: "Nonprofit",
    education: "Education",
    marketplace: "Marketplace",
    one_product: "One Product Store",
    nightlife: "Nightlife",
  };

  // Parallel queries for efficiency
  const [
    products,
    recentOrders,
    allOrders30d,
    _customers,
    recentCustomers7d,
    dormantCheck,
    bookingsToday,
    blogPosts,
    vipCustomers,
    disputedOrders,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { storeId, status: "ACTIVE" },
      select: { id: true, title: true, price: true, createdAt: true },
      take: 200,
    }),
    prisma.order.findMany({
      where: { storeId, createdAt: { gte: sevenDaysAgo } },
      select: { id: true, total: true, createdAt: true, status: true },
    }),
    prisma.order.findMany({
      where: { storeId, createdAt: { gte: thirtyDaysAgo } },
      select: { id: true, total: true, status: true, createdAt: true },
      take: 1000,
    }),
    prisma.customer.count({ where: { storeId } }),
    prisma.customer.count({
      where: { storeId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.customer
      .count({
        where: { storeId, createdAt: { lt: sixtyDaysAgo } },
      })
      .catch(() => 0),
    prisma.booking
      .findMany({
        where: { storeId, startsAt: { gte: todayStart } },
        select: { id: true, status: true, startsAt: true },
      })
      .catch(() => []),
    prisma.blogPost
      .findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, createdAt: true, status: true },
      })
      .catch(() => []),
    // VIP customers (customers with total order value > ₦50,000 in 30 days)
    prisma.customer
      .count({
        where: {
          storeId,
          orders: {
            some: {
              createdAt: { gte: thirtyDaysAgo },
              total: { gte: 50000 },
            },
          },
        },
      })
      .catch(() => 0),
    // Disputed orders
    prisma.order
      .count({
        where: {
          storeId,
          status: "DISPUTED",
        },
      })
      .catch(() => 0),
  ]);

  // Compute order items for product-level analysis
  const orderItemsByProduct = await prisma.orderItem
    .groupBy({
      by: ["productId"],
      where: {
        order: { storeId, createdAt: { gte: thirtyDaysAgo } },
      },
      _sum: { quantity: true },
      _count: true,
    })
    .catch(() => []);

  const soldProductIds = new Set(orderItemsByProduct.map((oi) => oi.productId));

  // Dead stock: products with 0 sales in 30 days
  const deadStock = products.filter((p) => !soldProductIds.has(p.id));
  const deadStockList = deadStock
    .slice(0, 10)
    .map((p) => `- ${p.title} (₦${Number(p.price || 0).toLocaleString()})`)
    .join("\n");

  // Low stock (proxy: products created >14d ago with low order volume)
  const lowStockProducts = orderItemsByProduct
    .filter(
      (oi) => (oi._sum?.quantity || 0) > 5 && (oi._sum?.quantity || 0) < 10,
    )
    .slice(0, 10);

  // Top selling
  const topSelling = orderItemsByProduct
    .sort((a, b) => (b._sum?.quantity || 0) - (a._sum?.quantity || 0))
    .slice(0, 5);
  const topSellingList = topSelling
    .map((oi) => {
      const prod = products.find((p) => p.id === oi.productId);
      return `- ${prod?.title || "Unknown"}: ${oi._sum?.quantity || 0} sold`;
    })
    .join("\n");

  // Revenue data
  const totalRevenue30d = allOrders30d.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0,
  );
  const totalRevenue7d = recentOrders.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0,
  );

  // Blog/content freshness
  const lastPost = blogPosts[0];
  const daysSinceLastPost = lastPost
    ? Math.floor(
        (now.getTime() - new Date(lastPost.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 999;

  // Bookings analysis
  const noShows = bookingsToday.filter(
    (b) => b.status === "NO_SHOW" || b.status === "CANCELLED",
  );

  // Weak descriptions (products with short or missing titles)
  const weakDescProducts = products.filter(
    (p) => !p.title || p.title.length < 10,
  );

  return {
    storeName,
    industrySlug,
    industryName: industryNameMap[industrySlug] || industrySlug,
    storeTone,
    // Inventory
    deadStockCount: deadStock.length,
    deadStockList: deadStockList || "None",
    lowStockCount: lowStockProducts.length,
    lowStockList: "Based on sales velocity analysis",
    overstockCount: 0,
    overstockList: "N/A",
    slowMoverCount: 0,
    slowMoverList: "N/A",
    flashSaleCandidateCount: 0,
    flashSaleCandidates: "N/A",
    // Marketing
    weakDescriptionCount: weakDescProducts.length,
    weakDescriptionList: weakDescProducts
      .slice(0, 5)
      .map((p) => `- ${p.title || "[No title]"}`)
      .join("\n"),
    hasTopSellingProducts: topSelling.length > 0,
    topSellingList: topSellingList || "No sales data",
    abandonedCartCount: 0,
    abandonedProducts: "N/A",
    poorSeoTitleCount: weakDescProducts.length,
    poorSeoTitleList: weakDescProducts
      .slice(0, 5)
      .map((p) => `- ${p.title || "[No title]"}`)
      .join("\n"),
    // Engagement
    dormantCustomerCount: dormantCheck,
    recentBuyersWithoutReview: recentCustomers7d,
    vipCustomerCount: vipCustomers,
    vipCustomerList: vipCustomers > 0 ? `${vipCustomers} high-value customers` : "No VIP customers found",
    lapsedDonorCount: dormantCheck,
    lowCompletionLearnerCount: 0,
    recentTestDriveCount: 0,
    testDriveList: "N/A",
    // Operations
    avgPrepTimeMinutes: 0,
    prepTimeBreakdown: "N/A",
    kitchenBacklog: 0,
    noShowCount: noShows.length,
    emptySlotCount: 0,
    emptySlotDetails: "N/A",
    bookingUtilization: 0,
    peakSlotDetails: "N/A",
    lowTicketSalesEventCount: 0,
    lowTicketEvents: "N/A",
    overdueInvoiceCount: 0,
    overdueInvoiceList: "N/A",
    pendingQuoteCount: 0,
    pendingQuoteList: "N/A",
    openDisputeCount: disputedOrders,
    disputeList: disputedOrders > 0 ? `${disputedOrders} disputed orders require attention` : "No active disputes",
    tableUtilizationBelow60: false,
    utilizationDetails: "N/A",
    campaignsEndingSoonCount: 0,
    campaignsEndingSoon: "N/A",
    staleListingCount: 0,
    staleListings: "N/A",
    lowOccupancyPeriodCount: 0,
    lowOccupancyPeriods: "N/A",
    // Content
    daysSinceLastPost,
    trendingTopics: topSellingList || "N/A",
    daysSincePortfolioUpdate: daysSinceLastPost,
    recentProjects: "N/A",
    // Financial
    hasRevenueData: totalRevenue30d > 0,
    revenueData: `Last 30 days: ₦${totalRevenue30d.toLocaleString()} | Last 7 days: ₦${totalRevenue7d.toLocaleString()} | Orders: ${allOrders30d.length}`,
    hasExpenseAnomaly: false,
    anomalyDetails: "N/A",
  };
}
