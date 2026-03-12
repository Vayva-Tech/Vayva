// /api/whatsapp/instance/status - Check Evolution API instance connection status
import { NextResponse } from "next/server";
import { logger } from "@vayva/shared";

/**
 * GET /api/whatsapp/instance/status?instanceName=store_123
 * Returns the connection status of a WhatsApp instance from Evolution API
 */
export async function GET(request: Request) {
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    throw new Error("EVOLUTION_API_URL and EVOLUTION_API_KEY must be configured");
  }
  try {
    const { searchParams } = new URL(request.url);
    const instanceName = searchParams.get("instanceName");

    if (!instanceName) {
      return NextResponse.json(
        { error: "instanceName is required" },
        { status: 400 }
      );
    }

    // Call Evolution API to check instance state
    const res = await fetch(
      `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
      {
        method: "GET",
        headers: {
          apikey: EVOLUTION_API_KEY,
        },
      }
    );

    if (!res.ok) {
      // Instance doesn't exist or other error
      if (res.status === 404) {
        return NextResponse.json({
          connected: false,
          state: "NOT_FOUND",
          instanceName,
        });
      }

      const errorData = await res.json().catch(() => ({}));
      logger.error("Failed to check WhatsApp instance status", {
        error: errorData,
        instanceName,
        status: res.status,
      });

      return NextResponse.json(
        {
          connected: false,
          error: "Failed to check status",
          state: "ERROR",
          instanceName,
        },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Evolution API returns state in different formats
    // Handle both: { state: "open" } and { connectionState: "open" }
    const state = data.state || data.connectionState || "unknown";
    const isConnected = state === "open" || state === "CONNECTED";

    return NextResponse.json({
      connected: isConnected,
      state,
      instanceName,
      // Include QR code if available (for pending connections)
      qrCode: data.qrcode || data.qrCode || null,
      // Include phone number if connected
      phoneNumber: data.profile?.wid || data.phone || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("WhatsApp status endpoint error", {
      error: message,
    });

    return NextResponse.json(
      {
        connected: false,
        error: "Internal server error",
        state: "ERROR",
      },
      { status: 500 }
    );
  }
}
