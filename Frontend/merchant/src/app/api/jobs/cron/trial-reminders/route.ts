import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: any) {
    // Basic auth check for cron (e.g., Vercel Cron Secret)
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        // Call backend API to send trial reminders
        const result = await apiJson<{
            success: boolean;
            sent: number;
            failed: number;
        }>(
            `${process.env.BACKEND_API_URL}/api/jobs/cron/trial-reminders`,
            {
                method: "GET",
                headers: {},
            }
        );
        
        return NextResponse.json(result);
    } catch (error: unknown) {
        handleApiError(
            error,
            {
                endpoint: "/api/jobs/cron/trial-reminders",
                operation: "SEND_TRIAL_REMINDERS",
                storeId: undefined,
            }
        );
        throw error;
    }
}
