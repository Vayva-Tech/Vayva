import dns from "node:dns/promises";
import { logger } from "@vayva/shared";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { prisma } from "@vayva/db";

interface DnsError extends Error {
    code?: string;
}

export async function verifyDomainDns(domainMappingId: string) {
    const mapping = await prisma.domainMapping?.findUnique({
        where: { id: domainMappingId },
        include: { store: true },
    });
    if (!mapping) {
        logger.error(`[DomainJob] Mapping ${domainMappingId} not found.`);
        return;
    }
    const domain = mapping.domain;
    const token = mapping.verificationToken;
    let status: "pending" | "verified" | "failed" = "pending";
    let error: string | null = null;
    logger.info(`[DomainJob] Starting verification for ${domain} (${domainMappingId})`, { domain, domainMappingId, app: "merchant" });
    try {
        const txtRecords = await dns.resolveTxt(domain);
        const flattened = txtRecords.flat();
        const isVerified = flattened.some((record: string | string[]) => 
            (typeof record === "string" ? record : record.join("")).includes(`vayva-verification=${token}`)
        );
        if (isVerified) {
            status = "verified";
        }
        else {
            status = "failed";
            error = "Verification TXT record not found.";
            logger.warn(`[DomainJob] ${domain} verification failed: TXT record missing or incorrect.`, { domain, app: "merchant" });
        }
    }
    catch (err: unknown) {
        status = "failed";
        const dnsErr = err as DnsError;
        error = dnsErr.code === "ENOTFOUND" ? "Domain not found" : (dnsErr.message || String(err));
        logger.error(`[DomainJob] DNS error for ${domain}: ${dnsErr.message || String(err)}`, { domain, app: "merchant" });
    }
    
    const currentProvider = (mapping.provider as Record<string, unknown> | null) ?? {};
    await prisma.domainMapping?.update({
        where: { id: domainMappingId },
        data: {
            status: status as any,
            provider: {
                ...currentProvider,
                lastCheckedAt: new Date().toISOString(),
                lastError: error,
            },
        },
    });
    
    await logAuditEvent(mapping.storeId, "worker-dns", "DOMAIN_VERIFICATION_CHECK" as any, {
        targetType: "DOMAIN_MAPPING",
        targetId: mapping.id,
        reason: `Domain ${domain} verification ${status}${error ? `: ${error}` : ""}`,
        meta: { actor: { type: "SYSTEM", label: "Domain Verification Service" }, domain, status, error }
    });
}
