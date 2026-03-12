import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const pricingTierSchema = z.object({
  productId: z.string().uuid(),
  minQuantity: z.number().int().positive(),
  maxQuantity: z.number().int().positive().optional(),
  price: z.number().positive(),
});

const calculateSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

/**
 * GET /api/b2b/volume-pricing?productId=xxx
 * Get volume pricing tiers for a product
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    const tiers = await prisma.volumePricingTier.findMany({
      where: { productId, isActive: true },
      orderBy: { minQuantity: "asc" },
    });

    return NextResponse.json({ tiers });
  } catch (error: unknown) {
    logger.error("[VOLUME_PRICING_GET] Failed to fetch tiers", { error });
    return NextResponse.json(
      { error: "Failed to fetch pricing tiers" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/b2b/volume-pricing
 * Create volume pricing tier
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = pricingTierSchema.parse(body);

    // Validate tier doesn't overlap
    const existingTiers = await prisma.volumePricingTier.findMany({
      where: {
        productId: validated.productId,
        isActive: true,
      },
    });

    for (const tier of existingTiers) {
      const newMin = validated.minQuantity;
      const newMax = validated.maxQuantity || Infinity;
      const existingMin = tier.minQuantity;
      const existingMax = tier.maxQuantity || Infinity;

      if (
        (newMin >= existingMin && newMin <= existingMax) ||
        (newMax >= existingMin && newMax <= existingMax) ||
        (newMin <= existingMin && newMax >= existingMax)
      ) {
        return NextResponse.json({
          error: "Pricing tier overlaps with existing tier",
          existingTier: {
            min: tier.minQuantity,
            max: tier.maxQuantity,
            price: tier.price,
          },
        }, { status: 409 });
      }
    }

    const tier = await prisma.volumePricingTier.create({
      data: validated,
    });

    logger.info("[VOLUME_PRICING_POST] Tier created", {
      tierId: tier.id,
      productId: validated.productId,
      minQty: validated.minQuantity,
    });

    return NextResponse.json({ tier }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[VOLUME_PRICING_POST] Failed to create tier", { error });
    return NextResponse.json(
      { error: "Failed to create pricing tier" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/b2b/volume-pricing/calculate
 * Calculate price based on quantity
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validated = calculateSchema.parse(body);

    // Get all active tiers for product
    const tiers = await prisma.volumePricingTier.findMany({
      where: {
        productId: validated.productId,
        isActive: true,
      },
      orderBy: { minQuantity: "asc" },
    });

    // Find applicable tier
    let applicableTier = null;
    for (const tier of tiers) {
      const minQty = tier.minQuantity;
      const maxQty = tier.maxQuantity || Infinity;

      if (validated.quantity >= minQty && validated.quantity <= maxQty) {
        applicableTier = tier;
        break;
      }
    }

    if (!applicableTier) {
      return NextResponse.json({
        error: "No pricing tier found for quantity",
        quantity: validated.quantity,
        availableTiers: tiers.map((t: any) => ({
          min: t.minQuantity,
          max: t.maxQuantity,
          price: t.price,
        })),
      }, { status: 404 });
    }

    const totalPrice = Number(applicableTier.price) * validated.quantity;
    const savings = tiers[0]
      ? (Number(tiers[0].price) - Number(applicableTier.price)) * validated.quantity
      : 0;

    return NextResponse.json({
      productId: validated.productId,
      quantity: validated.quantity,
      unitPrice: applicableTier.price,
      totalPrice,
      savings: savings > 0 ? savings : 0,
      tier: {
        id: applicableTier.id,
        minQuantity: applicableTier.minQuantity,
        maxQuantity: applicableTier.maxQuantity,
      },
      allTiers: tiers.map((t: any) => ({
        min: t.minQuantity,
        max: t.maxQuantity,
        price: t.price,
        savingsPercent: tiers[0]
          ? Math.round((1 - Number(t.price) / Number(tiers[0].price)) * 100)
          : 0,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[VOLUME_PRICING_CALCULATE] Failed to calculate", { error });
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/b2b/volume-pricing?id=xxx
 * Deactivate pricing tier
 */
export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Tier ID required" },
        { status: 400 }
      );
    }

    await prisma.volumePricingTier.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info("[VOLUME_PRICING_DELETE] Tier deactivated", { tierId: id });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("[VOLUME_PRICING_DELETE] Failed to deactivate", { error });
    return NextResponse.json(
      { error: "Failed to deactivate tier" },
      { status: 500 }
    );
  }
}
