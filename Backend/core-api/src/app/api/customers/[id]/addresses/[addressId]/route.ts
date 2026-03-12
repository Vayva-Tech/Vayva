import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addressUpdateSchema = z.object({
  label: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
  recipientName: z.string().min(1).max(100).optional(),
  recipientPhone: z.string().max(20).optional(),
  addressLine1: z.string().min(1).max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  country: z.string().optional(),
});

// PATCH /api/customers/[id]/addresses/[addressId] - Update address
export const PATCH = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { params, storeId }) => {
    try {
      const { id: customerId, addressId } = await params;
      const body = await req.json();
      const validated = addressUpdateSchema.parse(body);

      // Verify address exists and belongs to customer/store
      const existing = await prisma.customerAddress.findFirst({
        where: { id: addressId, customerId, storeId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 }
        );
      }

      // If setting as default, unset other defaults first
      if (validated.isDefault) {
        await prisma.customerAddress.updateMany({
          where: { customerId, storeId, isDefault: true, id: { not: addressId } },
          data: { isDefault: false },
        });
      }

      const address = await prisma.customerAddress.update({
        where: { id: addressId },
        data: validated,
      });

      return NextResponse.json({ data: address });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }
      logger.error("[CUSTOMER_ADDRESS_UPDATE]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/customers/[id]/addresses/[addressId] - Delete address
export const DELETE = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { params, storeId }) => {
    try {
      const { id: customerId, addressId } = await params;

      // Verify address exists and belongs to customer/store
      const existing = await prisma.customerAddress.findFirst({
        where: { id: addressId, customerId, storeId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 }
        );
      }

      await prisma.customerAddress.delete({
        where: { id: addressId },
      });

      return NextResponse.json({ message: "Address deleted successfully" });
    } catch (error) {
      logger.error("[CUSTOMER_ADDRESS_DELETE]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to delete address" },
        { status: 500 }
      );
    }
  }
);
