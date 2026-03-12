import { NextRequest, NextResponse } from "next/server";
import { ReturnTokenService } from "@/lib/returns/returnToken";
import { ReturnService } from "@/lib/returns/returnService";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const token = getString(body.token);
    const items = Array.isArray(body.items) ? body.items : [];
    const reason = getString(body.reason);
    const notes = getString(body.notes);
    const preferredMethod = getString(body.preferredMethod);

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const claims = ReturnTokenService.validate(token);
    if (!claims) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Pass empty string as merchantId - ReturnService will use order.storeId
    const request = await ReturnService.createRequest(
      "", // merchantId - will be replaced by order.storeId in service
      claims.orderId,
      claims.customerPhone,
      { items, reason, notes, preferredMethod }
    );

    return NextResponse.json({ success: true, id: request.id });
  } catch (e) {
    logger.error("[PUBLIC_RETURNS_REQUEST]", e instanceof Error ? e : new Error(String(e)));
    return NextResponse.json(
      { error: "Failed to process return request" },
      { status: 500 }
    );
  }
}
