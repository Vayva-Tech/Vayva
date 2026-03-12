import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";

// GET /api/events - List events with filtering and pagination
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
      const status = searchParams.get("status"); // published, draft, cancelled
      const category = searchParams.get("category");
      const fromDate = searchParams.get("fromDate");
      const toDate = searchParams.get("toDate");
      const search = searchParams.get("search");

      const skip = (page - 1) * limit;

      const where: any = { storeId };

      // Status filter
      if (status) {
        where.status = status;
      }

      // Category filter
      if (category) {
        where.category = category;
      }

      // Date range filter
      if (fromDate || toDate) {
        where.startDate = {};
        if (fromDate) where.startDate.gte = new Date(fromDate);
        if (toDate) where.startDate.lte = new Date(toDate);
      }

      // Search filter
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { venue: { contains: search, mode: "insensitive" } },
        ];
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startDate: "desc" },
          include: {
            _count: {
              select: {
                attendees: true,
                tickets: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
      ]);

      const formattedEvents = events.map((event) => ({
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
        stats: {
          attendeesCount: event._count.attendees,
          ticketsCount: event._count.tickets,
        },
      }));

      return NextResponse.json({
        success: true,
        data: formattedEvents,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      logger.error("[EVENTS_GET]", error, { storeId });
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

// POST /api/events - Create new event
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId }) => {
    try {
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
        isPublic = true,
        bannerImage,
        timezone = "UTC",
        ticketTiers = [],
        sponsors = [],
        vendors = [],
      } = body;

      // Validation
      if (!title || !startDate || !venue || !capacity) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 },
        );
      }

      // Validate dates
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

      if (start >= end) {
        return NextResponse.json(
          { success: false, error: "End date must be after start date" },
          { status: 400 },
        );
      }

      const event = await prisma.event.create({
        data: {
          storeId,
          title,
          description,
          startDate: start,
          endDate: end,
          venue,
          address,
          capacity: parseInt(capacity),
          status: "draft",
          category,
          isPublic,
          bannerImage,
          timezone,
          ticketTiers: {
            create: ticketTiers.map((tier: any) => ({
              name: tier.name,
              description: tier.description,
              price: parseFloat(tier.price),
              quantity: parseInt(tier.quantity),
              remaining: parseInt(tier.quantity),
              salesStart: tier.salesStart ? new Date(tier.salesStart) : start,
              salesEnd: tier.salesEnd ? new Date(tier.salesEnd) : end,
              maxPerOrder: parseInt(tier.maxPerOrder) || 10,
              benefits: tier.benefits || [],
              isActive: tier.isActive !== false,
            })),
          },
          sponsors: {
            create: sponsors.map((sponsor: any) => ({
              name: sponsor.name,
              logo: sponsor.logo,
              website: sponsor.website,
              sponsorshipLevel: sponsor.level,
              benefits: sponsor.benefits || [],
            })),
          },
          vendors: {
            create: vendors.map((vendor: any) => ({
              name: vendor.name,
              serviceType: vendor.serviceType,
              contactPerson: vendor.contactPerson,
              email: vendor.email,
              phone: vendor.phone,
              status: "confirmed",
            })),
          },
        },
        include: {
          ticketTiers: true,
          sponsors: true,
          vendors: true,
        },
      });

      logger.info("[EVENTS_POST] Event created", { eventId: event.id, storeId });

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
      logger.error("[EVENTS_POST]", error, { storeId });
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);