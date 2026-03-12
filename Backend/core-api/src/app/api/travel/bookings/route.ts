import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const BookingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  customerId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const BookingCreateSchema = z.object({
  customerId: z.string(),
  travelDate: z.string().datetime(),
  returnDate: z.string().datetime().optional(),
  destination: z.string().min(1),
  travelers: z.number().int().min(1).default(1),
  totalPrice: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  bookingType: z.enum(["flight", "hotel", "package", "tour"]).default("package"),
  supplierId: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.BOOKINGS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = BookingQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, customerId, startDate, endDate } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (startDate || endDate) {
        where.travelDate = {};
        if (startDate) where.travelDate.gte = new Date(startDate);
        if (endDate) where.travelDate.lte = new Date(endDate);
      }

      const [bookings, total] = await Promise.all([
        prisma.travelBooking.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.travelBooking.count({ where }),
      ]);

      return NextResponse.json(
        {
          data: bookings,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[TRAVEL_BOOKINGS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.BOOKINGS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = BookingCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid booking data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify customer exists
      const customer = await prisma.customer.findFirst({
        where: { id: body.customerId, storeId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify supplier exists if provided
      if (body.supplierId) {
        const supplier = await prisma.travelSupplier.findFirst({
          where: { id: body.supplierId, storeId },
        });
        
        if (!supplier) {
          return NextResponse.json(
            { error: "Supplier not found" },
            { status: 404, headers: standardHeaders(requestId) }
          );
        }
      }

      const booking = await prisma.travelBooking.create({
        data: {
          storeId,
          customerId: body.customerId,
          travelDate: new Date(body.travelDate),
          returnDate: body.returnDate ? new Date(body.returnDate) : null,
          destination: body.destination,
          travelers: body.travelers,
          totalPrice: body.totalPrice,
          currency: body.currency,
          bookingType: body.bookingType,
          supplierId: body.supplierId,
          notes: body.notes,
          status: "pending",
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json(booking, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[TRAVEL_BOOKINGS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);