// @ts-nocheck
/**
 * Custom Domains API
 *
 * Manage custom domains for merchant stores
 * - Add custom domain
 * - Verify DNS records
 * - Configure SSL
 * - Set primary domain
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";

// Validation schema
const addDomainSchema = z.object({
  domain: z
    .string()
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
      "Invalid domain format"
    ),
});

/**
 * GET /api/merchant/domains
 * List all domains for the current store
 */
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch domains from backend
    const customDomains = await apiJson<Array<any>>(
      `${process.env.BACKEND_API_URL}/api/customdomain`,
      {
        headers: { "x-store-id": storeId },
      }
    );

    // Get primary domain info from store settings
    const store = await apiJson<any>(
      `${process.env.BACKEND_API_URL}/api/store`,
      {
        headers: { "x-store-id": storeId },
      }
    );

    const storeSettings = store?.settings as { primaryDomain?: string } | null;
    const primaryDomain = storeSettings?.primaryDomain;

    const list = Array.isArray(customDomains) ? customDomains : [];

    const domains = list.map((domain: any) => ({
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
    console.error("Failed to fetch domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/merchant/domains
 * Add a new custom domain
 */
export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = addDomainSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid domain format", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Create domain via backend API
    const customDomain = await apiJson<any>(
      `${process.env.BACKEND_API_URL}/api/customdomain`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify(body),
      }
    );

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
    console.error("Failed to add domain:", error);
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/merchant/domains
 * Remove a custom domain
 */
export async function DELETE(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("id");

    if (!domainId) {
      return NextResponse.json(
        { error: "Domain ID parameter required" },
        { status: 400 }
      );
    }

    // Delete via backend API
    const deleteResult = await apiJson<{ success: boolean; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/customdomain/${domainId}`,
      {
        method: "DELETE",
        headers: { "x-store-id": storeId },
      }
    );

    return NextResponse.json(deleteResult);
  } catch (error) {
    console.error("Failed to remove domain:", error);
    return NextResponse.json(
      { error: "Failed to remove domain" },
      { status: 500 }
    );
  }
}
