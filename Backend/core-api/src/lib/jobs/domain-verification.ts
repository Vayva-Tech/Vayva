import dns from "node:dns/promises";
import { logger } from "@vayva/shared";
import { prisma, DomainMappingStatus } from "@vayva/db";
import { logAuditEvent as logAudit } from "@/lib/audit";

export async function verifyDomainDns(domainMappingId: string) {
  const mapping = await prisma.domainMapping.findUnique({
    where: { id: domainMappingId },
    include: { store: true },
  });
  if (!mapping) {
    logger.error(`[DomainJob] Mapping ${domainMappingId} not found.`);
    return;
  }
  const domain = mapping.domain;
  const token = mapping.verificationToken;
  let status = "pending";
  let error: string | null = null;
  logger.info(
    `[DomainJob] Starting verification for ${domain} (${domainMappingId})`,
    { domain, domainMappingId, app: "merchant" },
  );
  try {
    // We check for a TXT record: vayva-verification=[token]
    const txtRecords = await dns.resolveTxt(domain);
    const flattened = txtRecords.flat();
    const isVerified = flattened.some((record) =>
      (record as string).includes(`vayva-verification=${token}`),
    );
    if (isVerified) {
      status = "verified";
    } else {
      status = "failed";
      error = "Verification TXT record not found.";
      logger.warn(
        `[DomainJob] ${domain} verification failed: TXT record missing or incorrect.`,
        { domain, app: "merchant" },
      );
    }
  } catch (err) {
    status = "failed";
    error =
      (err as Error & { code?: string }).code === "ENOTFOUND"
        ? "Domain not found"
        : (err as Error).message;
    logger.error(`[DomainJob] DNS error for ${domain}:`, {
      error: (err as Error).message,
    });
  }
  // Update status and metadata
  await prisma.domainMapping.update({
    where: { id: domainMappingId },
    data: {
      status: status as DomainMappingStatus,
      provider: {
        ...((mapping.provider as Record<string, unknown>) || {}),
        lastCheckedAt: new Date().toISOString(),
        lastError: error,
      },
    },
  });
  // Audit log via standardized helper
  await logAudit(mapping.storeId, "worker-dns", "DOMAIN_VERIFICATION_CHECK", {
    targetType: "DOMAIN_MAPPING",
    targetId: mapping.id,
    after: { domain, status, error },
    meta: { actor: { type: "SYSTEM", label: "Domain Verification Service" } },
  });
}
