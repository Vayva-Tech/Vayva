import { logger } from "@vayva/shared";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
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
    
    // Call backend API directly
    const result = await apiJson.post(
      `${process.env.BACKEND_API_URL}/api/events`,
      { ...b, storeId: sessionStoreId },
      {
        headers: {
          "x-store-id": sessionStoreId,
        },
      }
    );

    return NextResponse.json(result, { status: 201 });
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

    // Call backend API to publish event
    const result = await apiJson.post(
      `${process.env.BACKEND_API_URL}/api/events/${id}/publish`,
      {},
      {
        headers: {
          "x-store-id": sessionStoreId,
        },
      }
    );

    return NextResponse.json(result);
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
