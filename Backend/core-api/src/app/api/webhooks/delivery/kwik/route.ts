import { NextRequest, NextResponse } from "next/server";
import { prisma, DispatchJobStatus } from "@vayva/db";
import crypto from "crypto";
import { sendDeliveryStatusUpdate } from "@/lib/tracking-notifications";
import { logger } from "@vayva/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return {};
  }
}

function normalizeSignature(sig: string): string {
  // Support "sha256=<hex>" and raw hex formats.
  const s = sig.trim();
  const idx = s.indexOf("=");
  if (idx > 0) return s.slice(idx + 1).trim();
  return s;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: NextRequest) {
  const secret = process.env.KWIK_WEBHOOK_SECRET;
  const signature = req.headers.get("x-kwik-signature");
  // 1. Security Guard (HMAC-SHA256 on raw body)
  if (!secret || !signature) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await req.text().catch(() => "");
  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const incoming = normalizeSignature(signature);
  if (!timingSafeEqualHex(incoming, computed)) {
    return NextResponse.json({ success: false, error: "Invalid Signature" }, { status: 403 });
  }

  const parsedBody: unknown = safeJsonParse(rawBody);
  const body = isRecord(parsedBody) ? parsedBody : {};

  const jobId = getString(body.job_id) || String(body.job_id || "");
  const status = body.status;
  const jobStatus = body.job_status;
  // Map Kwik status to Vayva status
  // 0: PENDING, 1: ACCEPTED, 2: STARTED, 3: IN_PROGRESS, 4: COMPLETED, 5: FAILED? (Hypothetical)
  const kwikStatus = jobStatus ?? status; // Fallback
  let vayvaStatus = "UNKNOWN";
  switch (Number(kwikStatus)) {
    case 1:
      vayvaStatus = "ACCEPTED";
      break;
    case 2:
      vayvaStatus = "PICKED_UP";
      break; // Driver assigned/started
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
      vayvaStatus = "UNKNOWN"; // Do not update if unknown
  }
  if (vayvaStatus === "UNKNOWN") {
    return NextResponse.json(
      { success: true, message: "Ignored Status" },
      { status: 200 },
    );
  }
  // 2. Idempotency & Locking (Shipment Status)
  // We only want to update if the status is advancing.
  // "Forward-only" state machine.
  // E.g. If already DELIVERED, don't set back to IN_TRANSIT.
  // Valid transitions map could be complex, but for MVP:
  // Don't update if already same status.
  // Webhook may send job hash or other identifier; try trackingCode first, then search in notes metadata.
  const shipment =
    (await prisma.shipment.findFirst({ where: { trackingCode: jobId } })) ??
    (await prisma.shipment.findFirst({
      where: {
        provider: "KWIK",
        notes: { contains: jobId },
      },
    }));
  if (!shipment)
    return NextResponse.json(
      { success: false, error: "Shipment Not Found" },
      { status: 404 },
    );
  if (shipment.status === vayvaStatus) {
    return NextResponse.json(
      { success: true, message: "Idempotent: Status already set" },
      { status: 200 },
    );
  }
  // 3. Update Status
  await prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      status: vayvaStatus as DispatchJobStatus,
      // Append to history/notes?
    },
  });

  try {
    await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: vayvaStatus,
        locationText: null,
        description: `Kwik webhook update (${jobId})`,
        occurredAt: new Date(),
      },
    });
  } catch {
    // non-blocking
  }

  // 4. Send status update notification to customer (for significant status changes)
  const significantStatuses = ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"];
  if (significantStatuses.includes(vayvaStatus) && shipment.trackingCode && shipment.recipientPhone) {
    try {
      // Get store information for the notification
      const store = await prisma.store.findUnique({
        where: { id: shipment.storeId },
        select: { name: true },
      });

      const storefrontUrl = undefined;

      const notificationResult = await sendDeliveryStatusUpdate(
        shipment.recipientPhone,
        shipment.trackingCode,
        vayvaStatus,
        store?.name || "Vayva Store",
        storefrontUrl,
      );

      if (notificationResult.success) {
        logger.info("[KWIK_WEBHOOK] Status notification sent", {
          trackingCode: shipment.trackingCode,
          status: vayvaStatus,
          phone: shipment.recipientPhone.replace(/\d(?=\d{4})/g, "*"),
        });
      } else {
        logger.warn("[KWIK_WEBHOOK] Failed to send status notification", {
          trackingCode: shipment.trackingCode,
          error: notificationResult.error,
        });
      }
    } catch (notificationError) {
      logger.error("[KWIK_WEBHOOK] Error sending status notification", {
        error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        trackingCode: shipment.trackingCode,
      });
    }
  }

  // 5. Audit Log
  // Using dynamic import to avoid circular dep issues in this file context if any
  try {
    // Manual simple audit if logAudit not available easily here
    // But we should use prisma
    /*
        await prisma.auditLog.create(...)
        */
  } catch {
    // Intentionally empty
  }
  return NextResponse.json(
    { success: true, message: "Updated" },
    { status: 200 },
  );
}
