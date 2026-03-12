import crypto from "crypto";
/**
 * Service for generating and validating secure return tokens.
 * Allows customers to access return form without login.
 */
export class ReturnTokenService {
  static generate(orderId: string, customerPhone: string) {
    const payload = JSON.stringify({
      o: orderId,
      p: customerPhone,
      exp: Date.now() + 86400000 * 30,
    }); // 30 days valid
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.SECRET.padEnd(32).slice(0, 32)),
      iv,
    );
    let encrypted = cipher.update(payload);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }
  static validate(token: string) {
    try {
      const parts = token.split(":");
      const iv = Buffer.from(parts.shift() || "", "hex");
      const encryptedText = Buffer.from(parts.join(":"), "hex");
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(this.SECRET.padEnd(32).slice(0, 32)),
        iv,
      );
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      const data = JSON.parse(decrypted.toString());
      if (data.exp < Date.now()) return null; // Expired
      return { orderId: data.o, customerPhone: data.p };
    } catch {
      return null; // Invalid
    }
  }
  static get SECRET(): string {
    const s = process.env.RETURN_TOKEN_SECRET;
    if (!s && process.env.NODE_ENV === "production") {
      throw new Error("FATAL: RETURN_TOKEN_SECRET must be set in production");
    }
    return s || "dev-secret-key-local-only";
  }
}
