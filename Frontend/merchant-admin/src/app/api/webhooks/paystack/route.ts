import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/webhooks/verify";
import { logger } from "@/lib/logger";

/**
 * Paystack Webhook Handler (Asynchronous)
 * Validates signature and forwards to backend for processing.
 */
export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-paystack-signature") || "";

        // Validate Paystack signature
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) {
            logger.error("[PAYSTACK_WEBHOOK] PAYSTACK_SECRET_KEY not configured");
            return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
        }

        if (!signature || !verifyPaystackSignature(rawBody, signature, secret)) {
            logger.warn("[PAYSTACK_WEBHOOK] Invalid signature", { signature: signature.slice(0, 8) + "..." });
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
            { status: 410 },
        );
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[PAYSTACK_WEBHOOK_PROXY]", { error: err.message });
        // Return 200 to prevent Paystack from retrying on unexpected errors
        return NextResponse.json({ received: true }, { status: 200 });
    }
}
