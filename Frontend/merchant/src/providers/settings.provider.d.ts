import React from 'react';
interface BusinessSettings {
    profile: {
        businessName: string;
        email: string;
    };
    branding: {
        colors: {
            primary: string;
        };
    };
    localization: {
        locale: string;
    };
}
interface DashboardSettings {
    widgets: Array<{
        id: string;
        visible: boolean;
        position: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
    }>;
    layoutLocked: boolean;
    refreshInterval: number;
}
interface AISettings {
    personality: {
        tone: string;
    };
    actionPermissions: {
        autoExecute: string[];
        requiresApproval: string[];
        prohibited: string[];
    };
}
interface NotificationSettings {
    channels: {
        email: {
            enabled: boolean;
        };
        push: {
            enabled: boolean;
        };
        sms: {
            enabled: boolean;
        };
    };
    quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    };
}
interface SettingsData {
    business: BusinessSettings;
    dashboard: DashboardSettings;
    ai: AISettings;
    notifications: NotificationSettings;
    active: boolean;
    version: number;
}
export declare function SettingsProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useSettingsContext(): {
    settings: SettingsData;
    loading: boolean;
    updateSettings: (updates: Partial<SettingsData>) => Promise<void>;
};
export declare function useBusinessSettings(): {
    business: BusinessSettings;
    updateBusinessSettings: (data: Partial<BusinessSettings>) => Promise<void>;
    loading: boolean;
};
export declare function useDashboardSettings(): {
    dashboard: DashboardSettings;
    widgets: {
        id: string;
        visible: boolean;
        position: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
    }[];
    layoutLocked: boolean;
    refreshInterval: number;
    updateDashboardSettings: (data: Partial<DashboardSettings>) => Promise<void>;
    loading: boolean;
};
export declare function useAISettings(): {
    ai: AISettings;
    updateAISettings: (data: Partial<AISettings>) => Promise<void>;
    loading: boolean;
};
export declare function useNotificationSettings(): {
    notifications: NotificationSettings;
    updateNotificationSettings: (data: Partial<NotificationSettings>) => Promise<void>;
    loading: boolean;
};
export {};
