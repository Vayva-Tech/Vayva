import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const createRFQSchema = z.object({
  customerId: z.string().uuid(),
  dueDate: z.string().datetime().optional(),
  deliveryDate: z.string().datetime().optional(),
  deliveryLocation: z.string().max(500).optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().max(2000).optional(),
  attachments: z.array(z.string().url()).default([]),
  items: z.array(z.object({
    productId: z.string().uuid().optional(),
    description: z.string().min(1).max(500),
    quantity: z.number().int().positive(),
    targetPrice: z.number().positive().optional(),
    specifications: z.string().max(1000).optional(),
  })).min(1),
});

const quoteSchema = z.object({
  rfqId: z.string().uuid(),
  itemQuotes: z.array(z.object({
    itemId: z.string().uuid(),
    quotedPrice: z.number().positive(),
    quotedQuantity: z.number().int().positive().optional(),
    notes: z.string().optional(),
  })),
});

const updateStatusSchema = z.object({
  status: z.enum(["open", "quoted", "accepted", "rejected", "expired"]),
});

function generateRFQNumber(storeId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const storeShort = storeId.slice(0, 4).toUpperCase();
  return `RFQ-${storeShort}-${timestamp}`;
}

/**
 * GET /api/b2b/rfq
 * List RFQ requests
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [rfqs, total] = await Promise.all([
      prisma.rFQRequest.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.rFQRequest.count({ where }),
    ]);

    return NextResponse.json({
      rfqs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + rfqs.length < total,
      },
    });
  } catch (error) {
    logger.error("[RFQ_GET] Failed to fetch RFQs", { error });
    return NextResponse.json(
      { error: "Failed to fetch RFQs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/b2b/rfq
 * Create new RFQ request
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = createRFQSchema.parse(body);

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const rfqNumber = generateRFQNumber(storeId);

    const rfq = await prisma.rFQRequest.create({
      data: {
        storeId,
        customerId: validated.customerId,
        rfqNumber,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        deliveryDate: validated.deliveryDate ? new Date(validated.deliveryDate) : null,
        deliveryLocation: validated.deliveryLocation,
        paymentTerms: validated.paymentTerms,
        notes: validated.notes,
        attachments: validated.attachments,
        items: {
          create: validated.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            targetPrice: item.targetPrice,
            specifications: item.specifications,
          })),
        },
      },
      include: { items: true },
    });

    logger.info("[RFQ_POST] RFQ created", {
      rfqId: rfq.id,
      rfqNumber,
      storeId,
      itemCount: validated.items.length,
    });

    return NextResponse.json({ rfq }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[RFQ_POST] Failed to create RFQ", { error });
    return NextResponse.json(
      { error: "Failed to create RFQ" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/b2b/rfq
 * Update RFQ status
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "RFQ ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = updateStatusSchema.parse(body);

    const rfq = await prisma.rFQRequest.update({
      where: { id },
      data: {
        status: validated.status,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    logger.info("[RFQ_PATCH] RFQ status updated", {
      rfqId: id,
      status: validated.status,
    });

    return NextResponse.json({ rfq });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[RFQ_PATCH] Failed to update RFQ", { error });
    return NextResponse.json(
      { error: "Failed to update RFQ" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/b2b/rfq/quote
 * Submit quote for RFQ items
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = quoteSchema.parse(body);

    const rfq = await prisma.rFQRequest.findUnique({
      where: { id: validated.rfqId },
      include: { items: true },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      );
    }

    // Update item quotes
    for (const quote of validated.itemQuotes) {
      await prisma.rFQItem.update({
        where: { id: quote.itemId },
        data: {
          quotedPrice: quote.quotedPrice,
          quotedQuantity: quote.quotedQuantity,
          status: "quoted",
          notes: quote.notes || undefined,
        },
      });
    }

    // Update RFQ status and total
    const totalValue = validated.itemQuotes.reduce((sum: number, q) => sum + q.quotedPrice, 0);
    
    const updatedRFQ = await prisma.rFQRequest.update({
      where: { id: validated.rfqId },
      data: {
        status: "quoted",
        totalValue,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    logger.info("[RFQ_QUOTE] Quote submitted", {
      rfqId: validated.rfqId,
      itemCount: validated.itemQuotes.length,
      totalValue,
    });

    return NextResponse.json({
      rfq: updatedRFQ,
      quotedBy: "Staff",
      quotedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[RFQ_QUOTE] Failed to submit quote", { error });
    return NextResponse.json(
      { error: "Failed to submit quote" },
      { status: 500 }
    );
  }
}
