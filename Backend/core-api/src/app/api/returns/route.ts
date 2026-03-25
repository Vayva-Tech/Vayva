import { NextRequest as _NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { z } from "zod";
import { PERMISSIONS } from "@/lib/team/permissions";

// GET /api/returns - List return requests with filters
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId }) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as
      | "REQUESTED"
      | "APPROVED"
      | "REJECTED"
      | "IN_TRANSIT"
      | "RECEIVED"
      | "INSPECTED"
      | "COMPLETED"
      | "CANCELLED"
      | null;
    const orderId = searchParams.get("orderId");
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const returns = await prisma.returnRequest.findMany({
      where,
      include: {
        items: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.returnRequest.count({ where });

    return NextResponse.json({
      returns: returns.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        orderNumber: null,
        customerId: r.customerId,
        customer: null,
        reasonCode: r.reasonCode,
        reasonText: r.reasonText,
        resolutionType: r.resolutionType,
        status: r.status,
        shippingLabel: r.shippingLabel,
        trackingNumber: r.trackingNumber,
        approvedBy: r.approvedBy,
        approvedAt: r.approvedAt,
        receivedAt: r.receivedAt,
        inspectedAt: r.inspectedAt,
        inspectedBy: r.inspectedBy,
        inspectionNotes: r.inspectionNotes,
        refundAmount: r.refundAmount,
        refundMethod: r.refundMethod,
        refundIssuedAt: r.refundIssuedAt,
        exchangeOrderId: r.exchangeOrderId,
        returnShippingCost: r.returnShippingCost,
        restockingFee: r.restockingFee,
        items: r.items.map((item) => ({
          id: item.id,
          orderItemId: item.orderItemId,
          product: null,
          variant: null,
          quantity: item.quantity,
          reasonCode: item.reasonCode,
          condition: item.condition,
          refundPrice: item.refundPrice,
          isResellable: item.isResellable,
          restockingFee: item.restockingFee,
        })),
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

// POST /api/returns - Create new return request
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId }) => {
    const body = await req.json();

    const schema = z.object({
      orderId: z.string().uuid(),
      customerId: z.string().uuid(),
      reasonCode: z.enum([
        "DEFECTIVE",
        "WRONG_ITEM",
        "NOT_AS_DESCRIBED",
        "CHANGED_MIND",
        "ARRIVED_LATE",
        "OTHER",
      ]),
      reasonText: z.string().optional(),
      resolutionType: z.enum(["REFUND", "EXCHANGE", "STORE_CREDIT", "REPAIR"]).default("REFUND"),
      items: z.array(
        z.object({
          orderItemId: z.string().uuid(),
          quantity: z.number().int().min(1),
          reasonCode: z.enum([
            "DEFECTIVE",
            "WRONG_ITEM",
            "NOT_AS_DESCRIBED",
            "CHANGED_MIND",
            "ARRIVED_LATE",
            "OTHER",
          ]),
        })
      ).min(1),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { orderId, customerId, reasonCode, reasonText, resolutionType, items } = validated.data;

    // Verify order exists and belongs to store
    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify items belong to order
    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
      if (!orderItem) {
        return NextResponse.json(
          { error: `Order item ${item.orderItemId} not found in order` },
          { status: 400 }
        );
      }
      if (item.quantity > orderItem.quantity) {
        return NextResponse.json(
          { error: `Return quantity exceeds order quantity for item ${item.orderItemId}` },
          { status: 400 }
        );
      }
    }

    // Create return request in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create return request
      const returnRequest = await tx.returnRequest.create({
        data: {
          storeId,
          merchantId: storeId, // For now, merchantId = storeId
          orderId,
          customerId,
          reasonCode,
          reasonText,
          resolutionType,
          status: "REQUESTED",
        },
      });

      // Create return items
      const returnItems = await Promise.all(
        items.map(async (item) => {
          const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
          const refundPrice = orderItem?.price || 0;

          return tx.returnItem.create({
            data: {
              returnId: returnRequest.id,
              orderItemId: item.orderItemId,
              productId: orderItem?.productId || "",
              quantity: item.quantity,
              reasonCode: item.reasonCode,
              refundPrice,
            },
          });
        })
      );

      return { returnRequest, returnItems };
    });

    return NextResponse.json(
      {
        success: true,
        return: result.returnRequest,
        items: result.returnItems,
      },
      { status: 201 }
    );
  }
);

// PATCH /api/returns - Update return request status
export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, user }) => {
    const body = await req.json();

    const schema = z.object({
      id: z.string().uuid(),
      action: z.enum([
        "approve",
        "reject",
        "mark_shipped",
        "mark_received",
        "inspect",
        "refund",
        "exchange",
      ]),
      notes: z.string().optional(),
      shippingLabel: z.string().optional(),
      trackingNumber: z.string().optional(),
      inspectionNotes: z.string().optional(),
      itemConditions: z
        .array(
          z.object({
            itemId: z.string().uuid(),
            condition: z.enum(["new", "like_new", "good", "fair", "damaged", "unsellable"]),
            isResellable: z.boolean(),
            restockingFee: z.number().min(0).optional(),
          })
        )
        .optional(),
      refundAmount: z.number().min(0).optional(),
      refundMethod: z.enum(["original", "store_credit", "wallet"]).optional(),
      exchangeOrderId: z.string().uuid().optional(),
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
      notes,
      shippingLabel,
      trackingNumber,
      inspectionNotes,
      itemConditions,
      refundAmount,
      refundMethod,
      exchangeOrderId,
    } = validated.data;

    // Find return request
    const returnRequest = await prisma.returnRequest.findFirst({
      where: { id, storeId },
      include: { items: true },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: "Return request not found" }, { status: 404 });
    }

    const userId = user.id;

    switch (action) {
      case "approve":
        if (returnRequest.status !== "REQUESTED") {
          return NextResponse.json(
            { error: "Can only approve requested returns" },
            { status: 400 }
          );
        }

        await prisma.returnRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            approvedBy: userId,
            approvedAt: new Date(),
            shippingLabel,
            trackingNumber,
          },
        });
        break;

      case "reject":
        if (returnRequest.status !== "REQUESTED") {
          return NextResponse.json(
            { error: "Can only reject requested returns" },
            { status: 400 }
          );
        }

        await prisma.returnRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            inspectionNotes: notes || returnRequest.inspectionNotes,
          },
        });
        break;

      case "mark_shipped":
        if (returnRequest.status !== "APPROVED") {
          return NextResponse.json(
            { error: "Return must be approved before shipping" },
            { status: 400 }
          );
        }

        await prisma.returnRequest.update({
          where: { id },
          data: {
            status: "IN_TRANSIT",
            trackingNumber: trackingNumber || returnRequest.trackingNumber,
          },
        });
        break;

      case "mark_received":
        if (returnRequest.status !== "IN_TRANSIT" && returnRequest.status !== "APPROVED") {
          return NextResponse.json(
            { error: "Return must be shipped before receiving" },
            { status: 400 }
          );
        }

        await prisma.returnRequest.update({
          where: { id },
          data: {
            status: "RECEIVED",
            receivedAt: new Date(),
          },
        });
        break;

      case "inspect": {
        if (returnRequest.status !== "RECEIVED") {
          return NextResponse.json(
            { error: "Return must be received before inspection" },
            { status: 400 }
          );
        }

        // Update item conditions
        if (itemConditions) {
          await Promise.all(
            itemConditions.map((item) =>
              prisma.returnItem.update({
                where: { id: item.itemId },
                data: {
                  condition: item.condition,
                  isResellable: item.isResellable,
                  restockingFee: item.restockingFee || 0,
                },
              })
            )
          );
        }

        // Calculate total restocking fees
        const updatedItems = await prisma.returnItem.findMany({
          where: { returnId: id },
        });
        const totalRestockingFee = updatedItems.reduce(
          (sum, item) => sum + Number(item.restockingFee),
          0
        );

        await prisma.returnRequest.update({
          where: { id },
          data: {
            status: "INSPECTED",
            inspectedAt: new Date(),
            inspectedBy: userId,
            inspectionNotes,
            restockingFee: totalRestockingFee,
          },
        });
        break;
      }

      case "refund": {
        if (returnRequest.status !== "INSPECTED") {
          return NextResponse.json(
            { error: "Return must be inspected before refund" },
            { status: 400 }
          );
        }

        if (!refundAmount) {
          return NextResponse.json(
            { error: "Refund amount is required" },
            { status: 400 }
          );
        }

        await prisma.returnRequest.update({
          where: { id },
          data: {
            status: "COMPLETED",
            refundAmount,
            refundMethod: refundMethod || "original",
            refundIssuedAt: new Date(),
          },
        });
        break;
      }

      case "exchange":
        if (returnRequest.status !== "INSPECTED") {
          return NextResponse.json(
            { error: "Return must be inspected before exchange" },
            { status: 400 }
          );
        }

        if (!exchangeOrderId) {
          return NextResponse.json(
            { error: "Exchange order ID is required" },
            { status: 400 }
          );
        }

        await prisma.returnRequest.update({
          where: { id },
          data: {
            status: "COMPLETED",
            exchangeOrderId,
          },
        });
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Return ${action}d successfully`,
    });
  }
);
