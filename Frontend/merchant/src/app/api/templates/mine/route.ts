import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { standardHeaders } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const correlationId =
      request.headers.get("x-request-id") || randomUUID();

    const result = await apiJson<{
      success: boolean;
      data: Array<{
        id: string;
        name: string;
        source: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>;
      meta: { count: number };
      requestId: string;
    }>(`${process.env.BACKEND_API_URL}/api/templates/mine`, {
      headers: auth.headers,
    });

    return NextResponse.json(result, {
      headers: standardHeaders(correlationId),
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/templates/mine",
      operation: "GET_TEMPLATES_MINE",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const correlationId =
      request.headers.get("x-request-id") || randomUUID();

    const body: unknown = await request.json();
    if (body === null || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid body", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }
    const b = body as Record<string, unknown>;
    const name = typeof b.name === "string" ? b.name : "";
    const source = typeof b.source === "string" ? b.source : undefined;
    const basedOnSystemTemplateKey =
      typeof b.basedOnSystemTemplateKey === "string"
        ? b.basedOnSystemTemplateKey
        : undefined;
    const webstudioProjectId =
      typeof b.webstudioProjectId === "string"
        ? b.webstudioProjectId
        : undefined;
    const thumbnailUrl =
      typeof b.thumbnailUrl === "string" ? b.thumbnailUrl : undefined;

    if (!name.trim()) {
      return NextResponse.json(
        { error: "Name is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    const result = await apiJson<{
      success: boolean;
      data: {
        id: string;
        name: string;
        source: string;
        status: string;
      };
      requestId: string;
    }>(`${process.env.BACKEND_API_URL}/api/templates/mine`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({
        name: name.trim(),
        source,
        basedOnSystemTemplateKey,
        webstudioProjectId,
        thumbnailUrl,
      }),
    });

    return NextResponse.json(result, {
      status: 201,
      headers: standardHeaders(correlationId),
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/templates/mine",
      operation: "POST_TEMPLATES_MINE",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
