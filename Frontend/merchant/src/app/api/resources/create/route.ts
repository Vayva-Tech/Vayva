// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
        const { primaryObject, data } = body;
        if (!primaryObject || !ALLOWED_TYPES.includes(primaryObject)) {
            return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
        }
        // Map Generic Resource Payload to Product Service Payload
        // We pass 'primaryObject' as 'productType'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
            ...data,
            productType: primaryObject,
            // Defaulting title/name mapping if needed, but Service checks for title/name
        };
        
        // Create resource via backend API
        const result = await apiJson<{
            success: boolean;
            data?: { id?: string };
            error?: string;
        }>(`${process.env.BACKEND_API_URL}/api/resources/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-store-id": storeId,
            },
            body: JSON.stringify({ primaryObject, data }),
        });

        if (!result.success) {
            throw new Error(result.error || 'Failed to create resource');
        }

        return NextResponse.json({ success: true, id: result.data?.id || '' });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/resources/create", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
