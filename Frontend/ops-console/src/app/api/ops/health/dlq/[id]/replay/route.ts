import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  // DLQ replay not yet implemented — return 501
  return NextResponse.json(
    { 
      error: "Not Implemented",
      message: "DLQ replay functionality is not yet available",
      id,
      status: "NOT_IMPLEMENTED"
    },
    { status: 501 }
  );
}
