import { NextResponse } from "next/server";
import { PaystackService } from "@/lib/payment/paystack";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    try {
        const banks = await PaystackService.getBanks();
        // Filter for active banks only and sort alphabetically
        const activeBanks = banks
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((b: any) => b.active)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((b: any) => ({ name: b.name, code: b.code }));
        
        return NextResponse.json(activeBanks, { headers: { "Cache-Control": "no-store" } });
    }
    catch (error) {
        const storeId = session?.user?.storeId;
        logger.error("[BANKS_GET] Failed to fetch banks", { storeId, error });
        return NextResponse.json({ error: "Failed to fetch banks" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
}
