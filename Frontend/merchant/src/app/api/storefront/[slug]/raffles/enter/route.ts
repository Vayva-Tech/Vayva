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
        const { raffleId, email, userId } = body;
        
        if (!raffleId || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        // Call backend API to enter raffle
        const result = await apiJson<{
            success: boolean;
            entry?: {
                id: string;
                raffleId: string;
                customerEmail: string;
                storeId: string;
            };
            error?: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/storefront/${slug}/raffles/enter`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ raffleId, email, userId }),
            }
        );
        
        if (result.error) {
            const status = result.error.includes("Already entered") ? 409 : 400;
            return NextResponse.json(result, { status });
        }
        
        return NextResponse.json(result);
    } catch (error: unknown) {
        handleApiError(
            error,
            {
                endpoint: `/api/storefront/${await params.then(p => p.slug).catch(() => 'unknown')}/raffles/enter`,
                operation: "ENTER_RAFFLE",
                storeId: undefined,
            }
        );
        throw error;
    }
}
