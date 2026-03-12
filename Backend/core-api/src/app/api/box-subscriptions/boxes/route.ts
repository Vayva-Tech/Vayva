import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SubscriptionBoxSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  images: z.array(z.string().url()).optional().default([]),
  status: z.enum(["draft", "active", "paused", "archived"]).default("draft"),
  frequency: z.enum(["weekly", "biweekly", "monthly", "bimonthly", "quarterly"]),
  pricing: z.object({
    basePrice: z.number().min(0),
    compareAtPrice: z.number().min(0).optional(),
    shippingCost: z.number().min(0),
    taxRate: z.number().min(0).max(100),
    discount3Months: z.number().min(0).max(100).optional(),
    discount6Months: z.number().min(0).max(100).optional(),
    discount12Months: z.number().min(0).max(100).optional(),
  }),
  customization: z.object({
    allowProductSwap: z.boolean().default(true),
    allowSkip: z.boolean().default(true),
    allowPause: z.boolean().default(true),
    maxSwapsPerCycle: z.number().min(0).default(1),
    preferenceCategories: z.array(z.string()).default([]),
  }),
  contents: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
    isFixed: z.boolean().default(false),
  })).optional().default([]),
  curation: z.object({
    type: z.enum(["curated", "customer_choice", "hybrid"]),
    maxChoices: z.number().min(1).optional(),
    surpriseItems: z.number().min(0).optional(),
  }),
  shippingSchedule: z.object({
    cutoffDay: z.number().min(1).max(31),
    shipDay: z.number().min(1).max(31),
    leadTimeDays: z.number().min(1).max(30),
  }),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

// GET /api/box-subscriptions/boxes - List subscription boxes
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      const where: any = { storeId };

      if (status) where.status = status;

      const [boxes, total] = await Promise.all([
        prisma.subscriptionBox.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { subscriptions: true },
            },
          },
        }),
        prisma.subscriptionBox.count({ where }),
      ]);

      const boxList = boxes.map(box => ({
        id: box.id,
        name: box.name,
        slug: box.slug,
        description: box.description,
        shortDescription: box.shortDescription,
        images: box.images,
        status: box.status,
        frequency: box.frequency,
        pricing: box.pricing,
        customization: box.customization,
        curation: box.curation,
        shippingSchedule: box.shippingSchedule,
        subscriberCount: box._count.subscriptions,
        stats: box.stats,
        seo: box.seo,
        createdAt: box.createdAt.toISOString(),
        updatedAt: box.updatedAt.toISOString(),
      }));

      return NextResponse.json(
        {
          boxes: boxList,
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
      logger.error("[BOX_SUBSCRIPTIONS_BOXES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load subscription boxes" },
        { status: 500 },
      );
    }
  },
);

// POST /api/box-subscriptions/boxes - Create new subscription box
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const result = SubscriptionBoxSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const {
        name,
        slug,
        description,
        shortDescription,
        images,
        status,
        frequency,
        pricing,
        customization,
        contents,
        curation,
        shippingSchedule,
        seo,
      } = result.data;

      // Check if slug already exists
      const existingBox = await prisma.subscriptionBox.findFirst({
        where: {
          slug,
          storeId: { not: storeId }, // Allow same slug for different stores
        },
      });

      if (existingBox) {
        return NextResponse.json(
          { error: "A subscription box with this slug already exists" },
          { status: 409 },
        );
      }

      // Validate product contents exist
      for (const content of contents) {
        const product = await prisma.product.findUnique({
          where: { id: content.productId },
          select: { storeId: true },
        });

        if (!product || product.storeId !== storeId) {
          return NextResponse.json(
            { error: `Product ${content.productId} not found or access denied` },
            { status: 404 },
          );
        }
      }

      const box = await prisma.subscriptionBox.create({
        data: {
          storeId,
          name,
          slug,
          description,
          shortDescription,
          images,
          status,
          frequency,
          pricing,
          customization,
          contents,
          curation,
          shippingSchedule,
          seo,
          stats: {
            totalSubscribers: 0,
            activeSubscribers: 0,
            monthlyRevenue: 0,
            churnRate: 0,
            avgLifetimeValue: 0,
          },
        },
      });

      return NextResponse.json(
        { box },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[BOX_SUBSCRIPTIONS_BOXES_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create subscription box" },
        { status: 500 },
      );
    }
  },
);