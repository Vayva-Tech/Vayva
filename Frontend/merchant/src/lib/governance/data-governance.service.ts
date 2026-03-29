import { z } from "zod";
import { api } from '@/lib/api-client';

// Zod schemas for type safety
const ExportScopeSchema = z.object({
  dataTypes: z.array(z.string()),
  dateRange: z.object({ from: z.date(), to: z.date() }).optional(),
  format: z.enum(["json", "csv", "xlsx"]).default("json"),
});

const AiTraceParamsSchema = z.object({
  storeId: z.string(),
  conversationId: z.string().optional(),
  requestId: z.string(),
  model: z.string(),
  toolsUsed: z.array(z.string()).optional(),
  retrievedDocs: z.array(z.string()).optional(),
  inputSummary: z.string(),
  outputSummary: z.string(),
  guardrailFlags: z.array(z.string()).optional(),
  latencyMs: z.number().optional(),
});

const RequestedBySchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.string().optional(),
});

/**
 * Vayva Data Governance Service
 * Handles Export Requests, Deletion, and Privacy Redaction
 */
export class DataGovernanceService {
    /**
     * Initiate a background data export
     */
    static async requestExport(
        storeId: string,
        requestedBy: z.infer<typeof RequestedBySchema>,
        scopes: z.infer<typeof ExportScopeSchema>,
    ) {
        const response = await api.post('/governance/exports/request', {
            storeId,
            requestedBy,
            scopes,
        });
        return response.data;
    }
    /**
     * Log a PII-redacted AI trace for audit
     */
    static async logAiTrace(params: z.infer<typeof AiTraceParamsSchema>) {
        try {
            await api.post('/governance/traces/log', params);
        }
        catch (error) {
            console.error('[GOVERNANCE] Failed to log AI trace', error);
        }
    }
    /**
     * Request full account deletion (Soft-to-Hard transition)
     */
    static async requestDeletion(
        storeId: string,
        requestedBy: z.infer<typeof RequestedBySchema>,
        reason: string,
    ) {
        const request = await prisma.dataDeletionRequest?.create({
            data: {
                storeId,
                requestedBy: JSON.stringify(requestedBy),
                reason,
                status: "PENDING_REVIEW",
                scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30-day wait
            },
        });
        // Trigger notification to Ops
        // await NotificationService.notifyOps('DELETION_REQUEST', { storeId, reason });
        return request;
    }
    /**
     * Internal PII Redaction Logic
     * Enhanced regex-based masking.
     * NOTE: For Enterprise usage, integrate with VGS, Google DLP, or AWS Macie.
     */
    static redactPII(text: string | null | undefined): string | null | undefined {
        if (!text)
            return text;
        return text
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]") // Emails
            .replace(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g, "[PHONE_REDACTED]") // Phone numbers (US/Intl formats)
            .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[CARD_REDACTED]") // Credit Card numbers (Luhn check not enforced here)
            .replace(/\b(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g, "[SSN_REDACTED]") // SSN (Basic)
            .replace(/sk_live_[0-9a-zA-Z]{24}/g, "[API_KEY_REDACTED]"); // Stripe Live Keys
    }
}
