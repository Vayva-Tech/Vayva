// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: any) {
    const secret = process.env.KWIK_WEBHOOK_SECRET;
    const signature = req.headers.get("x-kwik-signature");
    if (!secret || !signature) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Timing-safe comparison to prevent timing attacks
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
    
    const body = await req.json();
    const { job_id, status, job_status } = body;
    const kwikStatus = job_status ?? status;
    let vayvaStatus = "UNKNOWN";
    switch (Number(kwikStatus)) {
        case 1: vayvaStatus = "ACCEPTED"; break;
        case 2: vayvaStatus = "PICKED_UP"; break;
        case 3: vayvaStatus = "IN_TRANSIT"; break;
        case 4: vayvaStatus = "DELIVERED"; break;
        case 5: vayvaStatus = "FAILED"; break;
        case 9: vayvaStatus = "CANCELED"; break;
        default: vayvaStatus = "UNKNOWN";
    }
    if (vayvaStatus === "UNKNOWN") {
        return NextResponse.json({ success: true, message: "Ignored Status" }, { status: 200 });
    }
    const shipment = await apiJson<{
        success: boolean;
        data?: any;
        error?: string;
      }>(`${process.env.BACKEND_API_URL}/api/shipment/id`, {
        headers: {
          "x-store-id": storeId,
        },
      });
    if (!shipment)
        return NextResponse.json({ success: false, error: "Shipment Not Found" }, { status: 404 });
    if (shipment.status === vayvaStatus) {
        return NextResponse.json({ success: true, message: "Idempotent: Status already set" }, { status: 200 });
    }
    await prisma.shipment.update({
        where: { id: shipment.id },
        data: { status: vayvaStatus as any }
    });
    return NextResponse.json({ success: true, message: "Updated" }, { status: 200 });
}
