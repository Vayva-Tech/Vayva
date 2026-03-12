import { NextResponse } from "next/server";
import { getIntegrationHealth } from "@/lib/integration-health";
import { logger } from "@/lib/logger";
export async function GET() {
  try {
    // For public status, we use a global 'SYSTEM_NODE' ID or a test ID
    // since getIntegrationHealth requires a storeId.
    // In a real prod environment, we would aggregate data or use a master store.
    const health = await getIntegrationHealth("SYSTEM_MASTER");
    return NextResponse.json(
      { health },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    logger.error("[PUBLIC_STATUS]", error);
    return NextResponse.json(
      { error: "Status engine unavailable" },
      { status: 500 },
    );
  }
}
