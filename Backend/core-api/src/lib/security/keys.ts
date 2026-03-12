import { randomBytes, createHash } from "crypto";
const KEY_PREFIX = "sk_live_";
const KEY_LENGTH = 32;
/**
 * Generates a standard API key and its SHA-256 hash.
 * Format: sk_live_[32_char_hex]
 */
export function generateApiKey() {
  // Generate random bytes
  const buffer = randomBytes(KEY_LENGTH);
  const keyBody = buffer.toString("hex");
  const key = `${KEY_PREFIX}${keyBody}`;
  // Hash for storage
  const hash = hashApiKey(key);
  return { key, hash };
}
/**
 * Hashes an API key for storage or verification.
 * Uses SHA-256 which is fast and secure for high-entropy keys.
 */
export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}
/**
 * Mask a key for display (e.g. sk_live_...a1b2)
 */
export function maskApiKey(_keyHash: string) {
  // We can't recover the key from hash, but if we had the last 4 chars stored...
  // Wait, storing last 4 chars is good practice. The schema doesn't have it.
  // We'll trust the 'name' or just show "••••••••" for now.
  // Or if we modify schema later, we can add `last4`.
  // For now, return generic mask.
  return "••••••••";
}
