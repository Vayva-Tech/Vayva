/**
 * Custom Domains API
 *
 * Manage custom domains for merchant stores
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { logger, ErrorCategory } from "@/lib/logger";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

const addDomainSchema = z.object({
  domain: z
    .string()
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
      "Invalid domain format"
    ),
});

type CustomDomainApi = {
  id: string;
  storeId: string;
  domain: string;
  status?: string;
  verificationType?: string;
  expectedValue?: string;
  createdAt?: string | Date;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parseCustomDomain(v: unknown): CustomDomainApi | null {
  if (!isRecord(v)) return null;
  const id = v.id;
  const storeId = v.storeId;
  const domain = v.domain;
  if (typeof id !== "string" || typeof storeId !== "string" || typeof domain !== "string") {
    return null;
  }
  return {
    id,
    storeId,
    domain,
    status: typeof v.status === "string" ? v.status : undefined,
    verificationType:
      typeof v.verificationType === "string" ? v.verificationType : undefined,
    expectedValue: typeof v.expectedValue === "string" ? v.expectedValue : undefined,
    createdAt: v.createdAt as string | Date | undefined,
  };
}

/**
 * GET /api/merchant/domains
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customDomainsRaw = await apiJson<unknown>(`${backendBase()}/api/customdomain`, {
      headers: auth.headers,
    });

    const storePayload = await apiJson<unknown>(`${backendBase()}/api/store`, {
      headers: auth.headers,
    });

    let primaryDomain: string | undefined;
    if (isRecord(storePayload)) {
      const settings = storePayload.settings;
      if (isRecord(settings) && typeof settings.primaryDomain === "string") {
        primaryDomain = settings.primaryDomain;
      }
    }

    const listRaw = Array.isArray(customDomainsRaw) ? customDomainsRaw : [];
    const list = listRaw.map(parseCustomDomain).filter((d): d is CustomDomainApi => d !== null);

    const domains = list.map((domain) => ({
      id: domain.id,
      domain: domain.domain,
      status: domain.status === "active" ? "active" : "pending",
      dnsVerified: domain.status === "active",
      sslStatus: domain.status === "active" ? "active" : "pending",
      isPrimary: primaryDomain === domain.domain,
      verificationType: domain.verificationType,
      expectedValue: domain.expectedValue,
      createdAt:
        domain.createdAt instanceof Date
          ? domain.createdAt.toISOString()
          : domain.createdAt,
    }));

    return NextResponse.json({ domains });
  } catch (error) {
    logger.error("Failed to fetch domains:", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }
}

/**
 * POST /api/merchant/domains
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const result = addDomainSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid domain format", details: result.error.issues },
        { status: 400 }
      );
    }

    const customDomainRaw = await apiJson<unknown>(`${backendBase()}/api/customdomain`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(body),
    });

    const customDomain = parseCustomDomain(customDomainRaw);
    if (!customDomain) {
      return NextResponse.json({ error: "Invalid response from server" }, { status: 502 });
    }

    const newDomain = {
      id: customDomain.id,
      storeId: customDomain.storeId,
      domain: customDomain.domain,
      status: "pending",
      dnsVerified: false,
      sslStatus: "pending",
      isPrimary: false,
      verificationType: customDomain.verificationType,
      expectedValue: customDomain.expectedValue,
      createdAt:
        customDomain.createdAt instanceof Date
          ? customDomain.createdAt.toISOString()
          : customDomain.createdAt,
    };

    return NextResponse.json({ domain: newDomain }, { status: 201 });
  } catch (error) {
    logger.error("Failed to add domain:", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 });
  }
}

/**
 * DELETE /api/merchant/domains
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("id");

    if (!domainId) {
      return NextResponse.json({ error: "Domain ID parameter required" }, { status: 400 });
    }

    const deleteResult = await apiJson<{ success: boolean; error?: string }>(
      `${backendBase()}/api/customdomain/${encodeURIComponent(domainId)}`,
      {
        method: "DELETE",
        headers: auth.headers,
      }
    );

    return NextResponse.json(deleteResult);
  } catch (error) {
    logger.error("Failed to remove domain:", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to remove domain" }, { status: 500 });
  }
}
