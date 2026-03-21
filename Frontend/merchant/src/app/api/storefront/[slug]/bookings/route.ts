// @ts-nocheck
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: any, { params }: any) {
    try {
        const { slug } = await params;
        const body = await req.json();
        const { serviceId, date, time, customerEmail, customerName, notes } = body;
        
        if (!serviceId || !date || !time || !customerEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        // Call backend API to create booking
        const result = await apiJson<{
            success: boolean;
            booking?: {
                id: string;
                storeId: string;
                serviceId: string;
                customerId: string;
                startsAt: Date;
                endsAt: Date;
                status: string;
            };
            error?: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/storefront/${slug}/bookings`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ serviceId, date, time, customerEmail, customerName, notes }),
            }
        );
        
        if (result.error) {
            return NextResponse.json(result, { status: 400 });
        }
        
        return NextResponse.json(result);
    } catch (error: unknown) {
        handleApiError(
            error,
            {
                endpoint: `/api/storefront/${await params.then(p => p.slug).catch(() => 'unknown')}/bookings`,
                operation: "CREATE_BOOKING",
                storeId: undefined,
            }
        );
        throw error;
    }
}
