import { z } from 'zod';
import { prisma, type Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

const ExportScopeSchema = z.object({
  dataTypes: z.array(z.string()),
  dateRange: z.object({ from: z.date(), to: z.date() }).optional(),
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
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

export class DataGovernanceService {
  constructor(private readonly db = prisma) {}

  async requestExport(
    storeId: string,
    requestedBy: z.infer<typeof RequestedBySchema>,
    scopes: z.infer<typeof ExportScopeSchema>
  ) {
    const request = await this.db.dataExportRequest.create({
      data: {
        storeId,
        requestedBy: JSON.stringify(requestedBy),
        scopes: scopes as unknown as Prisma.InputJsonValue,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info('Data export requested', { storeId, requestId: request.id });
    return request;
  }

  async logAiTrace(params: z.infer<typeof AiTraceParamsSchema>) {
    try {
      await this.db.aiTrace.create({
        data: {
          storeId: params.storeId,
          conversationId: params.conversationId,
          requestId: params.requestId,
          model: params.model,
          toolsUsed: params.toolsUsed as unknown as Prisma.InputJsonValue,
          retrievedDocs: params.retrievedDocs as unknown as Prisma.InputJsonValue,
          inputSummary: this.redactPII(params.inputSummary),
          outputSummary: this.redactPII(params.outputSummary),
          guardrailFlags: params.guardrailFlags as unknown as Prisma.InputJsonValue,
          latencyMs: params.latencyMs,
        },
      });
    } catch (error) {
      logger.error('[DataGovernance] Failed to log AI trace:', error);
    }
  }

  async requestDeletion(
    storeId: string,
    requestedBy: z.infer<typeof RequestedBySchema>,
    reason: string
  ) {
    const request = await this.db.dataDeletionRequest.create({
      data: {
        storeId,
        requestedBy: JSON.stringify(requestedBy),
        reason,
        status: 'PENDING_REVIEW',
        scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info('Data deletion requested', { storeId, requestId: request.id });
    return request;
  }

  async getExportRequests(storeId: string, limit: number = 50) {
    return await this.db.dataExportRequest.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getDeletionRequests(storeId: string, limit: number = 50) {
    return await this.db.dataDeletionRequest.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAiTraces(storeId: string, limit: number = 50) {
    return await this.db.aiTrace.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private redactPII(text: string | null | undefined): string | null | undefined {
    if (!text) return text;
    return text
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
      .replace(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g, '[PHONE_REDACTED]')
      .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARD_REDACTED]')
      .replace(/\b(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g, '[SSN_REDACTED]')
      .replace(/sk_live_[0-9a-zA-Z]{24}/g, '[API_KEY_REDACTED]');
  }
}
