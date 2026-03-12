import { test, expect } from "@playwright/test";
import { AuthFlowService } from "../../apps/merchant-admin/src/lib/security/authFlowService";
import { LifecycleService } from "../../apps/merchant-admin/src/lib/security/lifecycleService";
import { prisma } from "@vayva/db";
test.describe("Account Lifecycle & Security", () => {
    const userId = "user_test_lifecycle";
    const email = "test@vayva.ng";
    const merchantId = "merch_test_lifecycle";
    test.beforeAll(async () => {
        // Cleanup with safe checks in case schema is partial (though we fixed it)
        try {
            await prisma.userEmailVerification.deleteMany({ where: { userId } });
            await prisma.passwordResetToken.deleteMany({ where: { userId } });
            await prisma.merchantAccountLifecycle.deleteMany({
                where: { merchantId },
            });
        }
        catch (e) {
            console.warn("Cleanup failed, schema might be missing models yet in test env", e);
        }
    });
    test("email verification flow", async () => {
        // Request
        await AuthFlowService.requestEmailVerification(userId, email);
        const record = await prisma.userEmailVerification.findUnique({
            where: { userId },
        });
        expect(record).toBeTruthy();
        expect(record?.tokenHash).toBeTruthy();
        // Cannot verify with random token
        // This confirms hash check logic
        await expect(AuthFlowService.confirmEmailVerification("invalid_token")).rejects.toThrow();
    });
    test("password reset flow", async () => {
        await AuthFlowService.requestPasswordReset(email);
        const tokens = await prisma.passwordResetToken.findMany({
            where: { userId: "mock_user_id" },
        });
        expect(tokens.length).toBeGreaterThan(0);
        expect(tokens[0].tokenHash).not.toBe("plain_token");
    });
    test("account deletion flow", async () => {
        await LifecycleService.requestDeletion(merchantId, "Leaving platform");
        const lifecycle = await prisma.merchantAccountLifecycle.findUnique({
            where: { merchantId },
        });
        expect(lifecycle?.status).toBe("deletion_requested");
        await LifecycleService.cancelDeletion(merchantId);
        const cancelled = await prisma.merchantAccountLifecycle.findUnique({
            where: { merchantId },
        });
        expect(cancelled?.status).toBe("active");
    });
});
