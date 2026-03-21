import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");
        const serviceId = searchParams.get("serviceId");
        
        if (!dateStr) {
            return NextResponse.json({ error: "Date required" }, { status: 400 });
        }
        
        // Call backend API to fetch availability
        const result = await apiJson<{
            availableSlots: string[];
            bookedSlots: string[];
            date: string;
            serviceId?: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/storefront/${slug}/availability?date=${dateStr}&serviceId=${serviceId || ''}`,
            {
                headers: {},
            }
        );
        
        return NextResponse.json(result);
    } catch (error: unknown) {
        handleApiError(
            error,
            {
                endpoint: `/api/storefront/${await params.then(p => p.slug).catch(() => 'unknown')}/availability`,
                operation: "GET_AVAILABILITY",
                storeId: undefined,
            }
        );
        throw error;
    }
}
