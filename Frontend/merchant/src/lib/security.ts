import { prisma } from "@vayva/db";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/session";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
export async function checkSudoMode(userId: string, storeId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token)
        return false;
    const session = await prisma.merchantSession.findUnique({
        where: { token },
    });
    if (!session || !session.sudoExpiresAt)
        return false;
    if (session.sudoExpiresAt < new Date()) {
        return false;
    }
    return true;
}
export async function requireSudoMode(userId: string, storeId: string) {
    const isSudo = await checkSudoMode(userId, storeId);
    if (!isSudo) {
        await logAuditEvent(storeId, userId, "SECURITY_STEP_UP_REQUIRED" as any, { targetType: "SECURITY" });
        throw new Error("Sudo mode required");
    }
}
