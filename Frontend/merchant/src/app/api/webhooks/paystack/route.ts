import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/webhooks/verify";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      logger.error("[PAYSTACK_WEBHOOK] PAYSTACK_SECRET_KEY not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    if (!signature || !verifyPaystackSignature(rawBody, signature, secret)) {
      logger.warn("[PAYSTACK_WEBHOOK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const upstreamBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const isAbsoluteUpstream =
      typeof upstreamBaseUrl === "string" && /^https?:\/\//i.test(upstreamBaseUrl);

    if (isAbsoluteUpstream) {
      const base = upstreamBaseUrl.replace(/\/$/, "").replace(/\/v1$/, "");
      const upstreamUrl = `${base}/webhooks/paystack`;

      const upstreamResponse = await fetch(upstreamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": signature,
        },
        body: rawBody,
      });

      const upstreamData = await upstreamResponse
        .json()
        .catch(async () => ({ raw: await upstreamResponse.text() }));

      return NextResponse.json(upstreamData, { status: upstreamResponse.status });
    }

    return NextResponse.json(
      {
        error: "Gone",
        message:
          "Webhook ingress is gateway-only. Configure Paystack to call the API Gateway (/webhooks/paystack) and set NEXT_PUBLIC_API_URL to an absolute gateway URL.",
      },
      { status: 410 }
    );
  } catch (error) {
    logger.error("[PAYSTACK_WEBHOOK] Unhandled error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
