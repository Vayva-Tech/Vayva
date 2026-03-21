import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        
        // Call backend API to fetch store by slug
        const result = await apiJson<{
            id: string;
            name: string;
            slug: string;
            logoUrl?: string;
            settings?: unknown;
            category?: string;
            plan?: string;
            isLive: boolean;
            isActive: boolean;
            deliverySettings?: {
                isEnabled: boolean;
                provider?: string;
                pickupAddressLine1?: string;
                pickupCity?: string;
                pickupState?: string;
                pickupPhone?: string;
            };
        }>(
            `${process.env.BACKEND_API_URL}/api/storefront/${slug}/store`,
            {
                headers: {},
            }
        );
        
        if (!result || !result.isActive || !result.isLive) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        
        return NextResponse.json(result);
    } catch (error: unknown) {
        handleApiError(
            error,
            {
                endpoint: `/api/storefront/${await params.then(p => p.slug).catch(() => 'unknown')}/store`,
                operation: "GET_STORE_BY_SLUG",
                storeId: undefined,
            }
        );
        throw error;
    }
}
