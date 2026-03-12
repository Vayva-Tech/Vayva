import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma, ProductStatus } from "@vayva/db";

import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getOptionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const v of value) {
    if (typeof v === "string") out.push(v);
  }
  return out;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");

      const vehicles = await prisma.product.findMany({
        where: {
          storeId,
          productType: "vehicle",
          ...(status && { status: status as ProductStatus }),
        },
        include: {
          productImages: { take: 1, orderBy: { position: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        {
          vehicles: vehicles.map((v) => {
            const meta = isRecord(v.metadata) ? v.metadata : {};
            return {
              id: v.id,
              make: typeof meta.make === "string" ? meta.make : "",
              model: typeof meta.model === "string" ? meta.model : "",
              year:
                typeof meta.year === "string" || typeof meta.year === "number"
                  ? meta.year
                  : "",
              price: Number(v.price),
              status: v.status,
              image: v.productImages[0]?.url || null,
              createdAt: v.createdAt,
            };
          }),
          total: vehicles.length,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[VEHICLES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const b = isRecord(body) ? body : {};

      const make = getString(b.make);
      const model = getString(b.model);
      const year = b.year !== undefined ? String(b.year) : undefined;
      const price = b.price !== undefined ? Number(b.price) : undefined;
      const description = getString(b.description);
      const condition = getString(b.condition);
      const mileage = b.mileage !== undefined ? Number(b.mileage) : undefined;
      const fuelType = getString(b.fuelType);
      const transmission = getString(b.transmission);
      const images = getOptionalStringArray(b.images);

      if (!make || !model || price === undefined) {
        return NextResponse.json(
          { error: "Make, model and price are required" },
          { status: 400 },
        );
      }

      const handle = `${make}-${model}-${Date.now()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      const vehicle = await prisma.product.create({
        data: {
          storeId,
          title: `${year || ""} ${make} ${model}`.trim(),
          description: description || "",
          price: price,
          handle,
          productType: "vehicle",
          status: "ACTIVE",
          metadata: {
            make,
            model,
            year,
            condition,
            mileage,
            fuelType,
            transmission,
          } as Prisma.InputJsonValue,
          productImages: images?.length
            ? {
                create: images.map((url: string, i: number) => ({
                  url,
                  position: i,
                })),
              }
            : undefined,
        },
      });

      return NextResponse.json({ vehicle }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[VEHICLES_POST]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
