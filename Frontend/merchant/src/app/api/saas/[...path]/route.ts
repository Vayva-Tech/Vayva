import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";

async function proxy(request: NextRequest): Promise<Response> {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pathname, search } = new URL(request.url);
  const suffix = pathname.replace(/^\/api\/saas/, "");
  const targetUrl = buildBackendUrl(`/api/saas${suffix}${search}`);

  const init: RequestInit = {
    method: request.method,
    headers: {
      ...auth.headers,
    },
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    // Preserve raw body when possible
    init.body = await request.text();
  }

  const upstream = await fetch(targetUrl, init);
  const body = await upstream.arrayBuffer();

  const resHeaders = new Headers(upstream.headers);
  resHeaders.set("Cache-Control", "no-store");

  return new Response(body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export async function GET(request: NextRequest) {
  return proxy(request);
}
export async function POST(request: NextRequest) {
  return proxy(request);
}
export async function PUT(request: NextRequest) {
  return proxy(request);
}
export async function PATCH(request: NextRequest) {
  return proxy(request);
}
export async function DELETE(request: NextRequest) {
  return proxy(request);
}
export async function OPTIONS(request: NextRequest) {
  return proxy(request);
}
export async function HEAD(request: NextRequest) {
  return proxy(request);
}

