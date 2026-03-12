import { test, expect } from "@playwright/test";
import { BackupService } from "../../apps/merchant-admin/src/lib/ops/backupService";
import { prisma } from "@vayva/db";
test.describe("Backup & DR Ops", () => {
    test("Backup Health Check", async () => {
        // 1. Simulate Recent Backup
        await prisma.backupReceipt.create({
            data: {
                provider: "manual_test",
                backupType: "full",
                backupId: "bk_123",
                status: "success",
                createdAt: new Date(), // Now
            },
        });
        const health = await BackupService.checkBackupHealth();
        expect(health.healthy).toBe(true);
        // 2. Simulate Old Backup (Manually update time)
        await prisma.backupReceipt.updateMany({
            data: { createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // 48h ago
        });
        const unhealthy = await BackupService.checkBackupHealth();
        expect(unhealthy.healthy).toBe(false);
    });
    test("Restore Drill", async () => {
        const source = "bk_verify_123";
        const result = await BackupService.runRestoreDrill(source);
        expect(result.success).toBe(true);
        const run = await prisma.restoreDrillRun.findFirst({
            orderBy: { startedAt: "desc" },
        });
        expect(run).toBeTruthy();
        expect(run?.status).toBe("success");
        expect(run?.restoreSource).toBe(source);
    });
});
