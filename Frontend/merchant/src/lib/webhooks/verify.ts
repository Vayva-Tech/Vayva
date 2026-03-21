import { createHmac, timingSafeEqual } from "crypto";

export function verifyPaystackSignature(payload: string, signature: string, secret: string): boolean {
    const hash = createHmac("sha512", secret)
        .update(payload)
        .digest("hex");
    
    // Use timingSafeEqual to prevent timing attacks
    if (hash.length !== signature.length) return false;
    const hashBuf = Buffer.from(hash, "hex");
    const sigBuf = Buffer.from(signature, "hex");
    if (hashBuf.length !== sigBuf.length) return false;
    
    return timingSafeEqual(hashBuf, sigBuf);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function verifyWhatsappSignature(rawBody: any, signatureHeader: any, appSecret: string) {
    // Header often X-Hub-Signature-256: sha256=...
    if (!signatureHeader)
        return false;
    const signature = signatureHeader.replace("sha256=", "");
    const hash = createHmac("sha256", appSecret).update(rawBody).digest("hex");
    return hash === signature;
}
