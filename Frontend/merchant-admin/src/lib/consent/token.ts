import { createHmac } from "crypto";
const SECRET = process.env.PREFERENCES_TOKEN_SECRET;
if (!SECRET && process.env.NODE_ENV === "production") {
    throw new Error("PREFERENCES_TOKEN_SECRET must be set in production");
}
const SAFE_SECRET = SECRET || "dev_secret_do_not_use_in_prod";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPreferencesToken(merchantId: any, phoneE164: any, ttlDays = 30) {
    const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = { merchantId, phoneE164, exp };
    // Create base64url payload
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
    // Sign
    const hmac = createHmac("sha256", SAFE_SECRET);
    hmac.update(payloadStr);
    const signature = hmac.digest("base64url");
    return `${payloadStr}.${signature}`;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function verifyPreferencesToken(token: string) {
    try {
        const [payloadStr, signature] = token.split(".");
        if (!payloadStr || !signature)
            return null;
        // Verify signature
        const hmac = createHmac("sha256", SAFE_SECRET);
        hmac.update(payloadStr);
        const expectedSignature = hmac.digest("base64url");
        if (signature !== expectedSignature)
            return null;
        // Decode
        const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString());
        // Verify expiry
        if (Date.now() / 1000 > payload.exp) {
            return null; // Expired
        }
        return payload;
    }
    catch (e) {
        return null;
    }
}
