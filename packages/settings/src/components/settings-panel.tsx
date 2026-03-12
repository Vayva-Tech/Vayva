'use client';

import React, { useState } from 'react';
import { useSettings } from '../hooks/use-settings.js';
import { useAISettings } from '../hooks/use-ai-settings.js';
import { useDashboardSettings } from '../hooks/use-dashboard-settings.js';

export interface SettingsPanelProps {
  initialTab?: string;
  onClose?: () => void;
}

/**
 * Settings Panel Component
 * 
 * Comprehensive settings UI for merchants to configure:
 * - Business settings
 * - Industry-specific settings
 * - Dashboard customization
 * - AI behavior control
 * - Notification preferences
 * - User preferences
 */

export function SettingsPanel({ initialTab = 'business', onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    settings,
    ai,
    updateBusinessSettings,
    updateAISettings,
    updateDashboardSettings,
    updateNotificationSettings,
    updateUserPreferences,
    saveAllSettings,
  } = useSettings();

  const { business, dashboard, notifications, user } = settings;

  const {
    setAITone,
    setAutomationMode,
    setAlertLevel,
    toggleBenchmarking,
    grantPermission,
    revokePermission,
  } = useAISettings();

  const {
    toggleAutoRefresh,
    setRefreshInterval,
    lockLayout,
    unlockLayout,
  } = useDashboardSettings();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveAllSettings();
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // RENDER TABS
  // ============================================================================

  const renderBusinessTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Business Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name</label>
            <input
              type="text"
              value={business.name}
              onChange={(e) => updateBusinessSettings({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <input
              type="text"
              value={business.industry}
              onChange={(e) => updateBusinessSettings({ industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={business.timezone}
              onChange={(e) => updateBusinessSettings({ timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={business.currency}
              onChange={(e) => updateBusinessSettings({ currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">AI Personality</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Communication Tone</label>
            <select
              value={ai.personality.tone}
              onChange={(e) => setAITone(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Proactivity Level</label>
            <select
              value={ai.personality.proactivity}
              onChange={(e) => setAITone(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="reactive">Reactive (Only responds when asked)</option>
              <option value="balanced">Balanced (Suggestions when relevant)</option>
              <option value="proactive">Proactive (Actively identifies opportunities)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Automation Level</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Overall Automation Mode</label>
            <select
              value={ai.automation.mode}
              onChange={(e) => setAutomationMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="manual">Manual (No automation)</option>
              <option value="semi-automated">Semi-Automated (Approval required for important actions)</option>
              <option value="fully-automated">Fully Automated (AI handles everything)</option>
            </select>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What AI Can Auto-Execute:</h4>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              {ai.actionPermissions.autoExecute.map((action) => (
                <li key={action}>{action.replace(/-/g, ' ')}</li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">Requires Your Approval:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              {ai.actionPermissions.requiresApproval.map((action) => (
                <li key={action}>{action.replace(/-/g, ' ')}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Alert Sensitivity</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">When to Notify You</label>
            <select
              value={ai.alerts.level}
              onChange={(e) => setAlertLevel(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="critical-only">Critical Issues Only</option>
              <option value="important">Important Updates (Recommended)</option>
              <option value="all-insights">All Insights & Suggestions</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Data Sharing & Benchmarking</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Cross-Industry Benchmarking</label>
              <p className="text-xs text-gray-500">Compare your performance against anonymized industry peers</p>
            </div>
            <button
              onClick={toggleBenchmarking}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ai.dataSharing.enableBenchmarking ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ai.dataSharing.enableBenchmarking ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Refresh Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto-Refresh</label>
              <p className="text-xs text-gray-500">Automatically update dashboard data</p>
            </div>
            <button
              onClick={toggleAutoRefresh}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dashboard.refreshInterval > 0 ? 'bg-green-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dashboard.refreshInterval > 0 ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Refresh Interval</label>
            <select
              value={dashboard.refreshInterval / 60000}
              onChange={(e) => setRefreshInterval(Number(e.target.value) * 60000)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={1}>Every minute</option>
              <option value={5}>Every 5 minutes</option>
              <option value={15}>Every 15 minutes</option>
              <option value={30}>Every 30 minutes</option>
              <option value={60}>Every hour</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Layout</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Lock Layout</label>
              <p className="text-xs text-gray-500">Prevent accidental changes to widget positions</p>
            </div>
            <button
              onClick={unlockLayout}
              className="px-4 py-2 rounded-md text-sm font-medium bg-green-100 text-green-700"
            >
              Unlocked
            </button>
          </div>
        </div>
      </div>


    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">


      <div>
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <p className="text-sm text-gray-600">Configure notification channels and preferences in the merchant admin settings.</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'business', label: 'Business', icon: '🏢' },
              { id: 'ai', label: 'AI Settings', icon: '🤖' },
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'business' && renderBusinessTab()}
          {activeTab === 'ai' && renderAITab()}
          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
