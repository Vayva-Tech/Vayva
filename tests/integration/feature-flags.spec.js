import { test, expect } from "@playwright/test";
import { FlagService } from "../../apps/merchant-admin/src/lib/flags/flagService";
import { prisma } from "@vayva/db";
test.describe("Feature Flags & Kill Switches", () => {
    const KEY = "test.feature.enabled";
    test.beforeAll(async () => {
        // Ensure clean state
        await prisma.featureFlag.deleteMany({ where: { key: KEY } });
        await prisma.featureFlag.create({
            data: {
                key: KEY,
                description: "Integration Test Flag",
                enabled: false, // Default OFF
                rules: {
                    merchant_allowlist: ["allowed_merch_1"],
                    merchant_blocklist: ["blocked_merch_1"],
                },
            },
        });
    });
    test("Global Disabled", async () => {
        const enabled = await FlagService.isEnabled(KEY, {
            merchantId: "random_merch",
        });
        expect(enabled).toBe(false);
    });
    test("Allowlist Override", async () => {
        const enabled = await FlagService.isEnabled(KEY, {
            merchantId: "allowed_merch_1",
        });
        expect(enabled).toBe(true);
    });
    test("Blocklist Prevents", async () => {
        // Even if we enabled global, blocklist should win.
        // Let's enable global first to test blocklist precedence
        await prisma.featureFlag.update({
            where: { key: KEY },
            data: { enabled: true },
        });
        const enabled = await FlagService.isEnabled(KEY, {
            merchantId: "blocked_merch_1",
        });
        expect(enabled).toBe(false);
        const other = await FlagService.isEnabled(KEY, {
            merchantId: "other_merch",
        });
        expect(other).toBe(true); // Global ON
    });
    test("Rollout Determinism", async () => {
        // 50% Rollout
        await prisma.featureFlag.update({
            where: { key: KEY },
            data: {
                enabled: false, // Base off
                rules: { rollout_percent: 50 },
            },
        });
        const id1 = "user_a"; // Hashing to < 50
        const id2 = "user_b"; // Hashing to > 50 (hypothetically, we verify consistency)
        const res1_first = await FlagService.isEnabled(KEY, { merchantId: id1 });
        const res1_second = await FlagService.isEnabled(KEY, { merchantId: id1 });
        expect(res1_first).toBe(res1_second); // MUST BE DETERMINISTIC
    });
});
