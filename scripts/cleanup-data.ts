import { prisma } from "../apps/merchant-admin/src/lib/prisma";

async function cleanup() {
    const isDryRun = !process.argv.includes("--exec");
    console.log(`🧹 Starting Data Cleanup (${isDryRun ? "DRY RUN" : "EXECUTION MODE"})...`);

    // 1. Session Cleanup (> 30 Days Idle)
    // Using native date match to avoid dependencies
    const now = new Date();
    const sessionCutoff = new Date(now.setDate(now.getDate() - 30));

    // Model: UserSession
    // Logic: lastSeenAt < 30 days ago
    const sessions = await prisma.userSession.count({
        where: { lastSeenAt: { lt: sessionCutoff } }
    });
    console.log(`- Found ${sessions} stale sessions (older than ${sessionCutoff.toISOString()})`);

    if (!isDryRun && sessions > 0) {
        await prisma.userSession.deleteMany({
            where: { lastSeenAt: { lt: sessionCutoff } }
        });
        console.log(`  ✅ Deleted ${sessions} sessions.`);
    }

    // 2. Login History / Audit Logs (> 1 Year)
    const auditCutoff = new Date();
    auditCutoff.setFullYear(auditCutoff.getFullYear() - 1);

    try {
        const auditLogs = await prisma.auditLog.count({
            where: { createdAt: { lt: auditCutoff } }
        });
        console.log(`- Found ${auditLogs} old audit logs (older than ${auditCutoff.toISOString()})`);

        if (!isDryRun && auditLogs > 0) {
            await prisma.auditLog.deleteMany({
                where: { createdAt: { lt: auditCutoff } }
            });
            console.log(`  ✅ Deleted ${auditLogs} audit logs.`);
        }
    } catch (_e) {
        console.warn("  ⚠️ AuditLog model might not exist or match this query.");
    }

    console.log("\n✨ Cleanup Complete.");
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
