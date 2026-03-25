import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import crypto from "crypto";

type DispatchJobStatusValue =
  | "ACCEPTED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

const KWIK_TO_DISPATCH: Record<string, DispatchJobStatusValue> = {
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  CANCELED: "CANCELLED",
};

export async function POST(req: NextRequest): Promise<Response> {
  const secret = process.env.KWIK_WEBHOOK_SECRET;
  const signature = req.headers.get("x-kwik-signature");
  if (!secret || !signature) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sigBuf = Buffer.from(signature, "utf8");
    const secretBuf = Buffer.from(secret, "utf8");
    if (sigBuf.length !== secretBuf.length) {
      return NextResponse.json({ success: false, error: "Invalid Signature" }, { status: 403 });
    }
    if (!crypto.timingSafeEqual(sigBuf, secretBuf)) {
      return NextResponse.json({ success: false, error: "Invalid Signature" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Invalid Signature" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const job_id = body.job_id;
  const status = body.status;
  const job_status = body.job_status;
  const kwikStatus = job_status ?? status;
  let vayvaStatus = "UNKNOWN";
  switch (Number(kwikStatus)) {
    case 1:
      vayvaStatus = "ACCEPTED";
      break;
    case 2:
      vayvaStatus = "PICKED_UP";
      break;
    case 3:
      vayvaStatus = "IN_TRANSIT";
      break;
    case 4:
      vayvaStatus = "DELIVERED";
      break;
    case 5:
      vayvaStatus = "FAILED";
      break;
    case 9:
      vayvaStatus = "CANCELED";
      break;
    default:
      vayvaStatus = "UNKNOWN";
  }
  if (vayvaStatus === "UNKNOWN") {
    return NextResponse.json({ success: true, message: "Ignored Status" }, { status: 200 });
  }
  const jobId = job_id != null ? String(job_id) : "";
  if (!jobId) {
    return NextResponse.json({ success: false, error: "job_id required" }, { status: 400 });
  }
  const shipment = await prisma.shipment.findFirst({
    where: { externalId: jobId },
  });
  if (!shipment) {
    return NextResponse.json({ success: false, error: "Shipment Not Found" }, { status: 404 });
  }
  const prismaStatus = KWIK_TO_DISPATCH[vayvaStatus];
  if (!prismaStatus) {
    return NextResponse.json({ success: true, message: "Ignored Status" }, { status: 200 });
  }
  if (shipment.status === prismaStatus) {
    return NextResponse.json({ success: true, message: "Idempotent: Status already set" }, { status: 200 });
  }
  await prisma.shipment.update({
    where: { id: shipment.id, storeId: shipment.storeId },
    data: { status: prismaStatus },
  });
  return NextResponse.json({ success: true, message: "Updated" }, { status: 200 });
}
