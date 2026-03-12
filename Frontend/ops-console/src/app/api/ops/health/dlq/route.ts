import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // DLQ not yet implemented — return 501 with clear messaging
  return NextResponse.json(
    { 
      error: "Not Implemented",
      message: "Dead Letter Queue functionality is not yet available",
      data: []
    },
    { status: 501 }
  );
}
