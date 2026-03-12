import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const SupplierUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  rating: z.number().gte(0).lte(5).optional(),
  commissionRate: z.number().gte(0).lte(100).optional(),
  paymentTerms: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const supplier = await prisma.travelSupplier.findFirst({
      where: { id, storeId },
      include: {
        packages: {
          where: { status: "active" },
          select: {
            id: true,
            name: true,
            price: true,
            destination: true,
          },
          take: 10,
        },
        contracts: {
          select: {
            id: true,
            contractNumber: true,
            startDate: true,
            endDate: true,
            status: true,
          },
          take: 5,
        },
        _count: {
          select: {
            packages: { where: { status: "active" } },
            bookings: { where: { status: { in: ["confirmed", "completed"] } } },
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    return NextResponse.json(
      { data: supplier },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[TRAVEL_SUPPLIER_GET]", { error, supplierId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export const PUT = withVayvaAPI(
  PERMISSIONS.SUPPLIERS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext & { params: { id: string } }) => {
    const requestId = correlationId;
    try {
      const { id } = params;
      const json = await req.json().catch(() => ({}));
      const parseResult = SupplierUpdateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid supplier data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check if supplier exists
      const existingSupplier = await prisma.travelSupplier.findFirst({
        where: { id, storeId },
      });

      if (!existingSupplier) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      const updateData: any = {};
      if (body.name) updateData.name = body.name;
      if (body.contactEmail) updateData.contactEmail = body.contactEmail;
      if (body.contactPhone) updateData.contactPhone = body.contactPhone;
      if (body.website) updateData.website = body.website;
      if (body.address) updateData.address = body.address;
      if (body.city) updateData.city = body.city;
      if (body.country) updateData.country = body.country;
      if (body.rating !== undefined) updateData.rating = body.rating;
      if (body.commissionRate !== undefined) updateData.commissionRate = body.commissionRate;
      if (body.paymentTerms) updateData.paymentTerms = body.paymentTerms;
      if (body.status) updateData.status = body.status;
      if (body.notes !== undefined) updateData.notes = body.notes;

      const supplier = await prisma.travelSupplier.update({
        where: { id },
        data: updateData,
        include: {
          contracts: {
            select: {
              id: true,
              contractNumber: true,
              startDate: true,
              endDate: true,
              status: true,
            },
            take: 3,
          },
        },
      });

      return NextResponse.json(supplier, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_SUPPLIER_PUT]", { error, supplierId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to update supplier" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);