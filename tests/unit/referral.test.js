import { test, expect } from "@playwright/test";
import { signReferralToken, verifyReferralToken, } from "../../apps/merchant-admin/src/lib/partners/referral";
test.describe("Referral Crypto", () => {
    test("signs and verifies token correctly", () => {
        const token = signReferralToken("partner_123", "CODE_ABC");
        const payload = verifyReferralToken(token);
        expect(payload).not.toBeNull();
        expect(payload?.partnerId).toBe("partner_123");
        expect(payload?.code).toBe("CODE_ABC");
    });
    test("rejects tampered token", () => {
        const token = signReferralToken("partner_123", "CODE_ABC");
        const [data, sig] = token.split(".");
        const tampered = `${data}.fakesig123`;
        const payload = verifyReferralToken(tampered);
        expect(payload).toBeNull();
    });
    test("rejects expired token", () => {
        // Sign with negative expiry duration
        const token = signReferralToken("partner_123", "CODE_ABC", -1);
        const payload = verifyReferralToken(token);
        expect(payload).toBeNull();
    });
});
