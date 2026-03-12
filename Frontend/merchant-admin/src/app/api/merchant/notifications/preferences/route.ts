import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { prisma } from "@vayva/db";
import { PERMISSIONS } from "@/lib/team/permissions";
const DEFAULT_PREFS = {
    channels: { in_app: true, banner: true, whatsapp: false, email: true },
    categories: { orders: true, payments: true, account: true, system: true },
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
};
export const GET = withVayvaAPI(PERMISSIONS.NOTIFICATIONS_VIEW, async (_req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    const prefs = await prisma.notificationPreference?.findUnique({
        where: { storeId },
    });
    if (!prefs) {
        return NextResponse.json({
            ...DEFAULT_PREFS,
            merchantId: user.id,
        });
    }
    return NextResponse.json({
        channels: prefs.channels,
        categories: prefs.categories,
        quietHours: prefs.quietHours,
    }, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
});

export const POST = withVayvaAPI(PERMISSIONS.NOTIFICATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    const body = await req.json();
    const updated = await prisma.notificationPreference?.upsert({
        where: { storeId },
        update: {
            channels: body.channels,
            categories: body.categories,
            quietHours: body.quietHours,
        },
        create: {
            storeId,
            channels: body.channels || DEFAULT_PREFS.channels,
            categories: body.categories || DEFAULT_PREFS.categories,
            quietHours: body.quietHours || DEFAULT_PREFS.quietHours,
        },
    });
    return NextResponse.json(updated);
});
