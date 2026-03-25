import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";

function workflowServiceBase(): string {
  return (process.env.WORKFLOW_SERVICE_URL || "http://127.0.0.1:3004").replace(
    /\/$/,
    "",
  );
}

/** GET /api/workflows — list workflows for current store (proxied to workflow service) */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const url = new URL(`${workflowServiceBase()}/api/workflows`);
      url.searchParams.set("merchantId", storeId);
      const incoming = new URL(req.url).searchParams;
      const industry = incoming.get("industry");
      const status = incoming.get("status");
      if (industry) url.searchParams.set("industry", industry);
      if (status) url.searchParams.set("status", status);

      const res = await fetch(url.toString(), { method: "GET" });
      const body: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error: unknown }).error === "string"
            ? (body as { error: string }).error
            : "Workflow service error";
        return NextResponse.json(
          { error: msg },
          { status: res.status, headers: standardHeaders(requestId) },
        );
      }
      return NextResponse.json(body, { headers: standardHeaders(requestId) });
    } catch (e: unknown) {
      logger.error("[WORKFLOWS_PROXY_LIST]", { error: e, storeId });
      return NextResponse.json(
        { error: "Failed to reach workflow service" },
        { status: 502, headers: standardHeaders(requestId) },
      );
    }
  },
);

/** POST /api/workflows — create workflow */
export const POST = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const bodyText = await req.text();
      const url = new URL(`${workflowServiceBase()}/api/workflows`);
      url.searchParams.set("merchantId", storeId);
      url.searchParams.set("userId", user.id);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyText,
      });
      const body: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json(body, {
          status: res.status,
          headers: standardHeaders(requestId),
        });
      }
      return NextResponse.json(body, {
        status: res.status,
        headers: standardHeaders(requestId),
      });
    } catch (e: unknown) {
      logger.error("[WORKFLOWS_PROXY_CREATE]", { error: e, storeId });
      return NextResponse.json(
        { error: "Failed to reach workflow service" },
        { status: 502, headers: standardHeaders(requestId) },
      );
    }
  },
);
