import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";

// GET /api/events/[id] - Get specific event details
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Event ID required" },
          { status: 400 },
        );
      }

      const event = await prisma.event.findFirst({
        where: { id, storeId },
        include: {
          ticketTiers: {
            orderBy: { price: "asc" },
          },
          sponsors: true,
          vendors: true,
          attendees: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              attendees: true,
              tickets: true,
            },
          },
        },
      });

      if (!event) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 },
        );
      }

      const formattedEvent = {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        venue: event.venue,
        address: event.address,
        capacity: event.capacity,
        status: event.status,
        category: event.category,
        isPublic: event.isPublic,
        bannerImage: event.bannerImage,
        timezone: event.timezone,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        ticketTiers: event.ticketTiers.map((tier) => ({
          id: tier.id,
          name: tier.name,
          description: tier.description,
          price: tier.price,
          quantity: tier.quantity,
          remaining: tier.remaining,
          salesStart: tier.salesStart,
          salesEnd: tier.salesEnd,
          maxPerOrder: tier.maxPerOrder,
          benefits: tier.benefits,
          isActive: tier.isActive,
        })),
        sponsors: event.sponsors.map((sponsor) => ({
          id: sponsor.id,
          name: sponsor.name,
          logo: sponsor.logo,
          website: sponsor.website,
          sponsorshipLevel: sponsor.sponsorshipLevel,
          benefits: sponsor.benefits,
        })),
        vendors: event.vendors.map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          serviceType: vendor.serviceType,
          contactPerson: vendor.contactPerson,
          email: vendor.email,
          phone: vendor.phone,
          status: vendor.status,
        })),
        stats: {
          totalAttendees: event._count.attendees,
          totalTickets: event._count.tickets,
          availableCapacity: event.capacity - event._count.attendees,
        },
      };

      return NextResponse.json({
        success: true,
        data: formattedEvent,
      });
    } catch (error: unknown) {
      logger.error("[EVENT_GET_ID]", error, { storeId, eventId: id });
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

// PUT /api/events/[id] - Update event
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Event ID required" },
          { status: 400 },
        );
      }

      const body = await req.json();
      const {
        title,
        description,
        startDate,
        endDate,
        venue,
        address,
        capacity,
        category,
        isPublic,
        bannerImage,
        timezone,
      } = body;

      // Verify event exists and belongs to store
      const existingEvent = await prisma.event.findFirst({
        where: { id, storeId },
      });

      if (!existingEvent) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 },
        );
      }

      // Validate dates if provided
      let start, end;
      if (startDate) {
        start = new Date(startDate);
        end = endDate ? new Date(endDate) : existingEvent.endDate;
        
        if (start >= end) {
          return NextResponse.json(
            { success: false, error: "End date must be after start date" },
            { status: 400 },
          );
        }
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (start) updateData.startDate = start;
      if (end) updateData.endDate = end;
      if (venue) updateData.venue = venue;
      if (address !== undefined) updateData.address = address;
      if (capacity) updateData.capacity = parseInt(capacity);
      if (category) updateData.category = category;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
      if (timezone) updateData.timezone = timezone;

      const event = await prisma.event.update({
        where: { id },
        data: updateData,
      });

      logger.info("[EVENT_PUT_ID] Event updated", { eventId: id, storeId });

      return NextResponse.json({
        success: true,
        data: {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          status: event.status,
        },
      });
    } catch (error: unknown) {
      logger.error("[EVENT_PUT_ID]", error, { storeId, eventId: id });
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

// DELETE /api/events/[id] - Delete event
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Event ID required" },
          { status: 400 },
        );
      }

      // Check if event exists and belongs to store
      const event = await prisma.event.findFirst({
        where: { id, storeId },
      });

      if (!event) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 },
        );
      }

      // Prevent deletion of published events
      if (event.status === "published") {
        return NextResponse.json(
          { success: false, error: "Cannot delete published event. Cancel it first." },
          { status: 400 },
        );
      }

      // Delete related data (cascade delete handled by Prisma schema)
      await prisma.event.delete({
        where: { id },
      });

      logger.info("[EVENT_DELETE_ID] Event deleted", { eventId: id, storeId });

      return NextResponse.json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error: unknown) {
      logger.error("[EVENT_DELETE_ID]", error, { storeId, eventId: id });
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

// POST /api/events/[id]/publish - Publish event
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Event ID required" },
          { status: 400 },
        );
      }

      const event = await prisma.event.findFirst({
        where: { id, storeId },
      });

      if (!event) {
        return NextResponse.json(
          { success: false, error: "Event not found" },
          { status: 404 },
        );
      }

      // Validate event can be published
      if (!event.title || !event.startDate || !event.venue || !event.capacity) {
        return NextResponse.json(
          { success: false, error: "Event missing required information" },
          { status: 400 },
        );
      }

      const now = new Date();
      if (event.startDate <= now) {
        return NextResponse.json(
          { success: false, error: "Cannot publish past events" },
          { status: 400 },
        );
      }

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: { status: "published" },
      });

      logger.info("[EVENT_PUBLISH] Event published", { eventId: id, storeId });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedEvent.id,
          status: updatedEvent.status,
          publishedAt: new Date(),
        },
      });
    } catch (error: unknown) {
      logger.error("[EVENT_PUBLISH]", error, { storeId, eventId: id });
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);