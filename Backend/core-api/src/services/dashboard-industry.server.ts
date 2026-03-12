import { type ExtendedPrismaClient } from "@/lib/db";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { getIndustryDashboardDefinition } from "@/config/industry-dashboard-definitions";
import {
  computeSuggestedActions,
  type BusinessStateForActions,
} from "@/services/dashboard-actions";
import {
  computeDashboardAlerts,
  type MetricValues,
} from "@/services/dashboard-alerts";
import type { IndustrySlug } from "@/lib/templates/types";

/** Minimal metadata shape for nonprofit campaign products */
type NonprofitMetadata = {
  endDate?: string;
  end_date?: string;
  [key: string]: unknown;
};

/** Minimal metadata shape for events/nightlife products */
type EventsMetadata = {
  ticket_quota?: number;
  ticketQuota?: number;
  [key: string]: unknown;
};

interface TopClient {
  id: string;
  name: string;
  orderValue: number;
  orderCount: number;
}

interface GroupByResult {
  customerId?: string | null;
  productId?: string | null;
  serviceId?: string | null;
  _sum?: {
    total?: number | null;
    quantity?: number | null;
  };
  _count?: {
    _all?: number;
    serviceId?: number;
  };
}

export class DashboardIndustryService {
  static async getIndustryOverview(db: ExtendedPrismaClient, storeId: string) {
    const store = await db.store.findFirst({
      where: { id: storeId },
      select: { industrySlug: true },
    });
    const industrySlug = (store?.industrySlug || "retail") as IndustrySlug;
    const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.retail;
    const definition = getIndustryDashboardDefinition(industrySlug);

    if (!definition) return null;

    const hasBookings = Boolean(
      config?.features?.bookings ||
      config?.features?.reservations ||
      config?.features?.viewings,
    );
    const hasInventory = Boolean(config?.features?.inventory);
    const hasDelivery = Boolean(config?.features?.delivery);

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const endOfTomorrow = new Date(startOfTomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const [
      topSellingRaw,
      lowStockItems,
      outOfStockCount,
      pendingFulfillmentCount,
      delayedShipmentsCount,
      returnsInitiatedCount,
      todaysBookingsCount,
      cancellationsTodayCount,
      noShowsTodayCount,
      emptySlotsNextDayCount,
      totalBookingsLast14,
      noShowsLast14,
      ordersInQueueCount,
      soldOutItemsCount,
    ] = await Promise.all([
      hasInventory || industrySlug === "food"
        ? db.orderItem.groupBy({
            by: ["productId"],
            where: {
              order: {
                storeId,
                createdAt: { gte: startOfToday },
                status: { notIn: ["DRAFT", "CANCELLED"] },
              },
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: 5,
          })
        : Promise.resolve([]),
      hasInventory
        ? db.inventoryItem.findMany({
            where: {
              product: { storeId, status: { not: "DRAFT" } },
              available: { gt: 0, lte: 5 },
            },
            select: {
              productId: true,
              available: true,
              product: { select: { id: true, title: true } },
            },
            take: 10,
            orderBy: { available: "asc" },
          })
        : Promise.resolve([]),
      hasInventory
        ? db.inventoryItem.count({
            where: {
              product: { storeId, status: { not: "DRAFT" } },
              available: { lte: 0 },
            },
          })
        : Promise.resolve(0),
      hasDelivery
        ? db.order.count({
            where: {
              storeId,
              fulfillmentStatus: "UNFULFILLED",
              status: { notIn: ["DRAFT", "CANCELLED"] },
            },
          })
        : Promise.resolve(0),
      hasDelivery
        ? db.order.count({
            where: {
              storeId,
              fulfillmentStatus: "OUT_FOR_DELIVERY",
              updatedAt: {
                lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
              },
            },
          })
        : Promise.resolve(0),
      hasDelivery
        ? db.order.count({ where: { storeId, fulfillmentStatus: "RETURNED" } })
        : Promise.resolve(0),
      hasBookings
        ? db.booking.count({
            where: {
              startsAt: { gte: startOfToday, lte: endOfToday },
              status: { in: ["PENDING", "CONFIRMED"] },
            },
          })
        : Promise.resolve(0),
      hasBookings
        ? db.booking.count({
            where: { updatedAt: { gte: startOfToday }, status: "CANCELLED" },
          })
        : Promise.resolve(0),
      hasBookings
        ? db.booking.count({
            where: {
              startsAt: { gte: startOfToday, lte: endOfToday },
              status: "NO_SHOW",
            },
          })
        : Promise.resolve(0),
      hasBookings
        ? db.booking
            .count({
              where: {
                startsAt: { gte: startOfTomorrow, lte: endOfTomorrow },
                status: { in: ["PENDING", "CONFIRMED"] },
              },
            })
            .then((booked: number) => Math.max(0, 8 - booked))
        : Promise.resolve(0),
      hasBookings
        ? db.booking.count({ where: { createdAt: { gte: fourteenDaysAgo } } })
        : Promise.resolve(0),
      hasBookings
        ? db.booking.count({
            where: { createdAt: { gte: fourteenDaysAgo }, status: "NO_SHOW" },
          })
        : Promise.resolve(0),
      industrySlug === "food"
        ? db.order.count({
            where: {
              storeId,
              createdAt: { gte: startOfToday },
              fulfillmentStatus: "UNFULFILLED",
              status: { notIn: ["DRAFT", "CANCELLED"] },
            },
          })
        : Promise.resolve(0),
      industrySlug === "food"
        ? db.inventoryItem.count({
            where: {
              product: { storeId, status: { not: "DRAFT" } },
              available: { lte: 0 },
            },
          })
        : Promise.resolve(0),
    ]);

    const isB2B = industrySlug === "b2b";
    const isEvents = industrySlug === "events" || industrySlug === "nightlife";
    const isAutomotive = industrySlug === "automotive";
    const isTravel = industrySlug === "travel_hospitality";
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [
      pendingQuotesCount,
      overdueInvoicesCount,
      topClientsRaw,
      ticketsSoldTodayCount,
      activeEventsCount,
      agingInventoryCount,
      activeListingsCount,
      checkoutsTodayCount,
      eventsStartingSoonCount,
    ] = await Promise.all([
      isB2B
        ? db.order.count({ where: { storeId, status: "DRAFT" } })
        : Promise.resolve(0),
      isB2B
        ? db.invoiceV2.count({
            where: { storeId, status: "PENDING", dueDate: { lt: now } },
          })
        : Promise.resolve(0),
      isB2B
        ? db.order.groupBy({
            by: ["customerId"],
            where: {
              storeId,
              createdAt: { gte: thirtyDaysAgo },
              status: { notIn: ["DRAFT", "CANCELLED"] },
              customerId: { not: null },
            },
            _sum: { total: true },
            _count: { _all: true },
            orderBy: { _sum: { total: "desc" } },
            take: 5,
          })
        : Promise.resolve([]),
      isEvents
        ? db.order.count({
            where: {
              storeId,
              createdAt: { gte: startOfToday },
              status: { notIn: ["DRAFT", "CANCELLED"] },
            },
          })
        : Promise.resolve(0),
      isEvents
        ? db.product.count({ where: { storeId, status: "ACTIVE" } })
        : Promise.resolve(0),
      isAutomotive
        ? db.product.count({
            where: {
              storeId,
              status: { not: "DRAFT" },
              createdAt: { lte: thirtyDaysAgo },
            },
          })
        : Promise.resolve(0),
      isAutomotive
        ? db.product.count({ where: { storeId, status: { not: "DRAFT" } } })
        : Promise.resolve(0),
      isTravel
        ? db.booking.count({
            where: {
              endsAt: { gte: startOfToday, lte: endOfToday },
              status: { in: ["CONFIRMED", "COMPLETED"] },
            },
          })
        : Promise.resolve(0),
      isEvents
        ? db.product
            .count({
              where: {
                storeId,
                status: "ACTIVE",
                metadata: {
                  path: ["eventDate"],
                  gte: now.toISOString(),
                  lte: twentyFourHoursAhead.toISOString(),
                },
              },
            })
            .catch(() => 0)
        : Promise.resolve(0),
    ]);

    let topClients: TopClient[] = [];
    if (isB2B && topClientsRaw.length > 0) {
      const results = topClientsRaw as unknown as GroupByResult[];
      const customerIds = results
        .map((r) => r.customerId)
        .filter((id): id is string => Boolean(id));
      const customers =
        customerIds.length > 0
          ? await db.customer.findMany({
              where: { id: { in: customerIds } },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            })
          : [];
      const nameMap = new Map<string, string>(
        customers.map(
          (c: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string | null;
          }) => [
            c.id,
            [c.firstName, c.lastName].filter(Boolean).join(" ") ||
              c.email ||
              "Unknown",
          ],
        ),
      );
      topClients = results.map((r) => ({
        id: r.customerId || "",
        name:
          (r.customerId ? nameMap.get(r.customerId) : undefined) || "Unknown",
        orderValue: Number(r._sum?.total || 0),
        orderCount: Number(r._count?._all || 0),
      }));
    }

    const isFood = industrySlug === "food";
    const isBlogMedia =
      industrySlug === "blog_media" || industrySlug === "creative_portfolio";
    const isNonprofit = industrySlug === "nonprofit";
    const isDigital = industrySlug === "digital";
    const isEducation = industrySlug === "education";
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const [
      avgPrepTimeResult,
      checkedInTodayCount,
      ticketCapacityProducts,
      serviceRevenueRaw,
      publishedPostsCount,
      draftPostsCount,
      postsThisWeekCount,
      donationsTodayCount,
      newDonorsCount,
      activeCampaignsCount,
      activeAssetsCount,
      salesTodayCount,
    ] = await Promise.all([
      isFood
        ? db.order.findMany({
            where: {
              storeId,
              fulfillmentStatus: {
                in: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"],
              },
              createdAt: { gte: startOfToday },
            },
            select: {
              createdAt: true,
              updatedAt: true,
              timelineEvents: {
                where: { title: { contains: "PREPARING" } },
                take: 1,
              },
            },
            take: 100,
          })
        : Promise.resolve([]),
      isEvents
        ? db.order
            .count({
              where: {
                storeId,
                createdAt: { gte: startOfToday },
                status: { notIn: ["DRAFT", "CANCELLED"] },
                metadata: { path: ["checkedIn"], equals: true },
              },
            })
            .catch(() => 0)
        : Promise.resolve(0),
      isEvents
        ? db.product.findMany({
            where: { storeId, status: "ACTIVE" },
            select: { id: true, metadata: true },
            take: 50,
          })
        : Promise.resolve([]),
      hasBookings && !isEvents
        ? db.booking.groupBy({
            by: ["serviceId"],
            where: {
              createdAt: { gte: fourteenDaysAgo },
              status: { in: ["CONFIRMED", "COMPLETED"] },
            },
            _count: { _all: true },
            orderBy: { _count: { serviceId: "desc" } },
            take: 5,
          })
        : Promise.resolve([]),
      isBlogMedia
        ? db.blogPost.count({ where: { storeId, status: "PUBLISHED" } })
        : Promise.resolve(0),
      isBlogMedia
        ? db.blogPost.count({ where: { storeId, status: "DRAFT" } })
        : Promise.resolve(0),
      isBlogMedia
        ? db.blogPost.count({
            where: {
              storeId,
              status: "PUBLISHED",
              publishedAt: { gte: startOfWeek },
            },
          })
        : Promise.resolve(0),
      isNonprofit
        ? db.order.count({
            where: {
              storeId,
              createdAt: { gte: startOfToday },
              status: { notIn: ["DRAFT", "CANCELLED"] },
            },
          })
        : Promise.resolve(0),
      isNonprofit
        ? db.order
            .groupBy({
              by: ["customerId"],
              where: {
                storeId,
                createdAt: { gte: thirtyDaysAgo },
                status: { notIn: ["DRAFT", "CANCELLED"] },
                customerId: { not: null },
              },
            })
            .then((r: unknown[]) => r.length)
        : Promise.resolve(0),
      isNonprofit
        ? db.product.count({ where: { storeId, status: "ACTIVE" } })
        : Promise.resolve(0),
      isDigital
        ? db.product.count({ where: { storeId, status: { not: "DRAFT" } } })
        : Promise.resolve(0),
      isDigital || isBlogMedia || isNonprofit
        ? db.order.count({
            where: {
              storeId,
              createdAt: { gte: startOfToday },
              status: { notIn: ["DRAFT", "CANCELLED"] },
            },
          })
        : Promise.resolve(0),
    ]);

    const isPortfolio = industrySlug === "creative_portfolio";
    const isMarketplace = industrySlug === "marketplace";

    const [
      activeLearnersCount,
      completedBookingsCount,
      totalBookingsForCompletion,
      subscriberProxyCount,
      activeProjectsCount,
      pendingInquiriesCount,
      disputesOpenCount,
      donorsPrevPeriodCount,
      donorsCurrentPeriodCount,
      campaignsEndingSoonCount,
      refundedOrdersCount,
      totalOrdersForRefund,
    ] = await Promise.all([
      isEducation
        ? db.booking
            .groupBy({
              by: ["customerId"],
              where: {
                createdAt: { gte: fourteenDaysAgo },
                status: { in: ["CONFIRMED", "PENDING"] },
                customerId: { not: null },
              },
            })
            .then((r: unknown[]) => r.length)
        : Promise.resolve(0),
      isEducation
        ? db.booking.count({
            where: { createdAt: { gte: thirtyDaysAgo }, status: "COMPLETED" },
          })
        : Promise.resolve(0),
      isEducation
        ? db.booking.count({
            where: {
              createdAt: { gte: thirtyDaysAgo },
              status: {
                in: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
              },
            },
          })
        : Promise.resolve(0),
      isBlogMedia
        ? db.customer.count({ where: { storeId } })
        : Promise.resolve(0),
      isPortfolio
        ? db.order.count({
            where: {
              storeId,
              fulfillmentStatus: "UNFULFILLED",
              status: { notIn: ["DRAFT", "CANCELLED"] },
            },
          })
        : Promise.resolve(0),
      isPortfolio
        ? db.order.count({ where: { storeId, status: "DRAFT" } })
        : Promise.resolve(0),
      isMarketplace
        ? db.order.count({
            where: {
              storeId,
              fulfillmentStatus: { in: ["RETURNED", "FAILED"] },
            },
          })
        : Promise.resolve(0),
      isNonprofit
        ? db.order
            .groupBy({
              by: ["customerId"],
              where: {
                storeId,
                createdAt: {
                  gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
                  lt: thirtyDaysAgo,
                },
                status: { notIn: ["DRAFT", "CANCELLED"] },
                customerId: { not: null },
              },
            })
            .then((r: unknown[]) => r.length)
        : Promise.resolve(0),
      isNonprofit
        ? db.order
            .groupBy({
              by: ["customerId"],
              where: {
                storeId,
                createdAt: { gte: thirtyDaysAgo },
                status: { notIn: ["DRAFT", "CANCELLED"] },
                customerId: { not: null },
              },
            })
            .then((r: unknown[]) => r.length)
        : Promise.resolve(0),
      isNonprofit
        ? db.product
            .findMany({
              where: { storeId, status: "ACTIVE" },
              select: { metadata: true },
              take: 50,
            })
            .then((products: { metadata: unknown }[]) => {
              const sevenDaysFromNow = new Date(
                now.getTime() + 7 * 24 * 60 * 60 * 1000,
              );
              return products.filter((p: { metadata: unknown }) => {
                const meta = p.metadata as NonprofitMetadata;
                const endDate = meta?.endDate || meta?.end_date;
                if (!endDate) return false;
                const d = new Date(String(endDate));
                return d >= now && d <= sevenDaysFromNow;
              }).length;
            })
        : Promise.resolve(0),
      isDigital
        ? db.order.count({
            where: {
              storeId,
              createdAt: { gte: thirtyDaysAgo },
              fulfillmentStatus: "RETURNED",
            },
          })
        : Promise.resolve(0),
      isDigital
        ? db.order.count({
            where: {
              storeId,
              createdAt: { gte: thirtyDaysAgo },
              status: { notIn: ["DRAFT", "CANCELLED"] },
            },
          })
        : Promise.resolve(0),
    ]);

    const highReturnRateProductsCount = hasDelivery
      ? await db.orderItem
          .groupBy({
            by: ["productId"],
            where: {
              order: {
                storeId,
                fulfillmentStatus: "RETURNED",
                createdAt: { gte: thirtyDaysAgo },
              },
              productId: { not: null },
            },
          })
          .then((r: unknown[]) => r.length)
      : 0;

    let avgPrepTime: number | null = null;
    if (isFood && avgPrepTimeResult.length > 0) {
      let totalMins = 0,
        counted = 0;
      for (const order of avgPrepTimeResult) {
        const startTime =
          order.timelineEvents?.[0]?.createdAt ?? order.createdAt;
        const diffMins =
          (order.updatedAt.getTime() - startTime.getTime()) / 1000 / 60;
        if (diffMins > 0 && diffMins < 480) {
          totalMins += diffMins;
          counted++;
        }
      }
      avgPrepTime = counted > 0 ? Math.round(totalMins / counted) : 15;
    }
    const prepTimeSpikeMinutes =
      avgPrepTime !== null && avgPrepTime > 30 ? avgPrepTime : 0;

    let ticketsRemainingCount = 0;
    if (isEvents && ticketCapacityProducts.length > 0) {
      let totalCapacity = 0;
      for (const p of ticketCapacityProducts) {
        const meta = p.metadata as EventsMetadata;
        const quota = meta?.ticket_quota || meta?.ticketQuota || 0;
        if (typeof quota === "number" && quota > 0) totalCapacity += quota;
      }
      ticketsRemainingCount = Math.max(
        0,
        totalCapacity - ticketsSoldTodayCount,
      );
    }

    let topBookedServices: {
      id: string;
      title: string;
      bookingCount: number;
    }[] = [];
    if (serviceRevenueRaw.length > 0) {
      const results = serviceRevenueRaw as unknown as GroupByResult[];
      const serviceIds = results
        .map((r) => r.serviceId)
        .filter((id): id is string => Boolean(id));
      const services =
        serviceIds.length > 0
          ? await db.product.findMany({
              where: { id: { in: serviceIds } },
              select: { id: true, title: true },
            })
          : [];
      const nameMap = new Map<string, string>(
        services.map((s: { id: string; title: string }) => [s.id, s.title]),
      );
      topBookedServices = results.map((r) => ({
        id: r.serviceId || "",
        title:
          (r.serviceId ? nameMap.get(r.serviceId) : undefined) || "Unknown",
        bookingCount: Number(r._count?.serviceId || 0),
      }));
    }

    let daysSinceLastPost = 0;
    if (isBlogMedia) {
      const lastPost = await db.blogPost.findFirst({
        where: { storeId, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: { publishedAt: true },
      });
      daysSinceLastPost = lastPost?.publishedAt
        ? Math.floor(
            (now.getTime() - lastPost.publishedAt.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 999;
    }

    const lowStockProducts = lowStockItems.map(
      (item: {
        product?: { id: string; title: string } | null;
        productId: string;
        available?: number | null;
      }) => ({
        id: item.product?.id || item.productId,
        title: item.product?.title || "Unknown",
        stock: item.available ?? 0,
      }),
    );

    let topSellingProducts: { id: string; title: string; unitsSold: number }[] =
      [];
    if (topSellingRaw.length > 0) {
      const results = topSellingRaw as unknown as GroupByResult[];
      const productIds = results
        .map((r) => r.productId)
        .filter((id): id is string => Boolean(id));
      const products =
        productIds.length > 0
          ? await db.product.findMany({
              where: { id: { in: productIds } },
              select: { id: true, title: true },
            })
          : [];
      const nameMap = new Map<string, string>(
        products.map((p: { id: string; title: string }) => [p.id, p.title]),
      );
      topSellingProducts = results.map((r) => ({
        id: r.productId || "",
        title:
          (r.productId ? nameMap.get(r.productId) : undefined) || "Unknown",
        unitsSold: Number(r._sum?.quantity || 0),
      }));
    }

    let deadStockProducts: { id: string; title: string; stock: number }[] = [];
    if (hasInventory) {
      const recentlySoldIds = await db.orderItem.findMany({
        where: {
          order: {
            storeId,
            createdAt: { gte: fourteenDaysAgo },
            status: { notIn: ["DRAFT", "CANCELLED"] },
          },
        },
        select: { productId: true },
        distinct: ["productId"],
      });
      const soldIdSet = new Set(
        recentlySoldIds
          .map((r: { productId: string | null }) => r.productId)
          .filter(Boolean),
      );
      const activeWithStock = await db.inventoryItem.findMany({
        where: {
          product: { storeId, status: { not: "DRAFT" } },
          available: { gt: 0 },
        },
        select: {
          productId: true,
          available: true,
          product: { select: { id: true, title: true } },
        },
        take: 50,
      });
      deadStockProducts = activeWithStock
        .filter((item: { productId: string }) => !soldIdSet.has(item.productId))
        .slice(0, 5)
        .map(
          (item: {
            product?: { id: string; title: string } | null;
            productId: string;
            available?: number | null;
          }) => ({
            id: item.product?.id || item.productId,
            title: item.product?.title || "Unknown",
            stock: item.available ?? 0,
          }),
        );
    }

    const noShowRate =
      totalBookingsLast14 > 0
        ? Math.round((noShowsLast14 / totalBookingsLast14) * 100)
        : 0;

    const metricValues: MetricValues = {
      lowStockCount: lowStockProducts.length,
      outOfStockCount,
      delayedShipments: delayedShipmentsCount,
      highReturnRateProducts: highReturnRateProductsCount,
      prepTimeSpikeMinutes: prepTimeSpikeMinutes,
      soldOutCount: soldOutItemsCount,
      ordersInQueue: ordersInQueueCount,
      emptySlotsNextDay: emptySlotsNextDayCount,
      noShowRate,
      pendingQuotesCount,
      overdueInvoices: overdueInvoicesCount,
      ticketsRemaining: ticketsRemainingCount,
      agingInventoryCount,
      eventStartingSoon: eventsStartingSoonCount,
      noTestDrivesThisWeek: todaysBookingsCount === 0 && isAutomotive ? 1 : 0,
      daysSinceLastPost,
      donorChurnRate:
        donorsPrevPeriodCount > 0
          ? Math.round(
              ((donorsPrevPeriodCount - donorsCurrentPeriodCount) /
                donorsPrevPeriodCount) *
                100,
            )
          : 0,
      campaignEndingSoon: campaignsEndingSoonCount,
      lowCompletionRate:
        totalBookingsForCompletion > 0
          ? Math.round(
              (completedBookingsCount / totalBookingsForCompletion) * 100,
            )
          : 0,
      refundRate:
        totalOrdersForRefund > 0
          ? Math.round((refundedOrdersCount / totalOrdersForRefund) * 100)
          : 0,
      disputesOpen: disputesOpenCount,
    };

    const businessState: BusinessStateForActions = {
      hasLowStock: lowStockProducts.length > 0,
      hasDeadStock: deadStockProducts.length > 0,
      hasPendingFulfillment: pendingFulfillmentCount > 0,
      hasSoldOutItems: soldOutItemsCount > 0,
      hasBacklog: ordersInQueueCount >= 5,
      hasPrepTimeSpike: prepTimeSpikeMinutes > 0,
      hasEmptySlots: emptySlotsNextDayCount >= 3,
      hasHighNoShowRisk: noShowRate >= 15,
      hasUnderperformingServices:
        topBookedServices.length > 0 &&
        topBookedServices.some((s) => s.bookingCount <= 1),
      hasStaleQuotes: pendingQuotesCount >= 5,
      hasOverdueInvoices: overdueInvoicesCount > 0,
      hasUnsoldTickets: isEvents && activeEventsCount > 0,
      hasEventStartingSoon: eventsStartingSoonCount > 0,
      hasAgingInventory: agingInventoryCount >= 3,
      hasRecentTestDrives: isAutomotive && todaysBookingsCount > 0,
      hasTodaysBookings: todaysBookingsCount > 0,
      hasDraftPosts: draftPostsCount > 0,
      hasPublishedPosts: publishedPostsCount > 0,
      hasTopSellers: topSellingProducts.length > 0,
      hasMultipleAssets: activeAssetsCount >= 2,
      hasRecentDonors: donationsTodayCount > 0 || newDonorsCount > 0,
      hasNoCampaigns: isNonprofit && activeCampaignsCount === 0,
      hasLowCompletionCourses:
        isEducation &&
        totalBookingsForCompletion > 0 &&
        completedBookingsCount / totalBookingsForCompletion < 0.4,
      hasDisputes: disputesOpenCount > 0,
      hasPendingInquiries: pendingInquiriesCount > 0,
      hasCompletedProjects: isPortfolio && salesTodayCount > 0,
    };

    const alerts = computeDashboardAlerts(definition, metricValues);
    const suggestedActions = computeSuggestedActions(definition, businessState);

    return {
      industry: industrySlug,
      definition: {
        title: definition.title,
        subtitle: definition.subtitle,
        primaryObjectLabel: definition.primaryObjectLabel,
        defaultTimeHorizon: definition.defaultTimeHorizon,
        sections: definition.sections,
        failureModes: definition.failureModes,
      },
      primaryObjectHealth: {
        topSellingProducts,
        lowStockProducts,
        deadStockProducts,
        bestSellingItems: topSellingProducts,
        soldOutItems: soldOutItemsCount,
        topClients,
        activeEvents: activeEventsCount,
        agingInventory: agingInventoryCount,
        topBookedServices,
      },
      liveOperations: {
        pendingFulfillment: pendingFulfillmentCount,
        delayedShipments: delayedShipmentsCount,
        returnsInitiated: returnsInitiatedCount,
        ordersInQueue: ordersInQueueCount,
        avgPrepTime,
        kitchenBacklog: ordersInQueueCount,
        todaysBookings: todaysBookingsCount,
        cancellationsToday: cancellationsTodayCount,
        noShowsToday: noShowsTodayCount,
        pendingQuotesCount,
        overdueInvoices: overdueInvoicesCount,
        ticketsSoldToday: ticketsSoldTodayCount,
        checkedInToday: checkedInTodayCount,
        ticketsRemaining: ticketsRemainingCount,
        activeListings: activeListingsCount,
        checkoutsToday: checkoutsTodayCount,
        salesToday: salesTodayCount,
        activeAssets: activeAssetsCount,
        donationsToday: donationsTodayCount,
        newDonors: newDonorsCount,
        activeCampaigns: activeCampaignsCount,
        activeLearners: activeLearnersCount,
        postsThisWeek: postsThisWeekCount,
        subscriberCount: subscriberProxyCount,
        publishedPosts: publishedPostsCount,
        draftPosts: draftPostsCount,
        daysSinceLastPost,
        activeProjects: activeProjectsCount,
        pendingInquiries: pendingInquiriesCount,
        disputesOpen: disputesOpenCount,
      },
      alerts,
      suggestedActions,
    };
  }
}
