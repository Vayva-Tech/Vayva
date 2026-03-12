import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.SECURITY_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; email?: string } }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { currentPassword, newPassword, confirmPassword } = body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: "Current and new password required" }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        // 1. Fetch user
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Verify current password
        const isValid = await bcrypt.compare(currentPassword, dbUser.password);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
        }

        // 3. Hash and update
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // Critical: Update password AND increment sessionVersion to invalidate other sessions
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                sessionVersion: { increment: 1 },
            },
        });

        // 4. Audit Log
        const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
        await logAuditEvent(storeId, user.id, AuditEventType.USER_PASSWORD_CHANGED, {
            targetType: "USER",
            ipAddress,
            meta: {
                action: "password_change",
                actor: { type: "USER", label: user.email || "unknown" }
            }
        });

        return NextResponse.json({ success: true, message: "Password updated and sessions invalidated" });
    }
    catch (error) {
        logger.error("[CHANGE_PASSWORD_POST] Failed to change password", { storeId, userId: user.id, error });
        return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
    }
});
