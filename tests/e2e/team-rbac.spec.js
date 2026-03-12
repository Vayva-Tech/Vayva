import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";
import { TeamService } from "../../apps/merchant-admin/src/lib/team/teamService";
import { can, ROLES, PERMISSIONS, } from "../../apps/merchant-admin/src/lib/team/permissions";
import { prisma } from "@vayva/db";
test.describe("Team RBAC v2", () => {
    test("Permission Matrix", () => {
        expect(can(ROLES.OWNER, PERMISSIONS.REFUNDS_MANAGE)).toBe(true);
        expect(can(ROLES.VIEWER, PERMISSIONS.REFUNDS_MANAGE)).toBe(false);
        expect(can(ROLES.FINANCE, PERMISSIONS.REFUNDS_MANAGE)).toBe(true);
        expect(can(ROLES.SUPPORT, PERMISSIONS.TEAM_MANAGE)).toBe(false); // Support cannot manage team
    });
    const merchantId = "team_test_store_1";
    const email = "newhire@vayva.ng";
    test.beforeAll(async () => {
        // ... (existing cleanup)
        // Cleanup old invites
        await prisma.staffInvite.deleteMany({
            where: { storeId: merchantId, email: email },
        });
        // Ensure owner exists if needed
        await prisma.user.upsert({
            where: { id: "owner_u" },
            update: {},
            create: {
                id: "owner_u",
                email: "owner@test.com",
                password: "hashed_pass",
                firstName: "Owner",
                lastName: "User",
            },
        });
        // Ensure store exists
        await prisma.store.upsert({
            where: { id: merchantId },
            update: {},
            create: {
                id: merchantId,
                name: "Team Test Store",
                slug: merchantId,
            },
        });
        // Create membership
        await prisma.membership.upsert({
            where: {
                id: "mem_owner_team_test",
            },
            update: {},
            create: {
                id: "mem_owner_team_test",
                userId: "owner_u",
                storeId: merchantId,
                role: "owner",
                status: "active",
            },
        });
    });
    test("Invite Flow", async () => {
        // Cleanup specific to this test run in case of retries
        await prisma.staffInvite.deleteMany({
            where: { storeId: merchantId, email: email },
        });
        // Invite
        await TeamService.inviteMember(merchantId, "owner_u", {
            email,
            role: ROLES.ADMIN,
        });
        const invite = await prisma.staffInvite.findFirst({
            where: { storeId: merchantId, email: email },
        });
        expect(invite).toBeTruthy();
        expect(invite?.token).toBeTruthy();
    });
    test("UI Renders", async ({ page }) => {
        await createAuthenticatedMerchantContext(page);
        await page.goto("/admin/settings/team");
        await expect(page.getByText("Team Members")).toBeVisible();
        await expect(page.getByText("User")).toBeVisible(); // Column header
    });
});
