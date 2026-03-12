import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";

import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseProductStatus(value: unknown): "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toUpperCase();
  const allowed = ["DRAFT", "PENDING", "ACTIVE", "ARCHIVED"];
  return allowed.includes(normalized) ? normalized as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" : undefined;
}

/**
 * GET /api/vehicles/[id]
 * Get a single vehicle
 */
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const vehicle = await prisma.product.findFirst({
        where: {
          id,
          storeId,
          productType: "vehicle",
        },
        include: {
          productImages: true,
          productVariants: true,
        },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { vehicle },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[VEHICLE_GET_BY_ID]", error, { storeId, vehicleId: id });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * PATCH /api/vehicles/[id]
 * Update a vehicle
 */
export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const body: unknown = await req.json().catch(() => ({}));
      const b = isRecord(body) ? body : {};

      // Verify ownership and existence
      const existing = await prisma.product.findFirst({
        where: { id, storeId, productType: "vehicle" },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 },
        );
      }

      const make = getString(b.make);
      const model = getString(b.model);
      const year = b.year !== undefined ? String(b.year) : undefined;
      const price = b.price !== undefined ? Number(b.price) : undefined;
      const description = getString(b.description);
      const condition = getString(b.condition);
      const mileage = b.mileage !== undefined ? Number(b.mileage) : undefined;
      const fuelType = getString(b.fuelType);
      const transmission = getString(b.transmission);
      const status = parseProductStatus(b.status);

      const metadata = isRecord(existing.metadata) ? existing.metadata : {};

      const newMetadata: Record<string, unknown> = { ...metadata };
      if (make !== undefined) newMetadata.make = make;
      if (model !== undefined) newMetadata.model = model;
      if (year !== undefined) newMetadata.year = year;
      if (condition !== undefined) newMetadata.condition = condition;
      if (mileage !== undefined) newMetadata.mileage = mileage;
      if (fuelType !== undefined) newMetadata.fuelType = fuelType;
      if (transmission !== undefined) newMetadata.transmission = transmission;

      const updated = await prisma.product.update({
        where: { id },
        data: {
          title:
            `${newMetadata.year || ""} ${newMetadata.make || ""} ${newMetadata.model || ""}`.trim(),
          description,
          price,
          status,
          metadata: newMetadata as Prisma.InputJsonValue,
        },
      });

      return NextResponse.json({ vehicle: updated });
    } catch (error: unknown) {
      logger.error("[VEHICLE_PATCH]", error, {
        storeId,
        vehicleId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/vehicles/[id]
 * Delete a vehicle
 */
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });

      // Verify ownership and existence
      const existing = await prisma.product.findFirst({
        where: { id, storeId, productType: "vehicle" },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 },
        );
      }

      await prisma.product.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[VEHICLE_DELETE]", error, {
        storeId,
        vehicleId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
