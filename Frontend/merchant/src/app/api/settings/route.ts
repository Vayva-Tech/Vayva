import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { sanitizeHTML } from "@/lib/sanitization";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const SettingsSchema = z.object({
    name: z.string().min(1).optional(),
    supportEmail: z.string().email().optional(),
    businessCategory: z.string().optional(),
});

interface StoreSettings {
  supportEmail?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    // Call backend API to fetch store settings
    const result = await apiJson<{
        name: string;
        supportEmail: string;
        businessCategory: string;
    }>(
        `${process.env.BACKEND_API_URL}/api/settings`,
        {
            headers: {
                "x-store-id": storeId,
            },
        }
    );

    return NextResponse.json(result, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
  } catch (error) {
    handleApiError(
        error,
        {
            endpoint: "/api/settings",
            operation: "GET_SETTINGS",
            storeId,
        }
    );
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    const body = await request.json();
    const parsed = SettingsSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const data = parsed.data;

    // Call backend API to update settings
    const result = await apiJson<{ success: boolean }>(
        `${process.env.BACKEND_API_URL}/api/settings`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-store-id": storeId,
            },
            body: JSON.stringify({
                ...(data.name && { name: sanitizeHTML(data.name) }),
                ...(data.businessCategory && { businessCategory: sanitizeHTML(data.businessCategory || "") }),
                ...(data.supportEmail && { supportEmail: data.supportEmail }),
            }),
        }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
        error,
        {
            endpoint: "/api/settings",
            operation: "UPDATE_SETTINGS",
            storeId,
        }
    );
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
