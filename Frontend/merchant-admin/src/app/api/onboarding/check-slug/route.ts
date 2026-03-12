import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { checkRateLimitCustom, RateLimitError } from "@/lib/ratelimit";

const RESERVED_STORE_SLUGS = new Set([
    "admin",
    "merchant",
    "ops",
    "www",
    "api",
    "support",
    "app",
    "dashboard",
    "help",
    "docs",
    "blog",
    "status",
]);

export async function GET(req: NextRequest) {
    try {
        // Rate limiting: 30 requests per minute per IP
        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        await checkRateLimitCustom(clientIp, "check_slug", 30, 60);

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        const normalized = slug.trim().toLowerCase();
        if (RESERVED_STORE_SLUGS.has(normalized)) {
            return NextResponse.json({
                available: false,
                slug: normalized,
                reason: "reserved",
                message: "This URL is reserved by Vayva. Please choose another.",
            });
        }

        // Check if slug is already taken
        const existing = await prisma.store.findUnique({
            where: { slug: normalized },
            select: { id: true }
        });

        return NextResponse.json({
            available: !existing,
            slug: normalized
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        if (error instanceof RateLimitError) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }
        logger.error("[CHECK_SLUG] Failed to check slug availability", error);
        return NextResponse.json(
            { error: "Failed to check slug availability" },
            { status: 500 }
        );
    }
}
