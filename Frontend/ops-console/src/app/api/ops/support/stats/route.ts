import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const merchantAdminBaseUrl =
      process.env.MERCHANT_ADMIN_URL ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
    if (!merchantAdminBaseUrl) {
      return NextResponse.json(
        { error: "MERCHANT_ADMIN_URL not configured" },
        { status: 500 },
      );
    }

    const internalSecret = process.env.INTERNAL_API_SECRET || "";
    if (process.env.NODE_ENV === "production" && !process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { error: "INTERNAL_API_SECRET not configured" },
        { status: 500 },
      );
    }

    const upstreamUrl = new URL(
      "/api/ops/support/tickets/stats",
      merchantAdminBaseUrl,
    );

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        "x-internal-secret": internalSecret,
        "x-vayva-client": "ops-console",
      },
      cache: "no-store",
    });

    const contentType = upstreamRes.headers.get("content-type") || "";
    if (!upstreamRes.ok || !contentType.includes("application/json")) {
      const text = await upstreamRes.text();
      // Don't pass through 401 from upstream to prevent frontend logout
      const status = upstreamRes.status === 401 ? 503 : upstreamRes.status;
      return new Response(text, {
        status,
        headers: {
          "Content-Type": contentType || "application/json",
        },
      });
    }

    const json = await upstreamRes.json().catch(() => ({}));
    const stats = (json as { data?: { total: number; open: number; resolved: number } })?.data || json;

    return NextResponse.json({
      total: stats?.total || 0,
      open: stats?.open || 0,
      resolved: stats?.resolved || 0,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    )
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 403 },
      );

    logger.error("[SUPPORT_STATS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
