import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SubscriptionSchema = z.object({
  boxId: z.string().min(1),
  customerId: z.string().min(1),
  startDate: z.string().datetime(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "bimonthly", "quarterly"]),
  preferences: z.object({
    categories: z.array(z.string()).optional(),
    excludedProducts: z.array(z.string()).optional(),
    deliveryNotes: z.string().optional(),
  }).optional(),
});

// GET /api/box-subscriptions/subscriptions - List box subscriptions
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const customerId = searchParams.get("customerId");
      const boxId = searchParams.get("boxId");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      const where: any = { storeId };

      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (boxId) where.boxId = boxId;

      const [subscriptions, total] = await Promise.all([
        prisma.boxSubscription.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            box: {
              select: {
                name: true,
                frequency: true,
                pricing: true,
              },
            },
            customer: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: { dunningAttempts: true },
            },
          },
        }),
        prisma.boxSubscription.count({ where }),
      ]);

      const subscriptionList = subscriptions.map(sub => ({
        id: sub.id,
        boxId: sub.boxId,
        boxName: sub.box?.name || "Unknown Box",
        boxFrequency: sub.box?.frequency || "monthly",
        customerId: sub.customerId,
        customerEmail: sub.customer?.email || "Unknown Customer",
        customerName: sub.customer 
          ? `${sub.customer.firstName || ''} ${sub.customer.lastName || ''}`.trim()
          : "Unknown Customer",
        status: sub.status,
        startDate: sub.startDate.toISOString(),
        endDate: sub.endDate?.toISOString() || null,
        nextBillingDate: sub.nextBillingDate?.toISOString() || null,
        frequency: sub.frequency,
        currentPricing: sub.pricing,
        dunningAttemptCount: sub._count.dunningAttempts,
        preferences: sub.preferences,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
      }));

      return NextResponse.json(
        {
          subscriptions: subscriptionList,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[BOX_SUBSCRIPTIONS_LIST_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load box subscriptions" },
        { status: 500 },
      );
    }
  },
);

// POST /api/box-subscriptions/subscriptions - Create new box subscription
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const result = SubscriptionSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { boxId, customerId, startDate, frequency, preferences } = result.data;

      // Verify box exists and belongs to store
      const box = await prisma.subscriptionBox.findUnique({
        where: { id: boxId },
        select: { 
          storeId: true, 
          status: true,
          pricing: true,
          frequency: true,
        },
      });

      if (!box) {
        return NextResponse.json(
          { error: "Subscription box not found" },
          { status: 404 },
        );
      }

      if (box.storeId !== storeId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 },
        );
      }

      if (box.status !== "active") {
        return NextResponse.json(
          { error: "Subscription box is not active" },
          { status: 400 },
        );
      }

      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { storeId: true },
      });

      if (!customer || customer.storeId !== storeId) {
        return NextResponse.json(
          { error: "Customer not found or access denied" },
          { status: 404 },
        );
      }

      // Check if customer already has an active subscription to this box
      const existingActive = await prisma.boxSubscription.findFirst({
        where: {
          customerId,
          boxId,
          status: "active",
        },
      });

      if (existingActive) {
        return NextResponse.json(
          { error: "Customer already has an active subscription to this box" },
          { status: 409 },
        );
      }

      const startDateObj = new Date(startDate);
      const nextBillingDate = calculateNextBillingDate(startDateObj, frequency);

      const subscription = await prisma.boxSubscription.create({
        data: {
          storeId,
          boxId,
          customerId,
          status: "active",
          startDate: startDateObj,
          nextBillingDate,
          frequency,
          pricing: box.pricing,
          preferences: preferences || {},
          history: [{
            status: "active",
            date: new Date().toISOString(),
            reason: "Subscription created",
          }],
        },
        include: {
          box: {
            select: {
              name: true,
            },
          },
        },
      });

      // Update box stats
      await prisma.subscriptionBox.update({
        where: { id: boxId },
        data: {
          stats: {
            increment: {
              totalSubscribers: 1,
              activeSubscribers: 1,
            },
          },
        },
      });

      return NextResponse.json(
        {
          subscription: {
            id: subscription.id,
            boxId: subscription.boxId,
            boxName: subscription.box?.name || "Unknown Box",
            customerId: subscription.customerId,
            status: subscription.status,
            startDate: subscription.startDate.toISOString(),
            nextBillingDate: subscription.nextBillingDate?.toISOString() || null,
            frequency: subscription.frequency,
            currentPricing: subscription.pricing,
            createdAt: subscription.createdAt.toISOString(),
          },
        },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[BOX_SUBSCRIPTIONS_CREATE_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create box subscription" },
        { status: 500 },
      );
    }
  },
);

// Helper function to calculate next billing date
function calculateNextBillingDate(startDate: Date, frequency: string): Date {
  const nextDate = new Date(startDate);
  
  switch (frequency) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "biweekly":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "bimonthly":
      nextDate.setMonth(nextDate.getMonth() + 2);
      break;
    case "quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
  }
  
  return nextDate;
}