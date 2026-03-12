// Note: Next.js or Vercel helpers might handle IP format, but we'll stick to standard regex/CIDR checks.
// Since we don't have a heavyweight CIDR lib installed, we'll do exact match for now
// or simple basic check. The requirement is "IP allowlists".
export function isIpAllowed(clientIp: string, allowlist: string[]) {
  if (!allowlist || allowlist.length === 0) return true; // No restriction
  if (!clientIp) return false; // Restriction exists but no IP known
  return allowlist.includes(clientIp);
}
