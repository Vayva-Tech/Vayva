import { useState, useEffect } from 'react';
import { getSettingsManager, AISettings, SettingsStore, BusinessSettings, DashboardSettings, NotificationSettings, UserPreferences } from '../index.simplified';

interface UseSettingsReturn {
  settings: SettingsStore;
  ai: AISettings;
  loading: boolean;
  error: string | null;
  updateAISettings: (updates: Partial<AISettings>) => void;
  updateBusinessSettings: (updates: Partial<BusinessSettings>) => void;
  updateDashboardSettings: (updates: Partial<DashboardSettings>) => void;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
  saveAllSettings: () => Promise<void>;
  reset: () => void;
  exportSettings: () => string;
  importSettings: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SettingsStore>(() => getSettingsManager().getSettings());
  const [ai, setAi] = useState<AISettings>(() => getSettingsManager().getAISettings());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simplified implementation - in real app this would subscribe to settings changes
    const manager = getSettingsManager();
    setAi(manager.getAISettings());
    setSettings(manager.getSettings());
  }, []);

  const updateAISettings = (updates: Partial<AISettings>) => {
    try {
      setLoading(true);
      const manager = getSettingsManager();
      manager.updateAISettings(updates);
      setAi(manager.getAISettings());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update AI settings');
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessSettings = (updates: Partial<BusinessSettings>) => {
    try {
      setLoading(true);
      const manager = getSettingsManager();
      manager.updateBusinessSettings(updates);
      setSettings(manager.getSettings());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business settings');
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardSettings = (updates: Partial<DashboardSettings>) => {
    try {
      setLoading(true);
      const manager = getSettingsManager();
      manager.updateDashboardSettings(updates);
      setSettings(manager.getSettings());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dashboard settings');
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    try {
      setLoading(true);
      const manager = getSettingsManager();
      manager.updateNotificationSettings(updates);
      setSettings(manager.getSettings());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const updateUserPreferences = (updates: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      const manager = getSettingsManager();
      manager.updateUserPreferences(updates);
      setSettings(manager.getSettings());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user preferences');
    } finally {
      setLoading(false);
    }
  };

  const saveAllSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      const manager = getSettingsManager();
      await manager.saveAllSettings();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    try {
      setLoading(true);
      const manager = getSettingsManager();
      manager.reset();
      setAi(manager.getAISettings());
      setSettings(manager.getSettings());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setLoading(false);
    }
  };

  const exportSettings = (): string => {
    try {
      const manager = getSettingsManager();
      return manager.exportSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export settings');
      return '';
    }
  };

  const importSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      // In real implementation, this would open a file dialog
      // For now, we'll just simulate importing default settings
      const manager = getSettingsManager();
      await manager.importSettings(JSON.stringify({
        ai: manager.getAISettings(),
        settings: manager.getSettings()
      }));
      setAi(manager.getAISettings());
      setSettings(manager.getSettings());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import settings');
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    ai,
    loading,
    error,
    updateAISettings,
    updateBusinessSettings,
    updateDashboardSettings,
    updateNotificationSettings,
    updateUserPreferences,
    saveAllSettings,
    reset,
    exportSettings,
    importSettings
  };
}
