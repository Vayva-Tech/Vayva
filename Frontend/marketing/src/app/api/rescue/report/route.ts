import { NextRequest, NextResponse } from "next/server";
import { MarketingRescueService } from "@/lib/rescue/marketing-rescue-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { route, errorMessage, stackHash, fingerprint } = body;

    if (!errorMessage) {
      return NextResponse.json({ error: "No error message" }, { status: 400 });
    }

    const incident = await MarketingRescueService.reportIncident({
      route: route || "unknown",
      errorMessage,
      stackHash,
      fingerprint,
    });

    return NextResponse.json({
      incidentId: incident.id,
      status: incident.status,
      message: "Rescue initiated",
    });
  } catch (error: unknown) {
    console.error("Rescue Report API Error:", error);
    return NextResponse.json({ error: "Failed to report" }, { status: 500 });
  }
}
