import { api } from '@/lib/api-client';

interface DnsError extends Error {
    code?: string;
}

export async function verifyDomainDns(domainMappingId: string) {
    try {
        // Call backend API to perform DNS verification
        const response = await api.post(`/domains/verify/${domainMappingId}`);
        return response.data;
    }
    catch (err: unknown) {
        const dnsErr = err as DnsError;
        console.error(`[DomainJob] DNS error: ${dnsErr.message || String(err)}`);
        throw err;
    }
}
