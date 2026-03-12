import { describe, it, expect } from "vitest";
import { normalizePhoneToE164, shouldSendMessage, } from "../../apps/merchant-admin/src/lib/consent/consent";
import { createPreferencesToken, verifyPreferencesToken, } from "../../apps/merchant-admin/src/lib/consent/token";
import { MessageIntent } from "@vayva/db";
describe("Consent Logic", () => {
    it("normalizes Nigeria phone numbers", () => {
        expect(normalizePhoneToE164("08012345678")).toBe("+2348012345678");
        expect(normalizePhoneToE164("8012345678")).toBe("+2348012345678");
        expect(normalizePhoneToE164("+2348012345678")).toBe("+2348012345678");
        expect(normalizePhoneToE164("07012345678")).toBe("+2347012345678");
        expect(normalizePhoneToE164("123")).toBe(null); // Too short
    });
    it("enforces consent rules", () => {
        const baseConsent = {
            id: "1",
            merchantId: "m1",
            customerId: "c1",
            phoneE164: "+2348000000000",
            marketingOptInSource: "test",
            marketingOptInAt: new Date(),
            marketingOptOutAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            transactionalAllowed: true,
            fullyBlocked: false,
            marketingOptIn: false,
        };
        // 1. Marketing blocked by default (no opt-in)
        let res = shouldSendMessage(MessageIntent.MARKETING, {
            ...baseConsent,
            marketingOptIn: false,
        });
        expect(res.allowed).toBe(false);
        expect(res.reason).toBe("no_marketing_consent");
        // 2. Marketing allowed if opted-in
        res = shouldSendMessage(MessageIntent.MARKETING, {
            ...baseConsent,
            marketingOptIn: true,
        });
        expect(res.allowed).toBe(true);
        // 3. Transactional allowed by default
        res = shouldSendMessage(MessageIntent.TRANSACTIONAL, {
            ...baseConsent,
            transactionalAllowed: true,
        });
        expect(res.allowed).toBe(true);
        // 4. Transactional blocked if explicitly disabled
        res = shouldSendMessage(MessageIntent.TRANSACTIONAL, {
            ...baseConsent,
            transactionalAllowed: false,
        });
        expect(res.allowed).toBe(false);
        expect(res.reason).toBe("transactional_disabled");
        // 5. Block All blocks everything
        res = shouldSendMessage(MessageIntent.MARKETING, {
            ...baseConsent,
            marketingOptIn: true,
            fullyBlocked: true,
        });
        expect(res.allowed).toBe(false);
        expect(res.reason).toBe("blocked_all");
        res = shouldSendMessage(MessageIntent.TRANSACTIONAL, {
            ...baseConsent,
            transactionalAllowed: true,
            fullyBlocked: true,
        });
        expect(res.allowed).toBe(false);
        expect(res.reason).toBe("blocked_all");
    });
    it("generates and verifies tokens", () => {
        const merchantId = "m_123";
        const phone = "+2348099999999";
        const token = createPreferencesToken(merchantId, phone);
        expect(token).toBeDefined();
        expect(token.split(".").length).toBe(2);
        const decoded = verifyPreferencesToken(token);
        expect(decoded).toBeTruthy();
        expect(decoded?.merchantId).toBe(merchantId);
        expect(decoded?.phoneE164).toBe(phone);
        // Tampered token
        const tampered = token + "hack";
        expect(verifyPreferencesToken(tampered)).toBeNull();
    });
});
