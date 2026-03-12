import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { prisma } from "@vayva/db";
import { PERMISSIONS } from "@/lib/team/permissions";

export const GET = withVayvaAPI(PERMISSIONS.ACCOUNT_VIEW, async (_req: NextRequest, { user }: { user: { id: string } }) => {
    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { firstName: true, lastName: true, email: true, phone: true }
        });
        return NextResponse.json(dbUser, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.ACCOUNT_MANAGE, async (req: NextRequest, { user }: { user: { id: string } }) => {
    try {
        const body = await req.json();
        const { firstName, lastName, phone } = body as Record<string, unknown>;

        await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(typeof firstName === "string" ? { firstName } : {}),
                ...(typeof lastName === "string" ? { lastName } : {}),
                ...(typeof phone === "string" ? { phone } : {}),
            }
        });

        return NextResponse.json({ success: true });
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
});
