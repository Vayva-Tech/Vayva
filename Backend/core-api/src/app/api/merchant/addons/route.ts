import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { extensionRegistry } from "@/lib/extensions/registry";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

const ADD_ON_PRICE_KOBO = 1_000_000; // ₦10,000
const ADD_ON_CURRENCY = "NGN";

type APIContext = {
  storeId?: string;
  correlationId?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

function getHeaders(correlationId: string | undefined) {
  return standardHeaders(correlationId ?? "");
}

// ---------------------------------------------------------------------------
// GET — List all available add-ons with purchase status for this store
// ---------------------------------------------------------------------------
async function handleGet(req: NextRequest, context: APIContext) {
  const storeId = context?.storeId;
  const correlationId = context?.correlationId;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId: correlationId },
      { status: 401, headers: getHeaders(correlationId) },
    );
  }

  try {
    const allExtensions = extensionRegistry.getAll();

    // Fetch this store's active/expired add-ons
    const storeAddOns = await prisma.storeAddOn.findMany({
      where: { storeId },
    });

    const addOnMap = new Map(
      storeAddOns.map((a) => [a.extensionId, a] as const),
    );

    // Get store's base industry to exclude its own core extension
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { industrySlug: true },
    });

    const baseIndustryExtensions = getBaseExtensionIds(
      store?.industrySlug || "",
    );

    const catalog = allExtensions.map((ext) => {
      const addOn = addOnMap.get(ext.id);
      const isBaseExtension = baseIndustryExtensions.includes(ext.id);

      return {
        id: ext.id,
        name: ext.name,
        description: ext.description,
        category: ext.category,
        icon: ext.sidebarItems?.[0]?.icon || "Blocks",
        priceKobo: ADD_ON_PRICE_KOBO,
        currency: ADD_ON_CURRENCY,
        isBaseExtension,
        purchase: addOn
          ? {
              status: addOn.status,
              autoRenew: addOn.autoRenew,
              currentPeriodStart: addOn.currentPeriodStart,
              currentPeriodEnd: addOn.currentPeriodEnd,
              cancelledAt: addOn.cancelledAt,
            }
          : null,
      };
    });

    return NextResponse.json(
      { addOns: catalog, requestId: correlationId },
      { headers: getHeaders(correlationId) },
    );
  } catch (error: unknown) {
    logger.error("Failed to fetch add-ons", {
      error: getErrorMessage(error),
      stack: getErrorStack(error),
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: getHeaders(correlationId) },
    );
  }
}

// ---------------------------------------------------------------------------
// POST — Purchase an add-on (or renew an expired one)
// ---------------------------------------------------------------------------
async function handlePost(req: NextRequest, context: APIContext) {
  const storeId = context?.storeId;
  const correlationId = context?.correlationId;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId: correlationId },
      { status: 401, headers: getHeaders(correlationId) },
    );
  }

  try {
    const body: unknown = await req.json().catch(() => ({}));
    const extensionId = isRecord(body) ? body.extensionId : undefined;

    if (!extensionId || typeof extensionId !== "string") {
      return NextResponse.json(
        { error: "extensionId is required", requestId: correlationId },
        { status: 400, headers: getHeaders(correlationId) },
      );
    }

    // Validate extension exists
    const ext = extensionRegistry.get(extensionId);
    if (!ext) {
      return NextResponse.json(
        { error: "Extension not found", requestId: correlationId },
        { status: 404, headers: getHeaders(correlationId) },
      );
    }

    // Check if already active
    const existing = await prisma.storeAddOn.findUnique({
      where: { storeId_addOnId: { storeId, addOnId: extensionId } },
    });

    if (existing?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Add-on is already active", requestId: correlationId },
        { status: 409, headers: getHeaders(correlationId) },
      );
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.setMonth(now.getMonth() + 1));

    // Upsert: create new or reactivate expired/cancelled
    const addOn = await prisma.storeAddOn.upsert({
      where: { storeId_addOnId: { storeId, addOnId: extensionId } },
      create: {
        storeId,
        addOnId: extensionId,
        extensionId,
        priceKobo: BigInt(ADD_ON_PRICE_KOBO),
        currency: ADD_ON_CURRENCY,
        status: "ACTIVE",
        autoRenew: true,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        status: "ACTIVE",
        autoRenew: true,
        priceKobo: BigInt(ADD_ON_PRICE_KOBO),
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
      },
    });

    logger.info("Add-on purchased", {
      storeId,
      extensionId,
      addOnId: addOn.id,
      requestId: correlationId,
    });

    return NextResponse.json(
      {
        addOn: {
          id: addOn.id,
          extensionId: addOn.extensionId,
          status: addOn.status,
          autoRenew: addOn.autoRenew,
          currentPeriodStart: addOn.currentPeriodStart,
          currentPeriodEnd: addOn.currentPeriodEnd,
        },
        requestId: correlationId,
      },
      { status: 201, headers: getHeaders(correlationId) },
    );
  } catch (error: unknown) {
    logger.error("Failed to purchase add-on", {
      error: getErrorMessage(error),
      stack: getErrorStack(error),
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: getHeaders(correlationId) },
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getBaseExtensionIds(industrySlug: string): string[] {
  const map: Record<string, string[]> = {
    retail: ["vayva.retail"],
    fashion: ["vayva.retail"],
    electronics: ["vayva.retail"],
    beauty: ["vayva.retail"],
    grocery: ["vayva.retail"],
    one_product: ["vayva.retail"],
    marketplace: ["vayva.retail"],
    food: ["vayva.kitchen"],
    real_estate: ["vayva.real-estate"],
    services: ["vayva.bookings"],
    education: ["vayva.education"],
    events: ["vayva.events"],
    nightlife: ["vayva.events"],
    b2b: ["vayva.b2b"],
    nonprofit: ["vayva.nonprofit"],
    automotive: ["vayva.automotive"],
    travel_hospitality: ["vayva.travel"],
    creative_portfolio: ["vayva.creative"],
  };
  return map[industrySlug] || [];
}

export const GET = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, handleGet);
export const POST = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, handlePost);
