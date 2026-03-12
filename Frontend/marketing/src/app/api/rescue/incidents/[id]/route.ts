import { NextRequest, NextResponse } from "next/server";
import { MarketingRescueService } from "@/lib/rescue/marketing-rescue-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Publicly accessible for polling by the overlay script
  const { id } = await params;
  const incident = await MarketingRescueService.getIncidentStatus(id);

  if (!incident) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(incident);
}
