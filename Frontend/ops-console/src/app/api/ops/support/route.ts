import { NextRequest, NextResponse } from "next/server";
import { withOpsAPI } from "@/lib/api-handler";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

const getHandler = withOpsAPI(
  async (req: any) => {
    const merchantAdminBaseUrl =
      process.env?.MERCHANT_ADMIN_URL ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
    
    if (!merchantAdminBaseUrl) {
      return NextResponse.json(
        { error: "MERCHANT_ADMIN_URL not configured" },
        { status: 500 },
      );
    }

    const internalSecret = process.env?.INTERNAL_API_SECRET || "";
    if (process.env.NODE_ENV === "production" && !process.env?.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { error: "INTERNAL_API_SECRET not configured" },
        { status: 500 },
      );
    }

    const upstreamUrl = new URL(
      "/api/ops/support/tickets",
      merchantAdminBaseUrl,
    );
    const incomingUrl = new URL(req.url);
    incomingUrl.searchParams?.forEach((value: string, key: string) =>
      upstreamUrl.searchParams?.set(key, value),
    );

    try {
      const upstreamRes = await fetch(upstreamUrl.toString(), {
        method: "GET",
        headers: {
          "x-internal-secret": internalSecret,
          "x-vayva-client": "ops-console",
        },
        cache: "no-store",
      });

      // Handle upstream errors gracefully
      if (!upstreamRes.ok) {
        const errorText = await upstreamRes.text();
        logger.error("[SUPPORT_UPSTREAM_ERROR]", { 
          status: upstreamRes.status,
          error: errorText.substring(0, 500),
        });
        // Don't pass through 401 from upstream to prevent frontend logout
        const status = upstreamRes.status === 401 ? 503 : upstreamRes.status;
        return NextResponse.json(
          { error: "Failed to fetch from upstream", details: errorText.substring(0, 200) },
          { status },
        );
      }

      const data = await upstreamRes.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[SUPPORT_FETCH_ERROR]", { error });
      return NextResponse.json(
        { error: "Failed to connect to support service" },
        { status: 503 },
      );
    }
  },
  { requiredPermission: "OPS_SUPPORT" }
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}
