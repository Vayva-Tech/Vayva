import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RentalBookingSchema = z.object({
  serviceId: z.string().min(1), // Using serviceId as rental product ID
  customerId: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/rentals/bookings - List rental bookings
export const GET = withVayvaAPI(
  PERMISSIONS.BOOKINGS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const customerId = searchParams.get("customerId");
      const serviceId = searchParams.get("serviceId");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      const where: any = { storeId };

      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (serviceId) where.serviceId = serviceId;

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            customer: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            service: {
              select: {
                title: true,
                description: true,
              },
            },
          },
        }),
        prisma.booking.count({ where }),
      ]);

      const bookingList = bookings.map(booking => ({
        id: booking.id,
        serviceId: booking.serviceId,
        serviceName: booking.service?.title || "Unknown Service",
        customerId: booking.customerId,
        customerEmail: booking.customer?.email || "Unknown Customer",
        customerName: booking.customer 
          ? `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim()
          : "Unknown Customer",
        status: booking.status,
        startsAt: booking.startsAt.toISOString(),
        endsAt: booking.endsAt.toISOString(),
        durationDays: Math.ceil((booking.endsAt.getTime() - booking.startsAt.getTime()) / (1000 * 60 * 60 * 24)),
        notes: booking.notes,
        metadata: booking.metadata,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      }));

      return NextResponse.json(
        {
          bookings: bookingList,
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
      logger.error("[RENTAL_BOOKINGS_LIST_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load rental bookings" },
        { status: 500 },
      );
    }
  },
);

// POST /api/rentals/bookings - Create new rental booking
export const POST = withVayvaAPI(
  PERMISSIONS.BOOKINGS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const result = RentalBookingSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { serviceId, customerId, startsAt, endsAt, notes, metadata } = result.data;

      // Verify service exists and belongs to store
      const service = await prisma.product.findUnique({
        where: { id: serviceId },
        select: { 
          storeId: true,
          title: true,
        },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service/Rental product not found" },
          { status: 404 },
        );
      }

      if (service.storeId !== storeId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 },
        );
      }

      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { storeId: true },
      });

      if (!customer || customer.storeId !== storeId) {
        return NextResponse.json(
          { error: "Customer not found or access denied" },
          { status: 404 },
        );
      }

      // Check for overlapping bookings
      const startsAtDate = new Date(startsAt);
      const endsAtDate = new Date(endsAt);

      const overlappingBookings = await prisma.booking.findMany({
        where: {
          serviceId,
          status: { in: ["CONFIRMED", "PENDING"] },
          OR: [
            {
              startsAt: { lte: endsAtDate },
              endsAt: { gte: startsAtDate },
            },
          ],
        },
      });

      if (overlappingBookings.length > 0) {
        return NextResponse.json(
          { 
            error: "Selected dates are not available",
            conflictingBookings: overlappingBookings.map(b => ({
              id: b.id,
              startsAt: b.startsAt.toISOString(),
              endsAt: b.endsAt.toISOString(),
            })),
          },
          { status: 409 },
        );
      }

      const booking = await prisma.booking.create({
        data: {
          storeId,
          serviceId,
          customerId,
          startsAt: startsAtDate,
          endsAt: endsAtDate,
          status: "CONFIRMED",
          notes,
          metadata,
        },
        include: {
          customer: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          service: {
            select: {
              title: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          booking: {
            id: booking.id,
            serviceId: booking.serviceId,
            serviceName: booking.service?.title || "Unknown Service",
            customerId: booking.customerId,
            customerEmail: booking.customer?.email || "Unknown Customer",
            customerName: booking.customer 
              ? `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim()
              : "Unknown Customer",
            status: booking.status,
            startsAt: booking.startsAt.toISOString(),
            endsAt: booking.endsAt.toISOString(),
            notes: booking.notes,
            createdAt: booking.createdAt.toISOString(),
          },
        },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[RENTAL_BOOKINGS_CREATE_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to create rental booking" },
        { status: 500 },
      );
    }
  },
);