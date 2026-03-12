/**
 * Property Showings API Routes
 * POST /api/realestate/showings - Schedule showing
 * GET /api/realestate/showings - List showings
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST Schedule Showing
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        listingId,
        propertyId,
        scheduledAt,
        duration,
        type,
        clients,
        notes,
        instructions,
      } = body;

      if (!listingId || !propertyId || !scheduledAt || !clients || clients.length === 0) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check for conflicts
      const existingShowings = await prisma.propertyShowing.findMany({
        where: {
          listingId,
          status: { notIn: ["cancelled", "no_show"] },
        },
      });

      const newStart = new Date(scheduledAt);
      const newEnd = new Date(newStart.getTime() + (duration || 30) * 60000);

      const hasConflict = existingShowings.some((showing) => {
        const showingStart = new Date(showing.scheduledAt);
        const showingEnd = new Date(showing.endTime);
        return (
          (newStart >= showingStart && newStart < showingEnd) ||
          (newEnd > showingStart && newEnd <= showingEnd) ||
          (newStart <= showingStart && newEnd >= showingEnd)
        );
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: "Scheduling conflict detected" },
          { status: 409 }
        );
      }

      const showing = await prisma.propertyShowing.create({
        data: {
          merchantId: storeId,
          listingId,
          propertyId,
          agentId: user.id,
          type: type || "private",
          status: "scheduled",
          scheduledAt: new Date(scheduledAt),
          duration: duration || 30,
          endTime: newEnd,
          clients: JSON.stringify(clients),
          clientCount: clients.length,
          notes,
          instructions,
          reminderSent: false,
          confirmationSent: false,
          createdBy: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        data: showing,
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// GET List Showings
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const listingId = searchParams.get("listingId");
      const agentId = searchParams.get("agentId");
      const fromDate = searchParams.get("from");
      const toDate = searchParams.get("to");

      const showings = await prisma.propertyShowing.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(listingId ? { listingId } : {}),
          ...(agentId ? { agentId } : {}),
          ...(fromDate || toDate
            ? {
                scheduledAt: {
                  ...(fromDate ? { gte: new Date(fromDate) } : {}),
                  ...(toDate ? { lte: new Date(toDate) } : {}),
                },
              }
            : {}),
        },
        include: {
          feedback: true,
        },
        orderBy: { scheduledAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.propertyShowing.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(listingId ? { listingId } : {}),
          ...(agentId ? { agentId } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: showings,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
