import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.ACCOUNT_MANAGE, async (req: NextRequest, { storeId, user }: APIContext) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { field, newValue, otp } = body;

        if (!field || !newValue || !otp) {
            return NextResponse.json({ error: "field, newValue, and otp are required" }, { status: 400 });
        }

        if (!["email", "phone", "businessPhone"].includes(field)) {
            return NextResponse.json({ error: "Invalid field" }, { status: 400 });
        }

        if (typeof otp !== "string" || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
        }

        const identifier = `${user.id}:account:${field}`;
        const expectedType = `ACCOUNT_FIELD_CHANGE:${field}:${Buffer.from(newValue).toString("base64")}`;

        // Find valid OTP
        const otpRecord = await prisma.otpCode?.findFirst({
            where: {
                identifier,
                code: otp,
                type: expectedType,
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!otpRecord) {
            return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
        }

        // Mark OTP as used
        await prisma.otpCode?.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        });

        // Apply the field change
        if (field === "email") {
            // Check uniqueness again (race condition guard)
            const existing = await prisma.user?.findUnique({ where: { email: newValue.toLowerCase() } });
            if (existing && existing.id !== user.id) {
                return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
            }

            await prisma.user?.update({
                where: { id: user.id },
                data: { email: newValue.toLowerCase() },
            });
        } else if (field === "phone") {
            await prisma.user?.update({
                where: { id: user.id },
                data: { phone: String(newValue).trim() },
            });
        } else if (field === "businessPhone") {
            const store = await prisma.store?.findUnique({
                where: { id: storeId },
                select: { contacts: true },
            });
            const contacts = (store?.contacts as Record<string, unknown>) || {};

            await prisma.store?.update({
                where: { id: storeId },
                data: {
                    contacts: {
                        ...contacts,
                        phone: String(newValue).trim(),
                    },
                },
            });
        }

        return NextResponse.json({ success: true }, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error: unknown) {
        logger.error("[ACCOUNT_OTP_VERIFY]", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
});
