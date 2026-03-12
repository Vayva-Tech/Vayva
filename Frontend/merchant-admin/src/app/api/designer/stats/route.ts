import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    // Designer portal is not fully implemented yet.
    // Return stable zeroed stats so the dashboard can render without missing-route errors.
    return NextResponse.json({
        totalEarnings: 0,
        totalDownloads: 0,
        reviewQueue: 0,
        templateCount: 0,
    }, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
