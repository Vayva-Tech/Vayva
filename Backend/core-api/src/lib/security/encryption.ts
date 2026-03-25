import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync
} from "crypto";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
// Lazy key derivation — avoids throwing at module load during Next.js build
let _derivedKey: Buffer | null = null;
function getKey(): Buffer {
  if (_derivedKey) return _derivedKey;
  const secret =
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "production"
      ? ((() => {
          throw new Error(
            "FATAL: NEXTAUTH_SECRET is required in production for encryption",
          );
        })() as never)
      : "dev-only-encryption-key");
  _derivedKey = scryptSync(secret, "salt", 32);
  return _derivedKey;
}
export function encrypt(text: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}
export function decrypt(text: string) {
  const [ivHex, authTagHex, encryptedHex] = text.split(":");
  if (!ivHex || !authTagHex || !encryptedHex)
    throw new Error("Invalid encrypted text format");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
