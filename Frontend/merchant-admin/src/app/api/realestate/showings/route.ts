import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/showings - Get property showings
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const propertyId = searchParams.get("propertyId");
      const agentId = searchParams.get("agentId");
      const status = searchParams.get("status");
      const type = searchParams.get("type");
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const limit = parseInt(searchParams.get("limit") || "50");
      const page = parseInt(searchParams.get("page") || "1");

      const where: any = { merchantId: storeId };

      if (propertyId) where.propertyId = propertyId;
      if (agentId) where.agentId = agentId;
      if (status) where.status = status;
      if (type) where.type = type;
      
      if (from || to) {
        where.scheduledAt = {};
        if (from) where.scheduledAt.gte = new Date(from);
        if (to) where.scheduledAt.lte = new Date(to);
      }

      const showings = await prisma.propertyShowing.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              price: true,
              images: true
            }
          },
          feedback: true
        },
        orderBy: { scheduledAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      });

      const total = await prisma.propertyShowing.count({ where });

      return NextResponse.json({
        success: true,
        data: {
          showings,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[SHOWINGS_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch showings" },
        { status: 500 }
      );
    }
  }
);

// POST /api/realestate/showings - Create a new showing
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        listingId,
        propertyId,
        agentId,
        type = 'private',
        scheduledAt,
        duration = 30,
        clients,
        clientCount = 1,
        notes,
        instructions
      } = body;

      if (!listingId || !propertyId || !agentId || !scheduledAt) {
        return NextResponse.json(
          { success: false, error: "Listing ID, Property ID, Agent ID, and Scheduled At are required" },
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

      // Calculate end time
      const startTime = new Date(scheduledAt);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      // Check for scheduling conflicts
      const conflicts = await prisma.propertyShowing.findFirst({
        where: {
          propertyId,
          status: { not: 'cancelled' },
          OR: [
            {
              scheduledAt: {
                lte: startTime,
              },
              endTime: {
                gte: startTime,
              },
            },
            {
              scheduledAt: {
                lte: endTime,
              },
              endTime: {
                gte: endTime,
              },
            },
          ],
        },
      });

      if (conflicts) {
        return NextResponse.json(
          { success: false, error: "Scheduling conflict detected" },
          { status: 409 }
        );
      }

      const showing = await prisma.propertyShowing.create({
        data: {
          merchantId: storeId,
          listingId,
          propertyId,
          agentId,
          type,
          status: 'scheduled',
          scheduledAt: startTime,
          duration,
          endTime,
          clients: JSON.stringify(clients),
          clientCount,
          notes,
          instructions,
          createdBy: agentId // In production, use actual user ID from auth
        },
        include: {
          property: true,
          feedback: true
        }
      });

      return NextResponse.json({
        success: true,
        data: showing,
        message: "Showing scheduled successfully"
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_CREATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to create showing" },
        { status: 500 }
      );
    }
  }
);
