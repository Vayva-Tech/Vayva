import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class RescueService {
  constructor(private readonly db = prisma) {}

  async reportIncident(data: any) {
    const { route, errorMessage, stackHash, fingerprint, storeId, userId } = data;

    if (!errorMessage) {
      throw new Error('No error message');
    }

    const redactedMessage = this.redactPII(errorMessage);
    const fp = fingerprint || this.generateFingerprint('UI_ERROR', redactedMessage);

    const incident = await this.db.rescueIncident.upsert({
      where: { fingerprint: fp },
      create: {
        surface: 'MERCHANT_ADMIN',
        errorType: 'UI_CRASH',
        errorMessage: redactedMessage,
        severity: 'MEDIUM',
        route: route || 'unknown',
        storeId: storeId || null,
        userId: userId || null,
        fingerprint: fp,
        status: 'OPEN',
        diagnostics: {
          stackHash: stackHash || null,
        },
      },
      update: {
        status: 'OPEN',
        updatedAt: new Date(),
      },
    });

    // Trigger AI analysis in background
    this.analyzeAndSuggest(incident.id).catch((err) => {
      logger.error('[Rescue] Background analysis failed', {
        error: err instanceof Error ? err.message : String(err),
        incidentId: incident.id,
      });
    });

    logger.info(`[Rescue] Reported incident ${incident.id}`);
    return incident;
  }

  async getIncidentStatus(incidentId: string) {
    const incident = await this.db.rescueIncident.findUnique({
      where: { id: incidentId },
      select: {
        id: true,
        status: true,
        diagnostics: true,
      },
    });

    if (!incident) {
      throw new Error('Incident not found');
    }

    return incident;
  }

  async getIncidents(storeId: string, filters: any) {
    const status = filters.status || null;
    const severity = filters.severity || null;

    const where: any = {
      storeId: storeId || null,
      ...(status ? { status } : {}),
      ...(severity ? { severity } : {}),
    };

    const incidents = await this.db.rescueIncident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit ? Math.min(filters.limit, 100) : 50,
    });

    return incidents;
  }

  private async analyzeAndSuggest(incidentId: string) {
    const incident = await this.db.rescueIncident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) return;

    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        logger.warn('[RescueAI] No OpenRouter API key found');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://vayva.tech',
          'X-Title': 'Vayva Rescue',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-001',
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
              `,
            },
            { role: 'user', content: 'Analyze this incident.' },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = JSON.parse(
        data.choices[0]?.message?.content || '{}',
      );

      let nextStatus = 'NEEDS_ENGINEERING';
      if (analysis.USER_FACING_ACTION === 'REFRESH' || analysis.USER_FACING_ACTION === 'RELOGIN') {
        nextStatus = 'READY_TO_REFRESH';
      }

      await this.db.rescueIncident.update({
        where: { id: incidentId },
        data: {
          status: nextStatus,
          diagnostics: {
            ...(incident.diagnostics as any),
            aiAnalysis: analysis,
          },
        },
      });
    } catch (error: unknown) {
      logger.error('[Rescue Analysis Error]', {
        error: error instanceof Error ? error.message : String(error),
        incidentId,
      });
    }
  }

  private redactPII(msg: string): string {
    return msg
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/password[:=]\s*[^\s&]+/gi, 'password=[REDACTED]');
  }

  private generateFingerprint(type: string, msg: string): string {
    const str = `${type}:${msg.slice(0, 100)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
