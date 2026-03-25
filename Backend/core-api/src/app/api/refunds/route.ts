import { NextRequest as _NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Paystack } from "@vayva/payments";

// GET /api/refunds - List refunds with filters
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "REQUESTED"
      | "APPROVED"
      | "REJECTED"
      | "PROCESSING"
      | "SUCCESS"
      | "FAILED"
      | "CANCELLED"
      | null;
    const orderId = searchParams.get("orderId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    const refunds = await prisma.refund.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerId: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.refund.count({ where });

    return NextResponse.json({
      refunds: refunds.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        orderNumber: r.order.orderNumber,
        customerId: r.order.customerId,
        customer: r.order.customer,
        amount: r.amount,
        currency: r.currency,
        reason: r.reason,
        status: r.status,
        providerRefundId: r.providerRefundId,
        processedAt: r.processedAt,
        failureCode: r.failureCode,
        failureMessage: r.failureMessage,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    });
  }
);

// POST /api/refunds - Create new refund request
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      orderId: z.string().uuid(),
      amount: z.number().min(0.01),
      reason: z.string().min(1).max(500),
      paymentTransactionId: z.string().uuid().optional(),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { orderId, amount, reason, paymentTransactionId } =
      validated.data;

    // Verify order exists and belongs to store
    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        paymentTransactions: {
          select: { id: true, reference: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is paid
    const validPaymentStatuses = ["CAPTURED", "PARTIALLY_REFUNDED"] as const;
    if (!validPaymentStatuses.includes(order.paymentStatus as typeof validPaymentStatuses[number])) {
      return NextResponse.json(
        { error: "Cannot refund unpaid order" },
        { status: 400 }
      );
    }

    // Check if refund amount is valid
    const totalPaid = order.total;
    const existingRefunds = await prisma.refund.aggregate({
      where: { orderId, status: { in: ["APPROVED", "SUCCESS"] } },
      _sum: { amount: true },
    });
    const totalRefunded = existingRefunds._sum.amount || 0;
    const maxRefundable = Number(totalPaid) - Number(totalRefunded);

    if (amount > maxRefundable) {
      return NextResponse.json(
        {
          error: "Refund amount exceeds refundable amount",
          maxRefundable,
        },
        { status: 400 }
      );
    }

    // Get payment transaction for refund
    const paymentTx =
      paymentTransactionId
        ? order.paymentTransactions.find((p) => p.id === paymentTransactionId)
        : order.paymentTransactions[0];

    if (!paymentTx && !paymentTransactionId) {
      return NextResponse.json(
        { error: "No payment transaction found for refund" },
        { status: 400 }
      );
    }

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        storeId,
        orderId,
        paymentTransactionId: paymentTx?.id || paymentTransactionId,
        amount,
        reason,
        status: "REQUESTED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        refund,
      },
      { status: 201 }
    );
  }
);

// PATCH /api/refunds - Approve or reject refund
export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      id: z.string().uuid(),
      action: z.enum(["approve", "reject", "process"]),
      notes: z.string().optional(),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { id, action, notes } = validated.data;

    // Find refund
    const refund = await prisma.refund.findFirst({
      where: { id, storeId },
    });

    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    if (refund.status === "SUCCESS") {
      return NextResponse.json(
        { error: "Refund already processed" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      const updatedRefund = await prisma.refund.update({
        where: { id },
        data: {
          status: "FAILED",
          reason: notes ? `${refund.reason} | Rejection: ${notes}` : refund.reason,
        },
      });

      return NextResponse.json({
        success: true,
        refund: updatedRefund,
      });
    }

    if (action === "approve") {
      const updatedRefund = await prisma.refund.update({
        where: { id },
        data: {
          status: "APPROVED",
        },
      });

      return NextResponse.json({
        success: true,
        refund: updatedRefund,
      });
    }

    if (action === "process") {
      if (refund.status !== "APPROVED") {
        return NextResponse.json(
          { error: "Refund must be approved before processing" },
          { status: 400 }
        );
      }

      // Get the payment transaction reference for Paystack
      const paymentTx = refund.paymentTransactionId
        ? await prisma.paymentTransaction.findUnique({ 
            where: { id: refund.paymentTransactionId },
            select: { reference: true },
          })
        : null;

      const transactionRef = paymentTx?.reference;

      if (!transactionRef) {
        return NextResponse.json(
          { error: "No provider transaction reference found for refund" },
          { status: 400 }
        );
      }

      try {
        // Call Paystack to process the refund
        const paystackRefund = await Paystack.createRefund({
          transaction: transactionRef,
          amount: Number(refund.amount) * 100, // Convert to kobo
          merchant_note: refund.reason || undefined,
        });

        const updatedRefund = await prisma.refund.update({
          where: { id },
          data: {
            status: "SUCCESS",
            processedAt: new Date(),
            providerRefundId: paystackRefund.id,
          },
        });

        // Update order payment status if full refund
        const totalRefunds = await prisma.refund.aggregate({
          where: { orderId: refund.orderId, status: "SUCCESS" },
          _sum: { amount: true },
        });

        const order = await prisma.order.findUnique({
          where: { id: refund.orderId },
          select: { total: true },
        });

        if (order && totalRefunds._sum.amount) {
          const totalRefunded = Number(totalRefunds._sum.amount);
          const orderTotal = Number(order.total);

          if (totalRefunded >= orderTotal) {
            await prisma.order.update({
              where: { id: refund.orderId },
              data: { paymentStatus: "REFUNDED" },
            });
          }
          // Note: Partial refund tracking is handled by comparing totalRefunded to orderTotal
          // The paymentStatus remains as REFUNDED once any refund occurs
        }

        return NextResponse.json({
          success: true,
          refund: updatedRefund,
          providerRefund: {
            id: paystackRefund.id,
            status: paystackRefund.status,
            amount: paystackRefund.amount,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Refund processing failed";

        await prisma.refund.update({
          where: { id },
          data: {
            status: "FAILED",
            failureCode: "PAYSTACK_ERROR",
            failureMessage: errorMessage,
          },
        });

        return NextResponse.json(
          { error: "Failed to process refund with payment provider", details: errorMessage },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
);
