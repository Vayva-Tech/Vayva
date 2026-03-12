import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      status: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      storeId: true,
    },
  });

  return NextResponse.json({ data: campaigns });
}

export async function POST(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  const campaign = await prisma.campaign.create({
    data: {
      name: body.name || "Untitled Campaign",
      type: body.type || "EMAIL",
      channel: body.channel || "EMAIL",
      status: "DRAFT",
      storeId: body.storeId,
      messageBody: body.messageBody || "",
      createdByUserId: user.id,
    },
  });

  return NextResponse.json({ data: campaign });
}
