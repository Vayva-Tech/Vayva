import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: any) {
    try {
        const rawBody = await req.text();

        const upstreamBaseUrl = process.env.NEXT_PUBLIC_API_URL;
        const isAbsoluteUpstream = typeof upstreamBaseUrl === "string" && /^https?:\/\//i.test(upstreamBaseUrl);

        if (!isAbsoluteUpstream) {
            return NextResponse.json(
                {
                    error: "Gone",
                    message:
                        "Webhook ingress is gateway-only. Configure your provider to call the API Gateway (/webhooks/whatsapp/evolution) and set NEXT_PUBLIC_API_URL to an absolute gateway URL.",
                },
                { status: 410 },
            );
        }

        const base = upstreamBaseUrl.replace(/\/$/, "").replace(/\/v1$/, "");
        const upstreamUrl = `${base}/webhooks/whatsapp/evolution`;

        const apikey = req.headers.get("apikey") || "";
        const authorization = req.headers.get("authorization") || "";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[WHATSAPP_WEBHOOK_PROXY] Failed to proxy webhook", { error: _errMsg });
        return NextResponse.json({ received: true }, { status: 200 });
    }
}
