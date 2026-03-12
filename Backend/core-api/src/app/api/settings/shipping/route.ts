import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function _isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const GET = withVayvaAPI(
  PERMISSIONS.FULFILLMENT_VIEW,
  async (req, { storeId }) => {
    try {
      // 1. Get or Create Default Profile
      let profile = await prisma.deliveryProfile.findFirst({
        where: { storeId, isDefault: true },
        include: { deliveryZones: true },
      });
      if (!profile) {
        profile = await prisma.deliveryProfile.create({
          data: {
            storeId,
            name: "General Shipping Profile",
            isDefault: true,
            defaultCurrency: "NGN",
          },
          include: { deliveryZones: true },
        });
      }
      // 2. Map Database Zones to UI Structure
      // The Schema allows many zones. The UI groups them.
      // We will do a best-effort grouping by Name prefix or similar?
      // OR simpler: specific "UI Zones" map to sets of DB zones.
      // For now, let's treat each DB Zone as a "Rate" within a "Virtual Zone" group based on regions?
      // This is getting complicated.
      // Alternative: use metadata on DeliveryProfile to store the UI configuration strictly
      // if strict 1-to-1 mapping isn't clean, but that violates "Real Data".
      // Let's go with: Group by `regions` equality.
      const zonesMap = new Map();
      profile.deliveryZones.forEach((dbZone) => {
        const regionKey = dbZone.states.sort().join(",");
        const zoneName = dbZone.name.split(" - ")[0]; // Heuristic: "Lagos - Standard" -> "Lagos"
        let uiZone = zonesMap.get(regionKey);
        if (!uiZone) {
          uiZone = {
            id: dbZone.id + "_group", // Virtual ID
            name: zoneName,
            regions: dbZone.states,
            rates: [],
          };
          zonesMap.set(regionKey, uiZone);
        }
        uiZone.rates.push({
          id: dbZone.id,
          name: dbZone.name.includes(" - ")
            ? dbZone.name.split(" - ")[1]
            : dbZone.name,
          amount: Number(dbZone.feeAmount),
          minDays: dbZone.etaMinDays,
          maxDays: dbZone.etaMaxDays,
        });
      });
      return NextResponse.json(Array.from(zonesMap.values()), {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[SHIPPING_GET]", error, { storeId });
      return NextResponse.json(
        { success: false, error: "Internal Error" },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.FULFILLMENT_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => []);
      const zones = Array.isArray(parsedBody) ? parsedBody : [];
      // 1. Get Profile
      const profile = await prisma.deliveryProfile.findFirst({
        where: { storeId, isDefault: true },
      });
      if (!profile) {
        return NextResponse.json(
          { success: false, error: "Profile not found" },
          { status: 404 },
        );
      }
      // 2. Transaction: Wipe existing zones and recreate (simplest for sync)
      await prisma.$transaction(async (tx) => {
        // Delete all current zones for this profile
        await tx.deliveryZone.deleteMany({
          where: { profileId: profile.id },
        });
        // Create new ones
        for (const zone of zones) {
          const zoneObj = typeof zone === "object" && zone !== null ? zone : {};
          const rates = Array.isArray(zoneObj.rates) ? zoneObj.rates : [];
          for (const rateRaw of rates) {
            const rate =
              typeof rateRaw === "object" && rateRaw !== null ? rateRaw : {};
            await tx.deliveryZone.create({
              data: {
                storeId,
                profileId: profile.id,
                name: `${zoneObj.name || "Zone"} - ${rate.name || "Rate"}`,
                states: Array.isArray(zoneObj.regions) ? zoneObj.regions : [],
                cities: [], // Default empty
                feeType: "FLAT",
                feeAmount: Number(rate.amount || 0),
                etaMinDays: Number(rate.minDays || 1),
                etaMaxDays: Number(rate.maxDays || 3),
              },
            });
          }
        }
      });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[SHIPPING_POST]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { success: false, error: "Internal Error" },
        { status: 500 },
      );
    }
  },
);
