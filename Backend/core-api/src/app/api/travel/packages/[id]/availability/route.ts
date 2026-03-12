import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const AvailabilityQuerySchema = z.object({
  date: z.string().datetime(),
  travelers: z.coerce.number().int().min(1).default(2),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const parseResult = AvailabilityQuerySchema.safeParse(
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

    const { date, travelers } = parseResult.data;
    const checkDate = new Date(date);

    // Get the package
    const travelPackage = await prisma.travelPackage.findFirst({
      where: { id, storeId },
    });

    if (!travelPackage) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Check if date is within package availability period
    const isDateValid = (!travelPackage.startDate || checkDate >= travelPackage.startDate) &&
                       (!travelPackage.endDate || checkDate <= travelPackage.endDate);

    if (!isDateValid) {
      return NextResponse.json(
        {
          data: {
            available: false,
            reason: "Date outside package availability period",
            packageStartDate: travelPackage.startDate,
            packageEndDate: travelPackage.endDate,
          },
        },
        { headers: standardHeaders(requestId) }
      );
    }

    // Check traveler limits
    const withinTravelerLimits = travelers >= travelPackage.minTravelers && 
                                travelers <= travelPackage.maxTravelers;

    if (!withinTravelerLimits) {
      return NextResponse.json(
        {
          data: {
            available: false,
            reason: `Package requires ${travelPackage.minTravelers}-${travelPackage.maxTravelers} travelers`,
            minTravelers: travelPackage.minTravelers,
            maxTravelers: travelPackage.maxTravelers,
            requestedTravelers: travelers,
          },
        },
        { headers: standardHeaders(requestId) }
      );
    }

    // Check existing bookings for capacity
    const existingBookings = await prisma.travelBooking.count({
      where: {
        travelPackageId: id,
        travelDate: checkDate,
        status: { in: ["pending", "confirmed"] },
      },
    });

    const totalCapacity = travelPackage.maxTravelers;
    const bookedTravelers = existingBookings * 2; // Assuming average 2 travelers per booking
    const availableCapacity = totalCapacity - bookedTravelers;

    const isAvailable = availableCapacity >= travelers;

    const availabilityInfo = {
      data: {
        available: isAvailable,
        packageId: id,
        packageName: travelPackage.name,
        checkDate: checkDate.toISOString(),
        requestedTravelers: travelers,
        availableCapacity,
        totalCapacity,
        bookedTravelers,
        pricePerPerson: travelPackage.price,
        totalPrice: travelPackage.price * travelers,
        currency: travelPackage.currency,
        reason: isAvailable 
          ? "Package is available for the requested date and traveler count"
          : `Insufficient capacity. Only ${availableCapacity} spots available for ${travelers} travelers`,
      },
    };

    return NextResponse.json(availabilityInfo, {
      headers: standardHeaders(requestId),
    });
  } catch (error: unknown) {
    logger.error("[TRAVEL_PACKAGE_AVAILABILITY_GET]", { error, packageId: params.id });
    return NextResponse.json(
      { error: "Failed to check package availability" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}