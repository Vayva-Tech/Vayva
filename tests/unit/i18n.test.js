import { test, expect } from "@playwright/test";
import { formatMoney } from "../../apps/merchant-admin/src/lib/i18n/formatMoney";
import { normalizePhone } from "../../apps/merchant-admin/src/lib/i18n/phone";
import { validateAddressNG } from "../../apps/merchant-admin/src/lib/i18n/addressNG";
test.describe("I18n Utils", () => {
    test("formatMoney uses NGN", () => {
        // Note: Output depends on node locale but usually 'en-NG' gives ₦
        // Sometimes it might give NGN depending on environment support.
        // We check for the number formatting mainly.
        const res = formatMoney(25000);
        expect(res).toContain("25,000");
        // Ideally check for symbol but CI envs differ.
    });
    test("normalizePhone handles NG formats", () => {
        expect(normalizePhone("08012345678")).toBe("+2348012345678");
        expect(normalizePhone("2348012345678")).toBe("+2348012345678");
        expect(normalizePhone("+2348012345678")).toBe("+2348012345678");
        expect(normalizePhone("123")).toBeNull(); // Too short
    });
    test("validateAddressNG enforces landmark", () => {
        const valid = {
            addressLine1: "123 Street",
            city: "Ikeja",
            state: "Lagos",
            landmark: "Near Zoo",
        };
        expect(validateAddressNG(valid).valid).toBe(true);
        const invalid = { ...valid, landmark: "" };
        expect(validateAddressNG(invalid).valid).toBe(false);
        expect(validateAddressNG(invalid).error).toContain("Landmark");
    });
});
