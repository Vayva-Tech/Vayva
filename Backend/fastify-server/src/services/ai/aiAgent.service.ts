import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class AiAgentService {
  constructor(private readonly db = prisma) {}

  async getProfile(storeId: string) {
    try {
      const [profile, store] = await Promise.all([
        this.db.merchantAiProfile.findUnique({ where: { storeId } }),
        this.db.store.findUnique({
          where: { id: storeId },
          select: { settings: true },
        }),
      ]);

      const settings = (store?.settings as Record<string, any>) || {};
      const draft = this.getDraftSettings(settings);

      return {
        profile: profile
          ? {
              id: profile.id,
              name: profile.agentName,
              prompt: '',
              isLive: false,
              features: [],
            }
          : null,
        store: {
          id: storeId,
          slug: '',
          name: '',
        },
        config: draft,
      };
    } catch (error) {
      logger.error('[AI_AGENT] Get profile error', error, { storeId });
      throw error;
    }
  }

  async updateProfile(storeId: string, userId: string, config: any) {
    try {
      const incoming = {
        name: String(config.name || ''),
        avatarUrl: String(config.avatarUrl || ''),
        tone: String(config.tone || 'professional'),
        signature: String(config.signature || ''),
      };

      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const currentSettings = (store?.settings as Record<string, any>) || {};
      const updatedSettings = {
        ...currentSettings,
        aiAgentProfileDraft: incoming,
      };

      await this.db.store.update({
        where: { id: storeId },
        data: { settings: updatedSettings },
      });

      logger.info(`[AI_AGENT] Updated profile draft for store ${storeId} by user ${userId}`);
      return { ok: true, config: incoming };
    } catch (error) {
      logger.error('[AI_AGENT] Update profile error', error, { storeId, userId });
      throw error;
    }
  }

  async publishProfile(storeId: string, userId: string) {
    try {
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const currentSettings = (store?.settings as Record<string, any>) || {};
      const draft = this.getDraftSettings(currentSettings);

      // Create or update the published profile
      const existingProfile = await this.db.merchantAiProfile.findUnique({
        where: { storeId },
      });

      if (existingProfile) {
        await this.db.merchantAiProfile.update({
          where: { storeId },
          data: {
            agentName: draft.name,
            avatarUrl: draft.avatarUrl || null,
            tone: draft.tone,
            signature: draft.signature,
          },
        });
      } else {
        await this.db.merchantAiProfile.create({
          data: {
            id: `maip-${Date.now()}`,
            storeId,
            agentName: draft.name,
            avatarUrl: draft.avatarUrl || null,
            tone: draft.tone,
            signature: draft.signature,
          },
        });
      }

      logger.info(`[AI_AGENT] Published profile for store ${storeId} by user ${userId}`);
      return { ok: true, profile: draft };
    } catch (error) {
      logger.error('[AI_AGENT] Publish profile error', error, { storeId, userId });
      throw error;
    }
  }

  async testMessage(storeId: string, message: string) {
    try {
      // Send a test message through the AI agent
      const messages = [{ role: 'user', content: message }];
      
      const { SalesAgent } = await import('@vayva/ai-agent');
      const response = await SalesAgent.handleMessage(storeId, messages);

      logger.info(`[AI_AGENT] Test message processed for store ${storeId}`);
      return { success: true, data: response };
    } catch (error) {
      logger.error('[AI_AGENT] Test message error', error, { storeId });
      throw error;
    }
  }

  private getDraftSettings(settings: Record<string, any>) {
    const draftValue = settings.aiAgentProfileDraft;
    const draft = (draftValue as Record<string, any>) || {};
    return {
      name: String(draft.name || ''),
      avatarUrl: String(draft.avatarUrl || ''),
      tone: String(draft.tone || 'professional'),
      signature: String(draft.signature || ''),
    };
  }
}
