import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";

interface ActivityItem {
  id: string;
  iconKey: string;
  text: string;
  timestamp: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 20);

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    const activities: ActivityItem[] = [];

    // Fetch recent orders for this store's marketplace
    const recentOrders = await prisma.order?.findMany({
      where: { 
        storeId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        refCode: true,
        total: true,
        currency: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    for (const order of recentOrders) {
      activities.push({
        id: `order-${order.id}`,
        iconKey: "cart",
        text: `New order #${order.refCode} - ${order.currency} ${Number(order.total).toLocaleString()}`,
        timestamp: order.createdAt?.toISOString(),
      });
    }

    // Fetch active flash sales
    const now = new Date();
    const activeSales = await prisma.flashSale?.findMany({
      where: {
        storeId,
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      select: {
        id: true,
        name: true,
        discount: true,
        endTime: true,
      },
      take: 2,
    });

    for (const sale of activeSales) {
      activities.push({
        id: `sale-${sale.id}`,
        iconKey: "tag",
        text: `Flash Sale: ${sale.name} - ${sale.discount}% off`,
        timestamp: sale.endTime?.toISOString(),
      });
    }

    // Fetch top selling products
    const topProducts = await prisma.orderItem?.groupBy({
      by: ["productId"],
      where: {
        order: { 
          storeId, 
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 2,
    });

    const productIds = topProducts.map(p => p.productId) as any;
    if (productIds.length > 0) {
      const productDetails = await prisma.product?.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true },
      });

      for (const product of productDetails.slice(0, 2)) {
        activities.push({
          id: `trend-${product.id}`,
          iconKey: "arrowUp",
          text: `Trending: ${product.title}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Fetch new vendors (if marketplace has multiple sellers)
    const recentStores = await prisma.store?.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        isLive: true,
      },
      select: { id: true, name: true, createdAt: true },
      take: 2,
    });

    for (const store of recentStores) {
      activities.push({
        id: `vendor-${store.id}`,
        iconKey: "userPlus",
        text: `New vendor: ${store.name} just joined`,
        timestamp: store.createdAt?.toISOString(),
      });
    }

    // Add generic promotional items if we don't have enough real activities
    if (activities.length < limit) {
      const now = new Date();
      const generics: ActivityItem[] = [
        {
          id: "generic-1",
          iconKey: "star",
          text: "Free delivery on orders over ₦50,000",
          timestamp: now.toISOString(),
        },
        {
          id: "generic-2",
          iconKey: "bell",
          text: "New arrivals added daily",
          timestamp: now.toISOString(),
        },
      ];
      activities.push(...generics);
    }

    // Shuffle and limit results
    const shuffled = activities
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return NextResponse.json({ activities: shuffled });
  } catch (error) {
    console.error("[Marketplace Activity API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
