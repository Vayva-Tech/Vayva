import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateSubscriptionSchema = z.object({
  status: z.enum(["active", "paused", "cancelled", "expired"]).optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "bimonthly", "quarterly"]).optional(),
  preferences: z.object({
    categories: z.array(z.string()).optional(),
    excludedProducts: z.array(z.string()).optional(),
    deliveryNotes: z.string().optional(),
  }).optional(),
});

// GET /api/box-subscriptions/subscriptions/[id] - Get subscription details
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (_, { storeId, params }) => {
    try {
      const { id } = params;

      const subscription = await prisma.boxSubscription.findUnique({
        where: { id, storeId },
        include: {
          box: {
            select: {
              name: true,
              description: true,
              frequency: true,
              pricing: true,
            },
          },
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          dunningAttempts: {
            select: {
              id: true,
              status: true,
              attemptDate: true,
              amount: true,
              reason: true,
            },
            orderBy: {
              attemptDate: "desc",
            },
          },
          _count: {
            select: {
              dunningAttempts: true,
            },
          },
        },
      });

      if (!subscription) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 },
        );
      }

      const subscriptionDetails = {
        id: subscription.id,
        boxId: subscription.boxId,
        boxName: subscription.box?.name || "Unknown Box",
        boxDescription: subscription.box?.description || "",
        customerId: subscription.customerId,
        customerEmail: subscription.customer?.email || "Unknown Customer",
        customerName: subscription.customer 
          ? `${subscription.customer.firstName || ''} ${subscription.customer.lastName || ''}`.trim()
          : "Unknown Customer",
        customerPhone: subscription.customer?.phone || null,
        status: subscription.status,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate?.toISOString() || null,
        nextBillingDate: subscription.nextBillingDate?.toISOString() || null,
        frequency: subscription.frequency,
        currentPricing: subscription.pricing,
        preferences: subscription.preferences,
        dunningAttempts: subscription.dunningAttempts,
        dunningAttemptCount: subscription._count.dunningAttempts,
        history: subscription.history,
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString(),
      };

      return NextResponse.json(
        { subscription: subscriptionDetails },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[BOX_SUBSCRIPTION_GET]", error, { storeId, subscriptionId: params.id });
      return NextResponse.json(
        { error: "Failed to load subscription details" },
        { status: 500 },
      );
    }
  },
);

// PATCH /api/box-subscriptions/subscriptions/[id] - Update subscription
export const PATCH = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { storeId, params }) => {
    try {
      const { id } = params;
      const body = await req.json();
      const result = UpdateSubscriptionSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { status, frequency, preferences } = result.data;

      // Check if subscription exists and belongs to store
      const existingSubscription = await prisma.boxSubscription.findUnique({
        where: { id, storeId },
        select: { 
          status: true,
          startDate: true,
          nextBillingDate: true,
          frequency: true,
        },
      });

      if (!existingSubscription) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 },
        );
      }

      const updateData: any = {
        history: {
          push: {
            status: status || existingSubscription.status,
            date: new Date().toISOString(),
            reason: "Subscription updated",
          },
        },
      };

      if (status) {
        updateData.status = status;
        
        // Handle special status transitions
        if (status === "cancelled") {
          updateData.endDate = new Date();
          updateData.nextBillingDate = null;
        } else if (status === "active" && existingSubscription.status === "paused") {
          // Resume paused subscription
          const nextBilling = calculateNextBillingDate(new Date(), existingSubscription.frequency);
          updateData.nextBillingDate = nextBilling;
        }
      }

      if (frequency) {
        updateData.frequency = frequency;
        if (existingSubscription.nextBillingDate) {
          const nextBilling = calculateNextBillingDate(existingSubscription.startDate, frequency);
          updateData.nextBillingDate = nextBilling;
        }
      }

      if (preferences) {
        updateData.preferences = {
          ...existingSubscription.preferences,
          ...preferences,
        };
      }

      const subscription = await prisma.boxSubscription.update({
        where: { id },
        data: updateData,
        include: {
          box: {
            select: {
              name: true,
            },
          },
        },
      });

      // Update box stats if status changed
      if (status && status !== existingSubscription.status) {
        const statChange = getStatChange(existingSubscription.status, status);
        if (statChange) {
          await prisma.subscriptionBox.update({
            where: { id: subscription.boxId },
            data: {
              stats: statChange,
            },
          });
        }
      }

      return NextResponse.json(
        {
          subscription: {
            id: subscription.id,
            boxId: subscription.boxId,
            boxName: subscription.box?.name || "Unknown Box",
            customerId: subscription.customerId,
            status: subscription.status,
            startDate: subscription.startDate.toISOString(),
            endDate: subscription.endDate?.toISOString() || null,
            nextBillingDate: subscription.nextBillingDate?.toISOString() || null,
            frequency: subscription.frequency,
            currentPricing: subscription.pricing,
            preferences: subscription.preferences,
            updatedAt: subscription.updatedAt.toISOString(),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[BOX_SUBSCRIPTION_UPDATE_PATCH]", error, { storeId, subscriptionId: params.id });
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 },
      );
    }
  },
);

// DELETE /api/box-subscriptions/subscriptions/[id] - Cancel subscription
export const DELETE = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (_, { storeId, params }) => {
    try {
      const { id } = params;

      // Check if subscription exists and belongs to store
      const subscription = await prisma.boxSubscription.findUnique({
        where: { id, storeId },
        select: { 
          status: true,
          boxId: true,
        },
      });

      if (!subscription) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 },
        );
      }

      if (subscription.status === "cancelled") {
        return NextResponse.json(
          { error: "Subscription is already cancelled" },
          { status: 400 },
        );
      }

      // Cancel the subscription
      const cancelledSubscription = await prisma.boxSubscription.update({
        where: { id },
        data: {
          status: "cancelled",
          endDate: new Date(),
          nextBillingDate: null,
          history: {
            push: {
              status: "cancelled",
              date: new Date().toISOString(),
              reason: "Subscription cancelled",
            },
          },
        },
      });

      // Update box stats
      await prisma.subscriptionBox.update({
        where: { id: subscription.boxId },
        data: {
          stats: {
            decrement: {
              activeSubscribers: 1,
            },
            increment: {
              cancelledSubscribers: 1,
            },
          },
        },
      });

      return NextResponse.json(
        { 
          message: "Subscription cancelled successfully",
          subscription: {
            id: cancelledSubscription.id,
            status: "cancelled",
            endDate: new Date().toISOString(),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[BOX_SUBSCRIPTION_CANCEL_DELETE]", error, { storeId, subscriptionId: params.id });
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
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

// Helper function to determine stat changes for box
function getStatChange(oldStatus: string, newStatus: string): any {
  if (oldStatus === "active" && newStatus === "paused") {
    return {
      decrement: { activeSubscribers: 1 },
      increment: { pausedSubscribers: 1 },
    };
  }
  
  if (oldStatus === "paused" && newStatus === "active") {
    return {
      decrement: { pausedSubscribers: 1 },
      increment: { activeSubscribers: 1 },
    };
  }
  
  if (oldStatus === "active" && newStatus === "cancelled") {
    return {
      decrement: { activeSubscribers: 1 },
      increment: { cancelledSubscribers: 1 },
    };
  }
  
  return null;
}