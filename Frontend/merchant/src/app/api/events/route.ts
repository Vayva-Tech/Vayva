import { logger } from "@vayva/shared";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { eventsService } from "@/services/events.service";
import type { EventStatus } from "@/types/phase4-industry";

// GET /api/events?filters... — store scope from session only
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;
    if (!session?.user || !storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const upcoming = searchParams.get("upcoming") === "true";

    const query = new URLSearchParams();
    query.set("storeId", storeId);
    query.set("status", status ?? "");
    query.set("category", category ?? "");
    query.set("upcoming", String(upcoming));

    const result = await apiJson<{
      events: Array<{
        id: string;
        title: string;
        description?: string;
        venue?: string;
        startDate: Date;
        endDate: Date;
        status: EventStatus;
      }>;
    }>(`${process.env.BACKEND_API_URL}/api/events?${query.toString()}`, {
      headers: {
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/events",
      operation: "GET_EVENTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// POST /api/events
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionStoreId = session.user.storeId;
    if (!sessionStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const title = typeof b.title === "string" ? b.title : "";
    const description = typeof b.description === "string" ? b.description : undefined;
    const venue = typeof b.venue === "string" ? b.venue : undefined;
    const address = typeof b.address === "string" ? b.address : undefined;
    const startDateRaw = b.startDate;
    const endDateRaw = b.endDate;
    const timezone = typeof b.timezone === "string" ? b.timezone : undefined;
    const capacity =
      typeof b.capacity === "number" && Number.isFinite(b.capacity)
        ? b.capacity
        : typeof b.capacity === "string"
          ? Number(b.capacity)
          : NaN;
    const bannerImage = typeof b.bannerImage === "string" ? b.bannerImage : undefined;
    const organizerId = typeof b.organizerId === "string" ? b.organizerId : "";
    const category = typeof b.category === "string" ? b.category : "";
    const isPublic = typeof b.isPublic === "boolean" ? b.isPublic : undefined;
    const requiresApproval =
      typeof b.requiresApproval === "boolean" ? b.requiresApproval : undefined;

    const startDate =
      startDateRaw instanceof Date
        ? startDateRaw
        : typeof startDateRaw === "string" || typeof startDateRaw === "number"
          ? new Date(startDateRaw)
          : null;
    const endDate =
      endDateRaw instanceof Date
        ? endDateRaw
        : typeof endDateRaw === "string" || typeof endDateRaw === "number"
          ? new Date(endDateRaw)
          : null;

    if (
      !title ||
      !startDate ||
      !endDate ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      !Number.isFinite(capacity) ||
      !organizerId ||
      !category
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const event = await eventsService.createEvent({
      storeId: sessionStoreId,
      title,
      description,
      venue,
      address,
      startDate,
      endDate,
      timezone,
      capacity,
      bannerImage,
      organizerId,
      category,
      isPublic,
      requiresApproval,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    logger.error("[EVENTS_POST]", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}

// PATCH /api/events?id=xxx - publish event
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const existing = await eventsService.getEventById(sessionStoreId, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
      const event = await eventsService.publishEvent(sessionStoreId, id);
      return NextResponse.json({ event });
    } catch (inner) {
      if (inner instanceof Error && inner.message === "Event not found") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      throw inner;
    }
  } catch (error) {
    logger.error("[EVENTS_PATCH]", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to publish event" },
      { status: 500 },
    );
  }
}
