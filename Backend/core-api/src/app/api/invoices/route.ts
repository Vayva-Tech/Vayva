import { NextRequest as _NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, type Prisma } from "@vayva/db";
import { z } from "zod";

// GET /api/invoices - List invoices with filters
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_VIEW,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "DRAFT"
      | "PENDING"
      | "PAID"
      | "OVERDUE"
      | "CANCELED"
      | "REFUNDED"
      | null;
    const subscriptionId = searchParams.get("subscriptionId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (subscriptionId) {
      where.subscriptionId = subscriptionId;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const invoices = await prisma.invoiceV2.findMany({
      where,
      include: {
        subscription: {
          select: {
            planKey: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.invoiceV2.count({ where });
    const totalAmount = await prisma.invoiceV2.aggregate({
      where,
      _sum: { totalKobo: true },
    });

    return NextResponse.json({
      invoices: invoices.map((i) => ({
        id: i.id,
        subscriptionId: i.subscriptionId,
        plan: i.subscription?.planKey,
        amount: Number(i.totalKobo) / 100,
        currency: "NGN",
        status: i.status,
        dueDate: i.dueDate,
        paidAt: null,
        paidVia: null,
        providerRef: null,
        items: i.items,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
      summary: {
        total: totalCount,
        totalAmount: Number(totalAmount._sum.totalKobo || 0) / 100,
      },
      pagination: {
        limit,
        offset,
      },
    });
  }
);

// POST /api/invoices - Create new invoice
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      subscriptionId: z.string().uuid().optional(),
      amount: z.number().min(0.01),
      currency: z.string().default("NGN"),
      dueDate: z.string().datetime().optional(),
      items: z.array(
        z.object({
          description: z.string(),
          amount: z.number(),
          quantity: z.number().int().default(1),
        })
      ).min(1),
      metadata: z.record(z.unknown()).optional(),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const {
      subscriptionId,
      amount,
      currency: _currency,
      dueDate,
      items,
      metadata: _metadata,
    } = validated.data;

    // Calculate total from items
    const itemTotal = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    if (Math.abs(itemTotal - amount) > 0.01) {
      return NextResponse.json(
        { error: "Amount does not match item total" },
        { status: 400 }
      );
    }

    // If subscriptionId provided, verify it belongs to store
    if (subscriptionId) {
      const subscription = await prisma.subscription.findFirst({
        where: { id: subscriptionId, storeId },
      });
      if (!subscription) {
        return NextResponse.json(
          { error: "Subscription not found" },
          { status: 404 }
        );
      }
    }

    const invoice = await prisma.invoiceV2.create({
      data: {
        store: { connect: { id: storeId } },
        ...(subscriptionId
          ? { subscription: { connect: { id: subscriptionId } } }
          : {}),
        invoiceNumber: `INV-${Date.now()}`,
        totalKobo: BigInt(Math.round(amount * 100)),
        subtotalKobo: BigInt(Math.round(amount * 100)),
        taxKobo: BigInt(0),
        status: "DRAFT",
        dueDate: dueDate
          ? new Date(dueDate)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        items: (items ?? []) as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(
      {
        success: true,
        invoice: {
          id: invoice.id,
          amount: Number(invoice.totalKobo) / 100,
          currency: "NGN",
          status: invoice.status,
          dueDate: invoice.dueDate,
          items: invoice.items,
        },
      },
      { status: 201 }
    );
  }
);

// PATCH /api/invoices - Update invoice status or mark as paid
export const PATCH = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      id: z.string().uuid(),
      action: z.enum(["mark_paid", "mark_overdue", "cancel", "refund"]),
      paymentMethod: z.enum(["card", "bank_transfer", "wallet", "ussd", "cash"]).optional(),
      providerRef: z.string().optional(),
      refundReason: z.string().optional(),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const {
      id,
      action,
      paymentMethod: _paymentMethod,
      providerRef: _providerRef,
      refundReason: _refundReason,
    } = validated.data;

    // Find invoice
    const invoice = await prisma.invoiceV2.findFirst({
      where: { id, storeId },
      include: { subscription: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    switch (action) {
      case "mark_paid": {
        if (invoice.status === "PAID") {
          return NextResponse.json(
            { error: "Invoice is already paid" },
            { status: 400 }
          );
        }

        const paidInvoice = await prisma.invoiceV2.update({
          where: { id },
          data: {
            status: "PAID",
          },
        });

        // Update subscription period if this is a subscription invoice
        if (invoice.subscription) {
          const now = new Date();
          await prisma.subscription.update({
            where: { id: invoice.subscription.id },
            data: {
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
              gracePeriodEndsAt: null,
            },
          });
        }

        return NextResponse.json({
          success: true,
          invoice: paidInvoice,
        });
      }

      case "mark_overdue": {
        if (invoice.status !== "SENT") {
          return NextResponse.json(
            { error: "Can only mark sent invoices as overdue" },
            { status: 400 }
          );
        }

        const overdueInvoice = await prisma.invoiceV2.update({
          where: { id },
          data: { status: "OVERDUE" },
        });

        // Create dunning attempt if this is a subscription invoice
        if (invoice.subscription) {
          await prisma.dunningAttempt.create({
            data: {
              storeId,
              subscriptionId: invoice.subscription.id,
              attemptNumber: 1,
              status: "FAILED",
              nextAttemptAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
          });

          // Update subscription to past due if not already
          if (invoice.subscription.status === "ACTIVE") {
            await prisma.subscription.update({
              where: { id: invoice.subscription.id },
              data: {
                status: "PAST_DUE",
                gracePeriodEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }

        return NextResponse.json({
          success: true,
          invoice: overdueInvoice,
        });
      }

      case "cancel": {
        if (invoice.status === "PAID" || invoice.status === "CANCELLED") {
          return NextResponse.json(
            { error: "Cannot cancel paid or already cancelled invoices" },
            { status: 400 }
          );
        }

        const canceledInvoice = await prisma.invoiceV2.update({
          where: { id },
          data: { status: "CANCELLED" },
        });

        return NextResponse.json({
          success: true,
          invoice: canceledInvoice,
        });
      }

      case "refund": {
        if (invoice.status !== "PAID") {
          return NextResponse.json(
            { error: "Can only refund paid invoices" },
            { status: 400 }
          );
        }

        const refundedInvoice = await prisma.invoiceV2.update({
          where: { id },
          data: {
            status: "PAID",
          },
        });

        return NextResponse.json({
          success: true,
          invoice: refundedInvoice,
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
);
