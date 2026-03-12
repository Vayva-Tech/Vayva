import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { urls } from "@vayva/shared";

const KWIK_BASE_URL = process.env.KWIK_BASE_URL || urls.kwikBase();
const KWIK_EMAIL = process.env.KWIK_EMAIL;
const KWIK_PASSWORD = process.env.KWIK_PASSWORD;

const DEFAULT_FLAT_RATE = 1500;

let cachedKwikToken: string | null = null;
let tokenExpiresAt = 0;

async function getKwikToken(): Promise<string> {
  if (cachedKwikToken && Date.now() < tokenExpiresAt) {
    return cachedKwikToken;
  }

  if (!KWIK_EMAIL || !KWIK_PASSWORD) {
    throw new Error("Kwik credentials not configured");
  }

  const res = await fetch(`${KWIK_BASE_URL}/vendor/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: KWIK_EMAIL, password: KWIK_PASSWORD }),
  });

  if (!res.ok) {
    throw new Error(`Kwik auth failed: ${res.status}`);
  }

  const data = await res.json();
  const token = data.data?.token;

  if (!token) {
    throw new Error("Kwik auth returned no token");
  }

  cachedKwikToken = token;
  tokenExpiresAt = Date.now() + 55 * 60 * 1000; // 55 min TTL (refresh before 1hr expiry)
  return token;
}

interface KwikQuoteResult {
  shipping: number;
  provider: "KWIK";
  etaMinutes: number;
}

async function getKwikQuote(
  pickupAddress: string,
  deliveryAddress: string,
  vehicleType: string = "bike",
): Promise<KwikQuoteResult> {
  const token = await getKwikToken();

  const vehicleMap: Record<string, number> = { bike: 1, car: 2, van: 3 };
  const vehicleId = vehicleMap[vehicleType] || 1;

  const res = await fetch(`${KWIK_BASE_URL}/pricing/calculate_price`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pickup_address: pickupAddress,
      delivery_address: deliveryAddress,
      parcel_size: vehicleId,
      is_multiple_delivery: 0,
    }),
  });

  const json = await res.json();

  if (json.status !== 1 && json.status !== true) {
    throw new Error(json.message || "Kwik pricing failed");
  }

  const cost = Number(json.data?.estimated_price || 0);
  const eta = Number(json.data?.estimated_eta || 0);

  if (!Number.isFinite(cost) || cost <= 0) {
    throw new Error("Kwik returned invalid price");
  }

  return {
    shipping: Math.round(cost),
    provider: "KWIK",
    etaMinutes: eta,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { storeId, deliveryAddress, deliveryCity, deliveryState } =
      body as Record<string, string | undefined>;

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "storeId is required" },
        { status: 400 },
      );
    }

    if (!deliveryAddress && !deliveryCity) {
      return NextResponse.json(
        { success: false, error: "Delivery address is required" },
        { status: 400 },
      );
    }

    // Look up store delivery settings
    const settings = await prisma.storeDeliverySettings.findUnique({
      where: { storeId },
    });

    // If delivery is not enabled or no settings, return flat rate
    if (!settings?.isEnabled) {
      return NextResponse.json({
        success: true,
        shipping: DEFAULT_FLAT_RATE,
        provider: "FLAT_RATE",
        etaMinutes: null,
      });
    }

    const fullDeliveryAddress = [deliveryAddress, deliveryCity, deliveryState]
      .filter(Boolean)
      .join(", ");

    // If provider is KWIK and credentials are configured, get real-time quote
    if (settings.provider === "KWIK" && KWIK_EMAIL && KWIK_PASSWORD) {
      const pickupAddress = [
        settings.pickupAddressLine1,
        settings.pickupCity,
        settings.pickupState,
      ]
        .filter(Boolean)
        .join(", ");

      if (!pickupAddress) {
        // No pickup address configured — fall back to flat rate
        return NextResponse.json({
          success: true,
          shipping: DEFAULT_FLAT_RATE,
          provider: "FLAT_RATE",
          etaMinutes: null,
          note: "Merchant pickup address not configured",
        });
      }

      try {
        const quote = await getKwikQuote(pickupAddress, fullDeliveryAddress);
        return NextResponse.json({
          success: true,
          ...quote,
        });
      } catch {
        // Kwik API failed — fall back to flat rate
        return NextResponse.json({
          success: true,
          shipping: DEFAULT_FLAT_RATE,
          provider: "FLAT_RATE",
          etaMinutes: null,
          note: "Real-time quote unavailable, using flat rate",
        });
      }
    }

    // CUSTOM provider or no Kwik credentials — flat rate
    return NextResponse.json({
      success: true,
      shipping: DEFAULT_FLAT_RATE,
      provider: "FLAT_RATE",
      etaMinutes: null,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to calculate shipping" },
      { status: 500 },
    );
  }
}
