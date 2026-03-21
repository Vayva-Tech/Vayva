'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logger } from "@vayva/shared";
// Default settings
const DEFAULT_SETTINGS = {
    business: {
        profile: {
            businessName: '',
            email: ''
        },
        branding: {
            colors: {
                primary: '#3b82f6'
            }
        },
        localization: {
            locale: 'en-US'
        }
    },
    dashboard: {
        widgets: [],
        layoutLocked: false,
        refreshInterval: 300
    },
    ai: {
        personality: {
            tone: 'professional'
        },
        actionPermissions: {
            autoExecute: [],
            requiresApproval: [],
            prohibited: []
        }
    },
    notifications: {
        channels: {
            email: { enabled: true },
            push: { enabled: true },
            sms: { enabled: false }
        },
        quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
        }
    },
    active: true,
    version: 1
};
// API functions
async function fetchSettings() {
    try {
        const response = await fetch('/api/settings');
        if (!response.ok) {
            throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        return data.data || DEFAULT_SETTINGS;
    }
    catch (error) {
        logger.error('[SETTINGS] Fetch failed:', error);
        return DEFAULT_SETTINGS;
    }
}
async function saveSettings(data) {
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to save settings');
        }
        const result = await response.json();
        toast.success('Settings saved successfully!');
        return result.data;
    }
    catch (error) {
        logger.error('[SETTINGS] Save failed:', error);
        toast.error('Failed to save settings');
        throw error;
    }
}
// Context and hooks
const SettingsContext = createContext({
    settings: DEFAULT_SETTINGS,
    loading: true,
    updateSettings: async () => { }
});
export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadSettings() {
            try {
                setLoading(true);
                const data = await fetchSettings();
                setSettings(data);
            }
            catch (error) {
                logger.error('[SETTINGS] Failed to load:', error);
            }
            finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, []);
    const updateSettings = async (updates) => {
        try {
            const updated = await saveSettings(updates);
            setSettings(updated);
        }
        catch (error) {
            logger.error('[SETTINGS] Update failed:', error);
            throw error;
        }
    };
    return (_jsx(SettingsContext.Provider, { value: { settings, loading, updateSettings }, children: children }));
}
export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettingsContext must be used within SettingsProvider');
    }
    return context;
}
// Individual hooks for each settings section
export function useBusinessSettings() {
    const { settings, updateSettings } = useSettingsContext();
    const updateBusinessSettings = async (data) => {
        await updateSettings({ business: { ...settings.business, ...data } });
    };
    return {
        business: settings.business,
        updateBusinessSettings,
        loading: false
    };
}
export function useDashboardSettings() {
    const { settings, updateSettings } = useSettingsContext();
    const updateDashboardSettings = async (data) => {
        await updateSettings({ dashboard: { ...settings.dashboard, ...data } });
    };
    return {
        dashboard: settings.dashboard,
        widgets: settings.dashboard.widgets,
        layoutLocked: settings.dashboard.layoutLocked,
        refreshInterval: settings.dashboard.refreshInterval,
        updateDashboardSettings,
        loading: false
    };
}
export function useAISettings() {
    const { settings, updateSettings } = useSettingsContext();
    const updateAISettings = async (data) => {
        await updateSettings({ ai: { ...settings.ai, ...data } });
    };
    return {
        ai: settings.ai,
        updateAISettings,
        loading: false
    };
}
export function useNotificationSettings() {
    const { settings, updateSettings } = useSettingsContext();
    const updateNotificationSettings = async (data) => {
        await updateSettings({ notifications: { ...settings.notifications, ...data } });
    };
    return {
        notifications: settings.notifications,
        updateNotificationSettings,
        loading: false
    };
}
