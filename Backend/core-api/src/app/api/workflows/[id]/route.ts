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

async function proxyJson(
  url: string,
  init: Parameters<typeof fetch>[1],
  requestId: string,
): Promise<NextResponse> {
  const res = await fetch(url, init);
  if (res.status === 204) {
    return new NextResponse(null, {
      status: 204,
      headers: standardHeaders(requestId),
    });
  }
  const body: unknown = await res.json().catch(() => ({}));
  return NextResponse.json(body, {
    status: res.status,
    headers: standardHeaders(requestId),
  });
}

/** GET /api/workflows/[id] */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    const { id } = await params;
    try {
      const url = `${workflowServiceBase()}/api/workflows/${encodeURIComponent(id)}?merchantId=${encodeURIComponent(storeId)}`;
      return await proxyJson(url, { method: "GET" }, requestId);
    } catch (e: unknown) {
      logger.error("[WORKFLOWS_PROXY_GET_ONE]", { error: e, storeId, id });
      return NextResponse.json(
        { error: "Failed to reach workflow service" },
        { status: 502, headers: standardHeaders(requestId) },
      );
    }
  },
);

/** PUT /api/workflows/[id] */
export const PUT = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    const { id } = await params;
    try {
      const bodyText = await req.text();
      const url = `${workflowServiceBase()}/api/workflows/${encodeURIComponent(id)}?merchantId=${encodeURIComponent(storeId)}`;
      return await proxyJson(
        url,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: bodyText,
        },
        requestId,
      );
    } catch (e: unknown) {
      logger.error("[WORKFLOWS_PROXY_PUT]", { error: e, storeId, id });
      return NextResponse.json(
        { error: "Failed to reach workflow service" },
        { status: 502, headers: standardHeaders(requestId) },
      );
    }
  },
);

/** DELETE /api/workflows/[id] */
export const DELETE = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    const { id } = await params;
    try {
      const url = `${workflowServiceBase()}/api/workflows/${encodeURIComponent(id)}?merchantId=${encodeURIComponent(storeId)}`;
      return await proxyJson(url, { method: "DELETE" }, requestId);
    } catch (e: unknown) {
      logger.error("[WORKFLOWS_PROXY_DELETE]", { error: e, storeId, id });
      return NextResponse.json(
        { error: "Failed to reach workflow service" },
        { status: 502, headers: standardHeaders(requestId) },
      );
    }
  },
);
