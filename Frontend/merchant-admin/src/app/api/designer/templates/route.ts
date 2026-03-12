import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    try {
        // Check if designerTemplate model exists
        if (!(prisma as unknown as Record<string, unknown>).designerTemplate) {
            return NextResponse.json({ templates: [] }, { headers: { "Cache-Control": "no-store" } });
        }

        const templates = await (prisma as unknown as { designerTemplate: { findMany: (args: unknown) => Promise<unknown[]> } }).designerTemplate.findMany({
            where: { status: "approved" },
            orderBy: { createdAt: "desc" },
            take: 50,
        }) || [];

        return NextResponse.json({ templates }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ templates: [] }, { headers: { "Cache-Control": "no-store" } });
    }
}
