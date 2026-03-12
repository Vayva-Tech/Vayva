import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const destination = await prisma.travelDestination.findFirst({
      where: { id, storeId },
      include: {
        packages: {
          where: { status: "active" },
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            currency: true,
          },
          take: 10,
        },
        itineraries: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
          take: 5,
        },
        _count: {
          select: {
            packages: { where: { status: "active" } },
            itineraries: true,
          },
        },
      },
    });

    if (!destination) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Parse JSON fields
    const destinationWithParsedData = {
      ...destination,
      highlights: JSON.parse(destination.highlights || "[]"),
      categories: JSON.parse(destination.categories || "[]"),
    };

    return NextResponse.json(
      { data: destinationWithParsedData },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[TRAVEL_DESTINATION_GET]", { error, destinationId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch destination" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}