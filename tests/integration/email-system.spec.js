import { test, expect } from "@playwright/test";
import { EmailService } from "../../apps/merchant-admin/src/lib/email/emailService";
import { TeamService } from "../../apps/merchant-admin/src/lib/team/teamService";
import { ROLES } from "../../apps/merchant-admin/src/lib/team/permissions";
import { prisma } from "@vayva/db";
test.describe("Email System", () => {
    test("Send Logged to DB", async () => {
        const corrId = `test_email_${Date.now()}`;
        await EmailService.send({
            to: "test@example.com",
            subject: "Test Email",
            html: "<p>Test</p>",
            templateKey: "test_tpl",
            correlationId: corrId,
        });
        const msg = await prisma.emailMessage.findFirst({
            where: { correlationId: corrId },
        });
        expect(msg).toBeTruthy();
        expect(msg?.status).toBe("sent");
        expect(msg?.provider).toBe("console");
    });
    test("Team Invite Integration", async () => {
        const merchantId = "email_int_merch";
        const email = "invitee@vayva.ng";
        await TeamService.inviteMember(merchantId, "admin_u", {
            email,
            role: ROLES.VIEWER,
        });
        // Check if email log exists
        const msg = await prisma.emailMessage.findFirst({
            where: { toEmail: email, templateKey: "team_invite" },
            orderBy: { createdAt: "desc" },
        });
        expect(msg).toBeTruthy();
    });
    test("Suppression Check", async () => {
        const blockedEmail = "blocked@vayva.ng";
        await prisma.emailSuppression.create({
            data: { email: blockedEmail, reason: "complaint" },
        });
        const corrId = `suppress_chk_${Date.now()}`;
        await EmailService.send({
            to: blockedEmail,
            subject: "Should Fail",
            html: "...",
            templateKey: "test",
            correlationId: corrId,
        });
        const msg = await prisma.emailMessage.findFirst({
            where: { correlationId: corrId },
        });
        expect(msg?.status).toBe("suppressed");
    });
});
