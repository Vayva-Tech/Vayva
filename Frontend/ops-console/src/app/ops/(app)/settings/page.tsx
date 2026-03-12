"use client";

import React, { useState, useEffect } from "react";
import { Gear as Settings, Shield, Lightning as Zap, Warning as AlertTriangle, FloppyDisk as Save } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface GlobalConfig {
  aiEnabled: boolean;
  evolutionApiEnabled: boolean;
  maintenanceMode: boolean;
}

export default function GlobalSettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState<GlobalConfig>({
    aiEnabled: true,
    evolutionApiEnabled: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/ops/config/global");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.config);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof GlobalConfig) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    const confirmSave = confirm(
      "Are you sure you want to update global system settings?",
    );
    if (!confirmSave) return;

    setSaving(true);
    try {
      const res = await fetch("/api/ops/config/global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("System configuration updated");
    } catch (error) {
      toast.error("Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OpsPageShell
        title="System Settings"
        description="Global controls and emergency switches"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title="System Settings"
      description="Global controls and emergency switches"
      headerActions={
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          isLoading={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors h-auto"
          aria-label="Save global system settings"
        >
          <Save size={18} /> Save Changes
        </Button>
      }
    >
      <div className="space-y-8 max-w-4xl">
        {/* AI & Automation */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            AI & Automation
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  Global AI Agent
                </div>
                <p className="text-sm text-gray-500">
                  Master switch for all automated AI responses (Groq/OpenAI).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.aiEnabled}
                  onChange={() => handleToggle("aiEnabled")}
                  aria-label="Toggle Global AI Agent"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  Evolution API Integration
                </div>
                <p className="text-sm text-gray-500">
                  Enable/Disable WhatsApp message sending and receiving.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.evolutionApiEnabled}
                  onChange={() => handleToggle("evolutionApiEnabled")}
                  aria-label="Toggle Evolution API Integration"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 p-6 rounded-xl border border-red-100">
          <h2 className="text-xl font-bold text-red-900 mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Emergency Controls
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-red-900">Maintenance Mode</div>
              <p className="text-sm text-red-700">
                Deny access to Merchant Dashboard for all users (Emergency
                only).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.maintenanceMode}
                onChange={() => handleToggle("maintenanceMode")}
                aria-label="Toggle Maintenance Mode"
              />
              <div className="w-11 h-6 bg-red-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </section>
      </div>
    </OpsPageShell>
  );
}
