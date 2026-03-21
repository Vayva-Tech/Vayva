import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const upstreamBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const isAbsoluteUpstream =
      typeof upstreamBaseUrl === "string" && /^https?:\/\//i.test(upstreamBaseUrl);

    if (!isAbsoluteUpstream) {
      return NextResponse.json(
        {
          error: "Gone",
          message:
            "Webhook ingress is gateway-only. Configure your provider to call the API Gateway (/webhooks/whatsapp/evolution) and set NEXT_PUBLIC_API_URL to an absolute gateway URL.",
        },
        { status: 410 }
      );
    }

    const base = upstreamBaseUrl.replace(/\/$/, "").replace(/\/v1$/, "");
    const upstreamUrl = `${base}/webhooks/whatsapp/evolution`;

    const apikey = request.headers.get("apikey") || "";
    const authorization = request.headers.get("authorization") || "";

    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apikey ? { apikey } : {}),
        ...(authorization ? { authorization } : {}),
      },
      body: rawBody,
    });

    const upstreamData = await upstreamResponse
      .json()
      .catch(async () => ({ raw: await upstreamResponse.text() }));

    return NextResponse.json(upstreamData, { status: upstreamResponse.status });
  } catch (error) {
    logger.error("[WHATSAPP_WEBHOOK] Unhandled error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
