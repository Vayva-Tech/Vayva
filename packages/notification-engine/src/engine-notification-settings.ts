import type { SettingsManager } from '@vayva/settings';

/**
 * Full notification settings shape expected by NotificationDispatcher.
 * @vayva/settings minimal store only exposes flat booleans; we merge them here.
 */
export interface EngineNotificationSettings {
  channels: {
    email: { enabled: boolean; address: string; digestEnabled?: boolean; digestFrequency?: string };
    sms: { enabled: boolean; phoneNumber?: string; carrier?: string };
    push: { enabled: boolean; browserPermission?: string; deviceTokens?: string[] };
    inApp: { enabled: boolean; showBadge?: boolean; soundEnabled?: boolean; desktopNotifications?: boolean };
    slack: { enabled: boolean; webhookUrl?: string; channel?: string };
    whatsapp: { enabled: boolean; phoneNumber?: string; businessAccountId?: string };
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone?: string;
    allowEmergencyContacts?: boolean;
    emergencyContactKeywords: string[];
    allowVipOverrides?: boolean;
    vipContacts?: string[];
  };
  doNotDisturb: {
    enabled: boolean;
    startDate: string;
    endDate: string;
    allowEmergency?: boolean;
  };
  categories: Record<string, unknown>;
  customRules: unknown[];
  trackEngagement: boolean;
  priority: {
    highPriorityKeywords: string[];
    autoEscalateAfterMinutes: number;
  };
}

const BASE: EngineNotificationSettings = {
  channels: {
    email: {
      enabled: true,
      address: 'notifications@vayva.ng',
      digestEnabled: false,
      digestFrequency: 'daily',
    },
    sms: { enabled: false, phoneNumber: undefined },
    push: { enabled: true, browserPermission: 'default', deviceTokens: [] },
    inApp: { enabled: true, showBadge: true, soundEnabled: true, desktopNotifications: false },
    slack: { enabled: false, webhookUrl: undefined, channel: undefined },
    whatsapp: { enabled: false, phoneNumber: undefined },
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    timezone: 'Africa/Lagos',
    allowEmergencyContacts: true,
    emergencyContactKeywords: ['urgent', 'emergency', 'critical'],
    allowVipOverrides: false,
    vipContacts: [],
  },
  doNotDisturb: {
    enabled: false,
    startDate: '1970-01-01',
    endDate: '1970-01-02',
    allowEmergency: true,
  },
  categories: {
    sales: {
      newOrder: true,
      largeOrder: true,
      largeOrderThreshold: 500,
      orderStatusChange: false,
      paymentReceived: true,
    },
    inventory: {
      lowStock: true,
      'out-of-stock': true,
      expiration: true,
    },
    test: { category: true },
  },
  customRules: [],
  trackEngagement: false,
  priority: {
    highPriorityKeywords: ['urgent', 'emergency', 'critical'],
    autoEscalateAfterMinutes: 60,
  },
};

export function getResolvedEngineNotificationSettings(
  settingsManager: SettingsManager,
): EngineNotificationSettings {
  const raw = settingsManager.getSettings().notifications as Record<string, unknown> | undefined;

  if (raw && typeof raw === 'object' && raw.channels && typeof raw.channels === 'object') {
    const r = raw as Partial<EngineNotificationSettings>;
    return {
      ...BASE,
      ...r,
      channels: { ...BASE.channels, ...r.channels },
      quietHours: { ...BASE.quietHours, ...r.quietHours },
      doNotDisturb: { ...BASE.doNotDisturb, ...r.doNotDisturb },
      categories: r.categories ?? BASE.categories,
      customRules: r.customRules ?? BASE.customRules,
      priority: { ...BASE.priority, ...r.priority },
      trackEngagement: r.trackEngagement ?? BASE.trackEngagement,
    };
  }

  if (
    raw &&
    typeof raw === 'object' &&
    typeof raw.email === 'boolean' &&
    typeof raw.sms === 'boolean' &&
    typeof raw.push === 'boolean' &&
    typeof raw.inApp === 'boolean'
  ) {
    return {
      ...BASE,
      channels: {
        ...BASE.channels,
        email: { ...BASE.channels.email, enabled: raw.email as boolean },
        sms: { ...BASE.channels.sms, enabled: raw.sms as boolean },
        push: { ...BASE.channels.push, enabled: raw.push as boolean },
        inApp: { ...BASE.channels.inApp, enabled: raw.inApp as boolean },
      },
    };
  }

  return BASE;
}
