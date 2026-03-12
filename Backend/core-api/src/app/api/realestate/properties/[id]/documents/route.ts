/**
 * Property Documents API Routes
 * GET /api/realestate/properties/[id]/documents - Get property documents
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Property Documents
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: propertyId } = await params;
      
      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID required" },
          { status: 400 }
        );
      }

      // Verify property exists and belongs to store
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          storeId,
        },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      const documents = await prisma.propertyDocument.findMany({
        where: {
          propertyId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        data: documents,
      });
    } catch (error: unknown) {
      logger.error("[PROPERTY_DOCUMENTS_GET]", error, { storeId, propertyId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);