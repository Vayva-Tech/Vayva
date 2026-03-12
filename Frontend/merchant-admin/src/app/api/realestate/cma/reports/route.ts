import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/cma/reports - Get CMA reports
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const propertyId = searchParams.get("propertyId");
      const limit = parseInt(searchParams.get("limit") || "20");
      const page = parseInt(searchParams.get("page") || "1");

      const where: any = { merchantId: storeId };
      
      if (propertyId) {
        where.propertyId = propertyId;
      }

      const reports = await prisma.cMAReport.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              price: true,
              bedrooms: true,
              bathrooms: true,
              area: true,
              images: true
            }
          },
          comparables: {
            include: {
              comparableProperty: {
                select: {
                  id: true,
                  address: true,
                  city: true,
                  price: true,
                  bedrooms: true,
                  bathrooms: true,
                  area: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: { generatedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      });

      const total = await prisma.cMAReport.count({ where });

      return NextResponse.json({
        success: true,
        data: {
          reports,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[CMA_REPORTS_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch CMA reports" },
        { status: 500 }
      );
    }
  }
);

// POST /api/realestate/cma/reports - Create a manual CMA report
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        propertyId,
        agentId,
        estimatedValue,
        valueRangeLow,
        valueRangeHigh,
        valueRecommended,
        pricePerSqft,
        confidenceScore,
        daysOnMarketEstimate,
        comparablesCount,
        marketConditions,
        notes,
        config
      } = body;

      if (!propertyId || !agentId || !estimatedValue) {
        return NextResponse.json(
          { success: false, error: "Property ID, Agent ID, and Estimated Value are required" },
          { status: 400 }
        );
      }

      // Verify property exists
      const property = await prisma.property.findUnique({
        where: { id: propertyId, storeId }
      });

      if (!property) {
        return NextResponse.json(
          { success: false, error: "Property not found" },
          { status: 404 }
        );
      }

      const cmaReport = await prisma.cMAReport.create({
        data: {
          merchantId: storeId,
          agentId,
          propertyId,
          estimatedValue,
          valueRangeLow: valueRangeLow || estimatedValue * 0.95,
          valueRangeHigh: valueRangeHigh || estimatedValue * 1.05,
          valueRecommended: valueRecommended || estimatedValue,
          pricePerSqft: pricePerSqft || 0,
          confidenceScore: confidenceScore || 50,
          daysOnMarketEstimate: daysOnMarketEstimate || 45,
          comparablesCount: comparablesCount || 0,
          marketConditions: marketConditions || 'stable',
          notes,
          config
        },
        include: {
          property: true
        }
      });

      return NextResponse.json({
        success: true,
        data: cmaReport
      });
    } catch (error: unknown) {
      logger.error("[CMA_CREATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to create CMA report" },
        { status: 500 }
      );
    }
  }
);
