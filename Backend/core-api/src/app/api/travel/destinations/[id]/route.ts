import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

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
            where: { storeId },
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
              itineraries: { where: { storeId } },
            },
          },
        },
      });

      if (!destination) {
        return NextResponse.json(
          { error: "Destination not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const destinationWithParsedData = {
        ...destination,
        highlights: JSON.parse(destination.highlights || "[]"),
        categories: JSON.parse(destination.categories || "[]"),
      };

      return NextResponse.json(
        { data: destinationWithParsedData },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: destinationId } = await params;
      logger.error("[TRAVEL_DESTINATION_GET]", { error, destinationId });
      return NextResponse.json(
        { error: "Failed to fetch destination" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
