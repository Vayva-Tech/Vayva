import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addressSchema = z.object({
  label: z.string().max(50).optional(),
  isDefault: z.boolean().default(false),
  recipientName: z.string().min(1).max(100),
  recipientPhone: z.string().max(20).optional(),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  country: z.string().default("NG"),
});

// GET /api/customers/[id]/addresses - List all addresses for a customer
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req, { params, storeId }) => {
    try {
      const { id: customerId } = await params;

      // Verify customer exists and belongs to store
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, storeId },
        select: { id: true },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      const addresses = await prisma.customerAddress.findMany({
        where: { customerId, storeId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });

      return NextResponse.json({ data: addresses }, {
        headers: { 
          "Cache-Control": "private, max-age=60, stale-while-revalidate=300"
        },
      });
    } catch (error) {
      logger.error("[CUSTOMER_ADDRESSES_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }
  }
);

// POST /api/customers/[id]/addresses - Create new address
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { params, storeId }) => {
    try {
      const { id: customerId } = await params;
      const body = await req.json();
      const validated = addressSchema.parse(body);

      // Verify customer exists and belongs to store
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, storeId },
        select: { id: true },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      // If setting as default, unset other defaults first
      if (validated.isDefault) {
        await prisma.customerAddress.updateMany({
          where: { customerId, storeId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await prisma.customerAddress.create({
        data: {
          ...validated,
          customerId,
          storeId,
        },
      });

      return NextResponse.json({ data: address }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }
      logger.error("[CUSTOMER_ADDRESS_CREATE]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create address" },
        { status: 500 }
      );
    }
  }
);
