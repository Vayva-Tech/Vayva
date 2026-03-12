import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

// Paystack standard transfer rate (simulated) -> 10 NGN if < 5000, 25 if < 50000, 50 otherwise
const calculateFee = (amount: number) => {
    if (amount <= 5000)
        return 10;
    if (amount <= 50000)
        return 25;
    return 50;
};

export const runtime = "nodejs";

export const POST = withVayvaAPI(PERMISSIONS.FINANCE_VIEW, async (request: any) => {
    const body = await request.json().catch(() => ({})) as { amount?: number };
    const amount = Number(body?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const fee = calculateFee(amount);
    return NextResponse.json({
        amount,
        fee,
        netAmount: amount - fee,
        currency: "NGN",
        estimatedArrival: "within 24 hours",
    }, { headers: { "Cache-Control": "no-store" } });
});
