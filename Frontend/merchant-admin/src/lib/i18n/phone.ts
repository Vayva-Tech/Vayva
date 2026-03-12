/**
 * Normalizes a Nigerian phone number to E.164 format (+234...)
 * Handles 080..., 80..., +234...
 */
export function normalizePhone(phone: string) {
  if (!phone) return null;
  // Remove all non-digits (preserving + at start if exists, but regex easier to just strip all)
  let clean = phone.replace(/[^0-9+]/g, "");
  // If starts with 0 (e.g. 080123...)
  if (clean.startsWith("0")) {
    clean = "+234" + clean.substring(1);
  }
  // If starts with 234 (without +)
  else if (clean.startsWith("234")) {
    clean = "+" + clean;
  }
  // If just the local number without leading 0 (e.g. 80123...) - risky if not 10 digits?
  // NG numbers are 11 digits with lead 0, so 10 digits without.
  else if (clean.length === 10 && !clean.startsWith("+")) {
    clean = "+234" + clean;
  }
  if (!clean.startsWith("+234")) return null; // Only support NG for this strict helper
  if (clean.length !== 14) return null; // +234 + 10 digits = 14 chars
  return clean;
}
export function displayPhone(phone: string) {
  if (!phone) return "";
  // If +2348012345678 -> 0801 234 5678 for readability?
  // Or just keep it international. Let's keep international for now or matching design.
  return phone;
}
