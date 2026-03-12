import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { extensionRegistry } from "@/lib/extensions/registry";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

const ADD_ON_PRICE_KOBO = 1_000_000; // ₦10,000
const ADD_ON_CURRENCY = "NGN";

// ---------------------------------------------------------------------------
// GET — List all available add-ons with purchase status for this store
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleGet(req: NextRequest, context: any) {
  const storeId = context?.storeId;
  const correlationId = context?.correlationId;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId: correlationId },
      { status: 401, headers: standardHeaders(correlationId) }
    );
  }

  try {
    const allExtensions = extensionRegistry.getAll();

    // Fetch this store's active/expired add-ons
    const storeAddOns = await prisma.storeAddOn?.findMany({
      where: { storeId },
    });

    type StoreAddOnRow = { extensionId: string; status: unknown; autoRenew: boolean; currentPeriodStart: Date | null; currentPeriodEnd: Date | null; cancelledAt: Date | null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addOnMap = new Map(storeAddOns.map((a: any) => [a.extensionId, a as StoreAddOnRow]));

    // Get store's base industry to exclude its own core extension
    const store = await prisma.store?.findUnique({
      where: { id: storeId },
      select: { industrySlug: true },
    });

    const baseIndustryExtensions = getBaseExtensionIds(store?.industrySlug || "");

    const catalog = allExtensions.map((ext: unknown) => {
      const addOn = addOnMap.get((ext as { id: string }).id) as StoreAddOnRow | undefined;
      const isBaseExtension = baseIndustryExtensions.includes((ext as { id: string }).id);

      return {
        id: (ext as any).id,
        name: (ext as any).name,
        description: (ext as any).description,
        category: (ext as any).category,
        icon: (ext as any).sidebarItems?.[0]?.icon || "Blocks",
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
      { headers: standardHeaders(correlationId) }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    const _err = error instanceof Error ? error : new Error(String(error));
    logger.error("Failed to fetch add-ons", {
      error: _err.message,
      stack: _err.stack,
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) }
    );
  }
}

// ---------------------------------------------------------------------------
// POST — Purchase an add-on (or renew an expired one)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePost(req: NextRequest, context: any) {
  const storeId = context?.storeId;
  const correlationId = context?.correlationId;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId: correlationId },
      { status: 401, headers: standardHeaders(correlationId) }
    );
  }

  try {
    const body = await req.json();
    const { extensionId } = body;

    if (!extensionId || typeof extensionId !== "string") {
      return NextResponse.json(
        { error: "extensionId is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) }
      );
    }

    // Validate extension exists
    const ext = extensionRegistry.get(extensionId);
    if (!ext) {
      return NextResponse.json(
        { error: "Extension not found", requestId: correlationId },
        { status: 404, headers: standardHeaders(correlationId) }
      );
    }

    // Check if already active
    const existing = await prisma.storeAddOn?.findFirst({
      where: { storeId, extensionId },
    });

    if (existing && existing.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Add-on is already active", requestId: correlationId },
        { status: 409, headers: standardHeaders(correlationId) }
      );
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.setMonth(now.getMonth() + 1));

    // Upsert: create new or reactivate expired/cancelled
    // First find if record exists
    const existingAddOn = await prisma.storeAddOn?.findFirst({
      where: { storeId, extensionId },
    });
    
    let addOn;
    if (existingAddOn) {
      // Update existing
      addOn = await prisma.storeAddOn?.update({
        where: { id: existingAddOn.id },
        data: {
          status: "ACTIVE" as any,
          autoRenew: true,
          priceKobo: BigInt(ADD_ON_PRICE_KOBO),
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelledAt: null,
        },
      });
    } else {
      // Create new
      addOn = await prisma.storeAddOn?.create({
        data: {
          addOnId: extensionId,
          store: { connect: { id: storeId } },
          extensionId,
          priceKobo: BigInt(ADD_ON_PRICE_KOBO),
          currency: ADD_ON_CURRENCY,
          status: "ACTIVE" as any,
          autoRenew: true,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

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
          status: (addOn as any).status,
          autoRenew: addOn.autoRenew,
          currentPeriodStart: addOn.currentPeriodStart,
          currentPeriodEnd: addOn.currentPeriodEnd,
        },
        requestId: correlationId,
      },
      { status: 201, headers: standardHeaders(correlationId) }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    const _err = error instanceof Error ? error : new Error(String(error));
    logger.error("Failed to purchase add-on", {
      error: _err.message,
      stack: _err.stack,
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) }
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
