import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

/**
 * Merchant Rescue Service - AI-powered incident analysis and remediation
 * 
 * Provides:
 * - Incident reporting with PII redaction
 * - AI analysis using OpenRouter (Gemini models)
 * - Automated remediation suggestions
 * - Incident status tracking
 */

export interface IncidentReport {
  errorMessage: string;
  fingerprint?: string;
  route?: string;
  storeId?: string;
  userId?: string;
  stackHash?: string;
}

export interface AiAnalysis {
  classification?: string;
  USER_FACING_ACTION?: string;
  remediation?: string;
}

export class MerchantRescueService {
  /**
   * Report an incident
   */
  async reportIncident(data: IncidentReport): Promise<any> {
    try {
      const redactedMessage = this.redactPII(data.errorMessage);
      const fingerprint =
        data.fingerprint ||
        this.generateFingerprint('UI_ERROR', redactedMessage);

      const incident = await prisma.rescueIncident.create({
        data: {
          surface: 'MERCHANT_ADMIN',
          errorType: 'UI_CRASH',
          errorMessage: redactedMessage,
          severity: 'MEDIUM',
          route: data.route,
          storeId: data.storeId,
          userId: data.userId,
          fingerprint,
          status: 'REPORTED',
          diagnostics: {
            stackHash: data.stackHash,
          },
        },
      });

      logger.info('[MerchantRescue] Incident reported', {
        incidentId: incident.id,
        fingerprint,
      });

      // Trigger AI analysis in background (non-blocking)
      this.analyzeAndSuggest(incident.id).catch((err) =>
        logger.error('[MerchantRescue] Background analysis failed', err)
      );

      return incident;
    } catch (error) {
      logger.error('[MerchantRescue] Failed to report incident', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get incident status
   */
  async getIncidentStatus(id: string): Promise<any> {
    try {
      const incident = await prisma.rescueIncident.findUnique({
        where: { id },
      });

      if (!incident) {
        throw new Error(`Incident ${id} not found`);
      }

      return incident;
    } catch (error) {
      logger.error('[MerchantRescue] Failed to get incident status', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Analyze incident with AI and suggest remediation
   */
  async analyzeAndSuggest(incidentId: string): Promise<void> {
    try {
      const incident = await prisma.rescueIncident.findUnique({
        where: { id: incidentId },
      });

      if (!incident) {
        logger.warn('[MerchantRescue] Incident not found for analysis', {
          incidentId,
        });
        return;
      }

      const apiKey = process.env.OPENROUTER_API_KEY || '';
      if (!apiKey) {
        logger.warn('[MerchantRescue] OpenRouter API key not configured');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://vayva.tech',
          'X-Title': 'Vayva Merchant Rescue',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `
You are Vayva Rescue AI.
Classify the error: AUTH, DATABASE, NETWORK, UI_RENDER, UNKNOWN.
Suggest a USER-FACING-ACTION: "REFRESH", "RELOGIN", "WAIT", "CONTACT_SUPPORT".
Suggest a remediation for engineers (short codes snippet idea).

Return JSON: { "classification": "...", "USER_FACING_ACTION": "...", "remediation": "..." }

Context:
- App: Merchant Admin
- Error: ${incident.errorMessage}
              `.trim(),
            },
            { role: 'user', content: 'Analyze this incident.' },
          ],
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        logger.error('[MerchantRescue] AI analysis failed', {
          status: response.status,
        });
        return;
      }

      const completion = await response.json();
      const analysis: AiAnalysis = JSON.parse(
        completion.choices[0]?.message?.content || '{}'
      );

      let nextStatus = 'NEEDS_ENGINEERING';
      if (analysis.USER_FACING_ACTION === 'REFRESH') {
        nextStatus = 'READY_TO_REFRESH';
      } else if (analysis.USER_FACING_ACTION === 'RELOGIN') {
        nextStatus = 'READY_TO_RELOGIN';
      }

      await prisma.rescueIncident.update({
        where: { id: incidentId },
        data: {
          status: nextStatus,
          diagnostics: {
            ...(incident.diagnostics as Record<string, unknown>),
            aiAnalysis: analysis,
          } as any,
        },
      });

      logger.info('[MerchantRescue] AI analysis completed', {
        incidentId,
        classification: analysis.classification,
        status: nextStatus,
      });
    } catch (error) {
      logger.error('[MerchantRescue] Analysis failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Redact PII from error messages
   */
  redactPII(msg: string): string {
    return msg
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/password[:=]\s*[^\s&]+/gi, 'password=[REDACTED]');
  }

  /**
   * Generate error fingerprint
   */
  generateFingerprint(type: string, msg: string): string {
    const str = `${type}:${msg.slice(0, 100)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * List incidents for a store
   */
  async listIncidents(storeId: string, limit = 50): Promise<any[]> {
    try {
      const incidents = await prisma.rescueIncident.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return incidents;
    } catch (error) {
      logger.error('[MerchantRescue] Failed to list incidents', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get incident statistics
   */
  async getIncidentStats(storeId: string, days = 7): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    topErrors: Array<{ errorMessage: string; count: number }>;
  }> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [total, byStatus, bySeverity, topErrors] = await Promise.all([
        prisma.rescueIncident.count({
          where: {
            storeId,
            createdAt: { gte: since },
          },
        }),
        prisma.rescueIncident.groupBy({
          by: ['status'],
          where: {
            storeId,
            createdAt: { gte: since },
          },
          _count: true,
        }),
        prisma.rescueIncident.groupBy({
          by: ['severity'],
          where: {
            storeId,
            createdAt: { gte: since },
          },
          _count: true,
        }),
        prisma.rescueIncident.groupBy({
          by: ['errorMessage'],
          where: {
            storeId,
            createdAt: { gte: since },
          },
          _count: true,
          orderBy: {
            _count: {
              errorMessage: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      return {
        total,
        byStatus: Object.fromEntries(
          byStatus.map((s) => [s.status, s._count])
        ),
        bySeverity: Object.fromEntries(
          bySeverity.map((s) => [s.severity, s._count])
        ),
        topErrors: topErrors.map((e) => ({
          errorMessage: e.errorMessage,
          count: e._count,
        })),
      };
    } catch (error) {
      logger.error('[MerchantRescue] Failed to get stats', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        total: 0,
        byStatus: {},
        bySeverity: {},
        topErrors: [],
      };
    }
  }
}
