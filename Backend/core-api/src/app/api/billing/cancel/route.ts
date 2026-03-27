import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

interface CancellationRequest {
  reason: string;
  reasonOther?: string;
  feedback?: string;
  effectiveDate?: string;
  exportData?: boolean;
}

const RETENTION_OFFERS = {
  TOO_EXPENSIVE: {
    type: "discount",
    value: 20,
    durationMonths: 3,
    message: "Get 20% off for 3 months - We value your business!",
  },
  MISSING_FEATURES: {
    type: "success_call",
    message: "Let our success team show you features you're missing",
  },
  TECHNICAL_ISSUES: {
    type: "support",
    message: "Our CTO will personally resolve your technical issues",
  },
  SWITCHING_COMPETITOR: {
    type: "discount",
    value: 50,
    durationMonths: 2,
    message: "Match any competitor price + 50% off for 2 months",
  },
  BUSINESS_CLOSED: {
    type: "pause",
    message: "Pause your account for ₦5,000/month to keep your data",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

// POST /api/billing/cancel - Process subscription cancellation with retention
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const reason = getString(body.reason);
      const reasonOther = getString(body.reasonOther);
      const feedback = getString(body.feedback);
      const effectiveDate = getString(body.effectiveDate) || "end_of_period";
      const exportData = getBoolean(body.exportData);

      // Validate reason
      const validReasons = [
        "too_expensive",
        "missing_features",
        "technical_issues",
        "switching_competitor",
        "business_closed",
        "other",
      ];

      if (!reason || !validReasons.includes(reason)) {
        return NextResponse.json({ error: "Invalid cancellation reason" }, { status: 400 });
      }

      // Get current subscription details
      const [store, currentSubscription] = await Promise.all([
        prisma.store.findUnique({
          where: { id: storeId },
          include: {
            subscriptions: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        }),
        prisma.merchantAiSubscription.findUnique({
          where: { storeId },
        }),
      ]);

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const currentPlan = store.plan || "STARTER";
      
      // Skip retention offers for FREE plan
      if (currentPlan === "FREE") {
        return NextResponse.json(
          { error: "FREE plan cannot be cancelled" },
          { status: 400 }
        );
      }

      // Generate retention offer based on reason
      const reasonKey = reason.toUpperCase() as keyof typeof RETENTION_OFFERS;
      const retentionOffer = RETENTION_OFFERS[reasonKey];

      // Calculate end date based on effective date preference
      let endDate: Date;
      if (effectiveDate === "immediate") {
        endDate = new Date();
      } else if (currentSubscription?.periodEnd) {
        endDate = new Date(currentSubscription.periodEnd);
      } else {
        // Default to 30 days from now
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
      }

      // Create cancellation record
      const cancellation = await prisma.subscriptionCancellation.create({
        data: {
          storeId,
          requestedBy: user.id,
          reason: reason as any, // Assuming enum exists in schema
          reasonOther,
          feedback,
          status: "PENDING",
          scheduledEndDate: endDate,
          retentionOfferAccepted: false,
          exportDataRequested: exportData,
        },
      });

      // Generate data export package if requested
      let exportPackage;
      if (exportData) {
        try {
          const [products, customers, orders] = await Promise.all([
            prisma.product.findMany({
              where: { storeId },
              take: 1000, // Limit for export
            }),
            prisma.customer.findMany({
              where: { storeId },
              take: 1000,
            }),
            prisma.order.findMany({
              where: { storeId },
              take: 1000,
              include: { items: true },
            }),
          ]);

          exportPackage = {
            products: products.map(p => ({
              name: p.name,
              price: p.price,
              description: p.description,
              category: p.category,
            })),
            customers: customers.map(c => ({
              name: c.name,
              email: c.email,
              phone: c.phone,
            })),
            orders: orders.map(o => ({
              orderNumber: o.orderNumber,
              total: o.total,
              status: o.status,
              createdAt: o.createdAt,
              items: o.items.map(i => ({
                productName: i.productName,
                quantity: i.quantity,
                price: i.price,
              })),
            })),
          };

          // In production, this would generate a CSV/JSON file and upload to S3
          // For now, we'll just store it in the database
          await prisma.dataExport.create({
            data: {
              storeId,
              requestedBy: user.id,
              exportType: "CANCELLATION",
              status: "COMPLETED",
              data: exportPackage as any,
              cancellationId: cancellation.id,
            },
          });
        } catch (error) {
          logger.error("[DATA_EXPORT_ERROR]", error, { storeId });
          // Continue with cancellation even if export fails
        }
      }

      // Determine next steps based on retention strategy
      let requiresAction = false;
      let nextSteps: string[] = [];

      if (retentionOffer) {
        requiresAction = true;
        nextSteps.push("review_retention_offer");
        
        if (retentionOffer.type === "success_call" || retentionOffer.type === "support") {
          // Create support ticket for high-touch retention
          await prisma.supportTicket.create({
            data: {
              storeId,
              userId: user.id,
              type: "RETENTION",
              priority: "HIGH",
              subject: `Retention Opportunity - ${store.slug}`,
              description: `Customer cancelling due to: ${reason}\n\nFeedback: ${feedback || "N/A"}\n\nRetention action required: ${retentionOffer.message}`,
              status: "OPEN",
            },
          });
          
          nextSteps.push("success_team_contact");
        }
      }

      // Schedule cancellation worker job
      // In production, this would add a job to a queue
      // For now, we'll rely on the scheduled date
      logger.info("[CANCELLATION_SCHEDULED]", {
        storeId,
        userId: user.id,
        reason,
        endDate,
        retentionOffer: retentionOffer?.type,
        exportData,
      });

      // Send confirmation email (in production, trigger via queue)
      // await sendCancellationEmail(user.email, {
      //   storeName: store.slug,
      //   endDate,
      //   retentionOffer,
      //   exportPackage,
      // });

      return NextResponse.json({
        success: true,
        data: {
          cancellationId: cancellation.id,
          currentPlan,
          endDate: endDate.toISOString(),
          gracePeriodDays: Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          retentionOffer: retentionOffer ? {
            type: retentionOffer.type,
            message: retentionOffer.message,
            ...(retentionOffer.type === "discount" && {
              discount: retentionOffer.value,
              durationMonths: retentionOffer.durationMonths,
            }),
          } : null,
          exportPackage: exportPackage ? {
            status: "READY",
            itemCount: {
              products: exportPackage.products.length,
              customers: exportPackage.customers.length,
              orders: exportPackage.orders.length,
            },
          } : null,
          nextSteps,
        },
        message: "Cancellation request received. Please review your retention offer.",
        requiresAction,
      });
    } catch (error: unknown) {
      logger.error("[CANCELLATION_POST]", error, { storeId });
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: "Database error", details: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

// GET /api/billing/cancel/options - Get cancellation options and retention offers
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const currentPlan = store.plan || "STARTER";
      
      // Get retention offers
      const offers = Object.entries(RETENTION_OFFERS).map(([key, offer]) => ({
        reason: key.toLowerCase(),
        ...offer,
      }));

      return NextResponse.json({
        success: true,
        data: {
          currentPlan,
          retentionOffers: offers,
          cancellationReasons: [
            { value: "too_expensive", label: "Too expensive" },
            { value: "missing_features", label: "Missing needed features" },
            { value: "technical_issues", label: "Technical problems" },
            { value: "switching_competitor", label: "Switching to competitor" },
            { value: "business_closed", label: "Business closed/paused" },
            { value: "other", label: "Other" },
          ],
        },
      });
    } catch (error: unknown) {
      logger.error("[CANCELLATION_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
