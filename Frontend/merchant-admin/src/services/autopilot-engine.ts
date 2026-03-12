import { prisma, type Prisma } from "@vayva/db";
import { logger, urls } from "@vayva/shared";
import { getRulesForIndustry, type AutopilotRuleDefinition } from "@/config/autopilot-rules";
import type { IndustrySlug } from "@/lib/templates/types";

interface BusinessSnapshot {
  storeName: string;
  industrySlug: IndustrySlug;
  industryName: string;
  storeTone: string;
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

export async function evaluateAutopilot(storeId: string): Promise<{
  rulesEvaluated: number;
  runsCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let runsCreated = 0;

  try {
    const store = await prisma.store?.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, industrySlug: true, settings: true },
    });

    if (!store || !store.industrySlug) {
      return { rulesEvaluated: 0, runsCreated: 0, errors: ["Store not found or no industry set"] };
    }

    const industrySlug = store.industrySlug as IndustrySlug;
    const rules = getRulesForIndustry(industrySlug);

    if (rules.length === 0) {
      return { rulesEvaluated: 0, runsCreated: 0, errors: [] };
    }

    const snapshot = await gatherBusinessSnapshot(storeId, store.name, industrySlug, store.settings);

    const recentRuns = await prisma.autopilotRun?.findMany({
      where: {
        storeId,
        status: "PROPOSED",
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { ruleSlug: true },
    });
    const recentSlugs = new Set(recentRuns.map((r) => r.ruleSlug));

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

        await prisma.autopilotRun?.create({
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
      } catch (ruleError) {
        errors.push(`Rule ${rule.slug}: ${(ruleError as Error).message}`);
      }
    }

    return { rulesEvaluated: rules.length, runsCreated, errors };
  } catch (error) {
    logger.error("[AutopilotEngine] Evaluation failed", {
      error: (error as Error).message,
      storeId,
    });
    return { rulesEvaluated: 0, runsCreated: 0, errors: [(error as Error).message] };
  }
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
    if (val === undefined || val === null) return "[N/A]";
    return String(val);
  });
}

async function callGroq(prompt: string, storeId: string): Promise<string | null> {
  try {
    const apiKey = process.env?.GROQ_API_KEY_SUPPORT || process.env?.GROQ_API_KEY_MERCHANT;
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
            content: "You are Vayva Autopilot, an AI business advisor. Provide concise, actionable recommendations. Use numbered lists. Be specific with numbers and percentages. Keep responses under 500 words.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      logger.error("[AutopilotEngine] Groq API error", { status: (response as any).status, storeId });
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    const usage = data?.usage;
    if (usage) {
      await prisma.aiUsageEvent?.create({
        data: {
          storeId,
          model: "llama3-70b-8192",
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          channel: "INAPP",
          success: true,
          requestId: `autopilot-${Date.now()}`,
        },
      }).catch(() => {});
    }

    return typeof content === "string" ? content : null;
  } catch (error) {
    logger.error("[AutopilotEngine] Groq call failed", { error: (error as Error).message, storeId });
    return null;
  }
}

async function gatherBusinessSnapshot(
  storeId: string,
  storeName: string,
  industrySlug: IndustrySlug,
  settings: unknown
): Promise<BusinessSnapshot> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const storeSettings = (settings as Record<string, unknown>) || {};
  const storeTone = (storeSettings?.aiAgent as Record<string, string>)?.tone || "professional";

  const industryNameMap: Record<string, string> = {
    retail: "General Retail", fashion: "Fashion & Apparel", electronics: "Electronics",
    beauty: "Beauty & Cosmetics", grocery: "Grocery", food: "Food & Restaurant",
    services: "Services & Bookings", digital: "Digital Products", events: "Events & Ticketing",
    b2b: "B2B & Wholesale", real_estate: "Real Estate", automotive: "Automotive",
    travel_hospitality: "Travel & Hospitality", blog_media: "Blog & Media",
    creative_portfolio: "Creative Portfolio", nonprofit: "Nonprofit", education: "Education",
    marketplace: "Marketplace", one_product: "One Product Store", nightlife: "Nightlife",
  };

  // Parallel queries for efficiency
  const [
    products,
    recentOrders,
    allOrders30d,
    customers,
    recentCustomers7d,
    dormantCheck,
    bookingsToday,
    blogPosts,
    abandonedCarts,
    openDisputes,
    pendingQuotes,
    overdueInvoices,
    activeFlashSales,
    endingSoonCampaigns,
    portfolioProjects,
    lowVelocityProducts,
    customerReviews,
    vipCustomers,
    testDriveBookings,
    lowTicketEvents,
    kitchenBacklog,
    expenseAnomalies,
    lowCompletionLearnerCount,
  ] = await Promise.all([
    prisma.product?.findMany({
      where: { storeId, status: "ACTIVE" },
      select: { id: true, title: true, price: true, createdAt: true, description: true, seoTitle: true, tags: true },
      take: 200,
    }),
    prisma.order?.findMany({
      where: { storeId, createdAt: { gte: sevenDaysAgo } },
      select: { id: true, total: true, createdAt: true, status: true },
    }),
    prisma.order?.findMany({
      where: { storeId, createdAt: { gte: thirtyDaysAgo } },
      select: { id: true, total: true, status: true, createdAt: true },
      take: 1000,
    }),
    prisma.customer?.count({ where: { storeId } }),
    prisma.customer?.count({ where: { storeId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.customer?.count({ where: { storeId, createdAt: { lt: sixtyDaysAgo } } }).catch(() => 0),
    prisma.booking?.findMany({
      where: { storeId, startsAt: { gte: todayStart, lt: tomorrowStart } },
      select: { id: true, status: true, startsAt: true, customerId: true },
    }).catch(() => []),
    prisma.blogPost?.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true, status: true },
    }).catch(() => []),
    // Abandoned carts: carts with items, no order, older than 1 hour
    prisma.cart?.findMany({
      where: {
        updatedAt: { lt: new Date(now.getTime() - 60 * 60 * 1000), gte: thirtyDaysAgo },
        items: { some: {} },
      },
      select: { id: true, items: { select: { variantId: true, quantity: true } } },
      take: 50,
    }).catch(() => []),
    // Open disputes
    prisma.dispute?.findMany({
      where: { storeId, status: { in: ["OPENED", "UNDER_REVIEW"] as const } },
      select: { id: true, reasonCode: true, amount: true, currency: true, createdAt: true },
      take: 20,
    }).catch(() => []),
    // Pending quotes (B2B feature) - skipped if model doesn't exist
    Promise.resolve([]),
    // Overdue invoices
    prisma.invoiceV2?.findMany({
      where: {
        storeId,
        status: { in: ["SENT", "OVERDUE"] as const },
        dueDate: { lt: now },
      },
      select: { id: true, invoiceNumber: true, totalKobo: true, dueDate: true, customerId: true },
      take: 20,
    }).catch(() => []),
    // Active flash sales ending in next 48 hours
    prisma.flashSale?.findMany({
      where: {
        storeId,
        isActive: true,
        endTime: { lte: new Date(now.getTime() + 48 * 60 * 60 * 1000), gte: now },
      },
      select: { id: true, name: true, endTime: true, discount: true },
      take: 10,
    }).catch(() => []),
    // Campaigns ending soon (autopilot runs with approaching execution)
    prisma.autopilotRun?.findMany({
      where: {
        storeId,
        status: "APPROVED",
        executedAt: null,
        createdAt: { lte: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      },
      select: { id: true, title: true, ruleSlug: true, createdAt: true },
      take: 10,
    }).catch(() => []),
    // Portfolio projects (creative industry)
    prisma.portfolioProject?.findMany?.({
      where: { storeId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true },
    }).catch(() => []) || Promise.resolve([]),
    // Low velocity products (inventory with no sales in 60 days)
    prisma.product?.findMany({
      where: { 
        storeId, 
        status: "ACTIVE",
        id: { notIn: await prisma.orderItem?.findMany({
          where: { order: { storeId, createdAt: { gte: sixtyDaysAgo } } },
          select: { productId: true },
          distinct: ["productId"],
        }).then(items => (items.map(i => i.productId) as string[]).filter((id): id is string => id !== null)).catch(() => [] as string[]) },
      },
      select: { id: true, title: true },
      take: 20,
    }).catch(() => []),
    // Customer reviews (recent buyers without reviews)
    prisma.review?.count({
      where: { storeId, createdAt: { gte: sevenDaysAgo } },
    }).catch(() => 0),
    // VIP customers (top 10% by order value)
    prisma.order?.groupBy({
      by: ["customerId"],
      where: { storeId, createdAt: { gte: thirtyDaysAgo }, customerId: { not: null } },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    }).catch(() => []),
    // Test drive bookings (automotive industry)
    prisma.booking?.findMany({
      where: { 
        storeId, 
        startsAt: { gte: sevenDaysAgo },
        status: { in: ["CONFIRMED", "COMPLETED"] as const },
        serviceId: { contains: "test-drive" }
      },
      select: { id: true, startsAt: true, customer: { select: { firstName: true, lastName: true } } },
      take: 10,
    }).catch(() => []),
    // Low ticket sales events (events industry)
    prisma.product?.findMany({
      where: {
        storeId,
        status: "ACTIVE",
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          { title: { contains: "ticket", mode: "insensitive" } },
          { description: { contains: "admission", mode: "insensitive" } },
        ]
      },
      select: { id: true, title: true, metadata: true },
      take: 20,
    }).catch(() => []),
    // Kitchen backlog: orders in PROCESSING status for >30 minutes (proxy for preparing)
    prisma.order?.count({
      where: {
        storeId,
        status: "sending" as any,
        updatedAt: { lt: new Date(now.getTime() - 30 * 60 * 1000) },
      },
    }).catch(() => 0),
    // Expense anomalies placeholder (expense model may not exist)
    Promise.resolve([]),
    // Low completion learners (education industry - placeholder)
    Promise.resolve(0),
  ]);

  // Compute order items for product-level analysis
  const orderItemsByProduct = await prisma.orderItem?.groupBy({
    by: ["productId"],
    where: { order: { storeId, createdAt: { gte: thirtyDaysAgo } } },
    _sum: { quantity: true },
    _count: true,
  }).catch(() => []);

  const soldProductIds = new Set(orderItemsByProduct.map((oi) => oi.productId));

  // Dead stock: products with 0 sales in 30 days
  const deadStock = products.filter((p: { id: string }) => !soldProductIds.has(p.id));
  const deadStockList = deadStock.slice(0, 10)
    .map((p: any) => `- ${p.title} (₦${Number(p.price).toLocaleString()})`)
    .join("\n");

  // Low stock (proxy: products with high sales velocity and low stock)
  const lowStockProducts = orderItemsByProduct
    .filter((oi) => (oi._sum?.quantity ?? 0) > 5 && (oi._sum?.quantity ?? 0) < 10)
    .slice(0, 10);

  // Top selling
  const topSelling = [...orderItemsByProduct]
    .sort((a, b) => ((b._sum?.quantity ?? 0) - (a._sum?.quantity ?? 0)))
    .slice(0, 5);
  const topSellingList = topSelling.map((oi) => {
    const prod = products.find((p: { id: string }) => p.id === oi.productId);
    return `- ${prod?.title || "Unknown"}: ${oi._sum?.quantity ?? 0} sold`;
  }).join("\n");

  // Revenue data
  const totalRevenue30d = allOrders30d.reduce((sum: number, o) => sum + Number(o.total), 0);
  const totalRevenue7d = recentOrders.reduce((sum: number, o) => sum + Number(o.total), 0);

  // Blog/content freshness
  const lastPost = blogPosts[0];
  const daysSinceLastPost = lastPost
    ? Math.floor((now.getTime() - new Date(lastPost.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Calculate avg prep time from order timeline events (food industry)
  const orderTimelineEvents = await prisma.orderTimelineEvent?.findMany({
    where: {
      order: { storeId },
      title: "PREPARING",
      createdAt: { gte: sevenDaysAgo },
    },
    select: { id: true, createdAt: true, body: true },
    take: 100,
  }).catch(() => []);

  const prepTimeMinutes = 0;
  const noShows = bookingsToday.filter((b: { status: string }) => (b as any).status === "NO_SHOW" || (b as any).status === "CANCELLED");
  const confirmedBookings = bookingsToday.filter((b: { status: string }) => (b as any).status === "CONFIRMED" || (b as any).status === "COMPLETED");
  const bookingUtilization = bookingsToday.length > 0
    ? Math.round((confirmedBookings.length / bookingsToday.length) * 100)
    : 0;

  // Weak descriptions
  const weakDescProducts = products.filter((p: any) => !p.description || p.description?.length < 20 || !p.seoTitle);

  // Abandoned cart analysis
  const abandonedCartCount = abandonedCarts.length;
  const abandonedProductsList = (abandonedCarts as { items: { variantId: string; quantity: number }[] }[]).flatMap((cart) =>
    cart.items?.map((item: any) => `- ${item.variantId} (qty: ${item.quantity})`)
  ).slice(0, 10).join("\n");

  // Disputes
  const openDisputeCount = openDisputes.length;
  const disputeList = (openDisputes as { reasonCode: string | null; amount: unknown; currency: string }[]).slice(0, 5).map((d: any) =>
    `- ${d.reasonCode || "Unknown"}: ₦${Number(d.amount).toLocaleString()} (${d.currency || "NGN"})`
  ).join("\n") || "None";

  // Quotes
  const pendingQuoteCount = 0;
  const pendingQuoteList = "None";

  // Overdue invoices
  const overdueInvoiceCount = overdueInvoices.length;
  const overdueInvoiceList = (overdueInvoices as { invoiceNumber: string; totalKobo: bigint; dueDate: Date | null }[]).slice(0, 5).map((inv) =>
    `- #${inv.invoiceNumber}: ₦${Number(inv.totalKobo).toLocaleString()} (due ${inv.dueDate?.toLocaleDateString() ?? "N/A"})`
  ).join("\n") || "None";

  // Flash sales ending soon
  const flashSaleCandidateCount = activeFlashSales.length;
  const flashSaleCandidates = (activeFlashSales as { name: string; discount: number; endTime: Date }[]).map((fs) =>
    `- ${fs.name}: ${fs.discount}% off (ends ${fs?.endTime?.toLocaleDateString()})`
  ).join("\n") || "None";

  // Campaigns ending soon
  const campaignsEndingSoonCount = endingSoonCampaigns.length;
  const campaignsEndingSoon = endingSoonCampaigns.map((c: { title?: string; ruleSlug?: string }) =>
    `- ${(c as { title?: string }).title || "Campaign"} (${(c as { ruleSlug?: string }).ruleSlug || "unknown"})`
  ).join("\n") || "None";

  // Portfolio update check
  const lastPortfolioUpdate = portfolioProjects[0];
  const daysSincePortfolioUpdate = lastPortfolioUpdate
    ? Math.floor((now.getTime() - (lastPortfolioUpdate as { updatedAt: Date }).updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const recentProjects = portfolioProjects.slice(0, 3).map((p: { title?: string }) =>
    `- ${(p as { title?: string }).title || "Project"}`
  ).join("\n") || "None";

  // VIP customers (top spenders)
  const vipCustomerCount = vipCustomers.length;
  const vipCustomerList = (vipCustomers as { customerId: string | null; _sum: { total: unknown }; _count: number }[]).slice(0, 5).map((vc) => {
    const sum = vc._sum;
    const count = vc._count;
    return `- Customer ${vc.customerId?.slice(0, 8) || "Unknown"}: ₦${Number(sum?.total).toLocaleString()} (${count} orders)`;
  }).join("\n") || "None";

  // Reviews check
  const buyersWithoutReview = Math.max(0, recentCustomers7d - customerReviews);

  return {
    storeName,
    industrySlug,
    industryName: industryNameMap[industrySlug] || industrySlug,
    storeTone,
    // Inventory
    deadStockCount: deadStock.length,
    deadStockList: deadStockList || "None",
    lowStockCount: lowStockProducts.length,
    lowStockList: lowStockProducts.length > 0 ? "Products with sales velocity 5-10 units" : "None",
    overstockCount: lowVelocityProducts.length,
    overstockList: lowVelocityProducts.slice(0, 5).map((p: { title?: string }) => `- ${p.title || "Unknown"}`).join("\n") || "None",
    slowMoverCount: lowVelocityProducts.length,
    slowMoverList: lowVelocityProducts.slice(0, 5).map((p: { title?: string }) => `- ${p.title || "Unknown"}`).join("\n") || "None",
    flashSaleCandidateCount,
    flashSaleCandidates,
    // Marketing
    weakDescriptionCount: weakDescProducts.length,
    weakDescriptionList: weakDescProducts.slice(0, 5).map((p: { title?: string }) => `- ${p.title || "[No title]"}`).join("\n"),
    hasTopSellingProducts: topSelling.length > 0,
    topSellingList: topSellingList || "No sales data",
    abandonedCartCount,
    abandonedProducts: abandonedProductsList || "None",
    poorSeoTitleCount: weakDescProducts.filter((p: any) => !p.seoTitle).length,
    poorSeoTitleList: weakDescProducts.filter((p: any) => !p.seoTitle).slice(0, 5).map((p: any) => `- ${p.title || "[No title]"}`).join("\n"),
    // Engagement
    dormantCustomerCount: dormantCheck,
    recentBuyersWithoutReview: buyersWithoutReview,
    vipCustomerCount,
    vipCustomerList,
    lapsedDonorCount: dormantCheck,
    lowCompletionLearnerCount,
    recentTestDriveCount: testDriveBookings.length,
    testDriveList: testDriveBookings.slice(0, 5).map((b: { customer?: { firstName: string | null; lastName: string | null } | null; startsAt: Date }) => {
      const name = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.trim() || "Unknown";
      return `- ${name} on ${b?.startsAt?.toLocaleDateString()}`;
    }).join("\n") || "None",
    // Operations
    avgPrepTimeMinutes: Math.round(prepTimeMinutes),
    prepTimeBreakdown: orderTimelineEvents.length > 0 
      ? `Based on ${orderTimelineEvents.length} orders this week`
      : "No prep data available",
    kitchenBacklog,
    noShowCount: noShows.length,
    emptySlotCount: bookingsToday.length - confirmedBookings.length,
    emptySlotDetails: bookingUtilization < 50 ? `${bookingUtilization}% utilization` : "Acceptable",
    bookingUtilization,
    peakSlotDetails: confirmedBookings.length > 0 ? `${confirmedBookings.length} confirmed today` : "No bookings today",
    lowTicketSalesEventCount: lowTicketEvents.length,
    lowTicketEvents: lowTicketEvents.slice(0, 5).map((e: { title?: string }) => `- ${e.title || "Event"}`).join("\n") || "None",
    overdueInvoiceCount,
    overdueInvoiceList,
    pendingQuoteCount,
    pendingQuoteList,
    openDisputeCount,
    disputeList,
    tableUtilizationBelow60: bookingUtilization < 60 && bookingsToday.length > 0,
    utilizationDetails: `${bookingUtilization}% booking utilization`,
    campaignsEndingSoonCount,
    campaignsEndingSoon,
    staleListingCount: lowVelocityProducts.length,
    staleListings: lowVelocityProducts.slice(0, 5).map((p: { title?: string }) => `- ${p.title || "Unknown"}`).join("\n") || "None",
    lowOccupancyPeriodCount: bookingsToday.length === 0 ? 1 : 0,
    lowOccupancyPeriods: bookingsToday.length === 0 ? "No bookings scheduled today" : "None",
    // Content
    daysSinceLastPost,
    trendingTopics: topSellingList || "N/A",
    daysSincePortfolioUpdate,
    recentProjects,
    // Financial
    hasRevenueData: totalRevenue30d > 0,
    revenueData: `Last 30 days: ₦${totalRevenue30d.toLocaleString()} | Last 7 days: ₦${totalRevenue7d.toLocaleString()} | Orders: ${allOrders30d.length}`,
    hasExpenseAnomaly: expenseAnomalies.length > 0,
    anomalyDetails: expenseAnomalies.length > 0 
      ? `${expenseAnomalies.length} expense categories with unusual activity`
      : "No expense anomalies detected",
  };
}
