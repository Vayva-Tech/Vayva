import { 
  BusinessSettings,
  IndustrySettings,
  DashboardSettings,
  AISettings,
  NotificationSettings,
  UserPreferences,
} from '@vayva/settings';

export interface SettingsData {
  business: BusinessSettings;
  industry: IndustrySettings;
  dashboard: DashboardSettings;
  ai: AISettings;
  notifications: NotificationSettings;
  user: UserPreferences;
  active: boolean;
  version: number;
}

export class SettingsRepository {
  private prisma: any;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }

  async getSettings(): Promise<SettingsData | null> {
    try {
      const settings = await this.prisma.settings.findFirst({
        where: { active: true },
      });

      if (!settings) return null;

      return {
        business: settings.business as BusinessSettings,
        industry: settings.industry as IndustrySettings,
        dashboard: settings.dashboard as DashboardSettings,
        ai: settings.ai as AISettings,
        notifications: settings.notifications as NotificationSettings,
        user: settings.user as UserPreferences,
        active: settings.active,
        version: settings.version,
      };
    } catch (error) {
      console.error('[SETTINGS REPOSITORY] Error getting settings:', error);
      throw error;
    }
  }

  async upsertSettings(data: Partial<SettingsData>): Promise<SettingsData> {
    try {
      const existing = await this.getSettings();

      if (existing) {
        const updated = await this.prisma.settings.update({
          where: { id: 'default' },
          data: {
            business: data.business || existing.business,
            industry: data.industry || existing.industry,
            dashboard: data.dashboard || existing.dashboard,
            ai: data.ai || existing.ai,
            notifications: data.notifications || existing.notifications,
            user: data.user || existing.user,
            version: { increment: 1 },
          },
        });

        return {
          business: updated.business as BusinessSettings,
          industry: updated.industry as IndustrySettings,
          dashboard: updated.dashboard as DashboardSettings,
          ai: updated.ai as AISettings,
          notifications: updated.notifications as NotificationSettings,
          user: updated.user as UserPreferences,
          active: updated.active,
          version: updated.version,
        };
      } else {
        const created = await this.prisma.settings.create({
          data: {
            id: 'default',
            business: (data.business || {}) as any,
            industry: (data.industry || {}) as any,
            dashboard: (data.dashboard || {}) as any,
            ai: (data.ai || {}) as any,
            notifications: (data.notifications || {}) as any,
            user: (data.user || {}) as any,
            active: true,
            version: 1,
          },
        });

        return {
          business: created.business as BusinessSettings,
          industry: created.industry as IndustrySettings,
          dashboard: created.dashboard as DashboardSettings,
          ai: created.ai as AISettings,
          notifications: created.notifications as NotificationSettings,
          user: created.user as UserPreferences,
          active: created.active,
          version: created.version,
        };
      }
    } catch (error) {
      console.error('[SETTINGS REPOSITORY] Error upserting settings:', error);
      throw error;
    }
  }

  async resetToDefaults(): Promise<void> {
    try {
      await this.prisma.settings.deleteMany({
        where: { active: true },
      });
    } catch (error) {
      console.error('[SETTINGS REPOSITORY] Error resetting settings:', error);
      throw error;
    }
  }
}