import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const { id } = await params;

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
      `/api/ops/support/tickets/${id}`,
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

    const text = await upstreamRes.text();
    // Don't pass through 401 from upstream to prevent frontend logout
    const status = upstreamRes.status === 401 ? 503 : upstreamRes.status;
    return new Response(text, {
      status,
      headers: {
        "Content-Type":
          upstreamRes.headers.get("content-type") || "application/json",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    logger.error("[SUPPORT_TICKET_GET_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "SUPERVISOR");

    const { id } = await params;

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

    const bodyText = await req.text();
    const upstreamUrl = new URL(
      `/api/ops/support/tickets/${id}`,
      merchantAdminBaseUrl,
    );

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalSecret,
        "x-vayva-client": "ops-console",
      },
      body: bodyText,
      cache: "no-store",
    });

    const text = await upstreamRes.text();
    // Don't pass through 401 from upstream to prevent frontend logout
    const status = upstreamRes.status === 401 ? 503 : upstreamRes.status;
    return new Response(text, {
      status,
      headers: {
        "Content-Type":
          upstreamRes.headers.get("content-type") || "application/json",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    logger.error("[SUPPORT_TICKET_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
