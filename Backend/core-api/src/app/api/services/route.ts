import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { BookingService } from "@/services/BookingService";
import { logger } from "@/lib/logger";
import type { CreateServiceData } from "@/types/bookings";
import { ServiceCreateSchema } from "@/lib/validations/booking";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Bad Request";
}

// Create new Service (Product)
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json().catch(() => ({}));
      const validation = ServiceCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.format(),
          },
          { status: 400 },
        );
      }

      const data: CreateServiceData = {
        name: validation.data.name,
        description: validation.data.description,
        price: validation.data.price,
        metadata: validation.data.metadata,
      };

      const product = await BookingService.createServiceProduct(storeId, data);
      return NextResponse.json(product);
    } catch (error: unknown) {
      logger.error("[SERVICES_POST]", error, { storeId });
      return NextResponse.json(
        { error: getErrorMessage(error) },
        { status: 400 },
      );
    }
  },
);
