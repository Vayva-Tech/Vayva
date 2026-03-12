'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { Button, Input, Switch } from '@vayva/ui/components';

const InventorySettingsPage = () => {
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [criticalStockThreshold, setCriticalStockThreshold] = useState(3);
  const [enableSizeCurveAlerts, setEnableSizeCurveAlerts] = useState(true);
  const [enableAIRecommendations, setEnableAIRecommendations] = useState(true);

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <a href="/settings/fashion" className="text-white/40 hover:text-white transition-colors">
              ← Back
            </a>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory Alerts</h1>
          <p className="text-white/60">Configure stock thresholds and restock notifications</p>
        </div>

        <div className="space-y-6">
          {/* Stock Thresholds */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Stock Levels</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Low Stock Threshold
                </label>
                <Input
                  type="number"
                  value={lowStockThreshold.toString()}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-white/50 mt-2">
                  Alert when inventory drops below this level
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Critical Stock Level
                </label>
                <Input
                  type="number"
                  value={criticalStockThreshold.toString()}
                  onChange={(e) => setCriticalStockThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-white/50 mt-2">
                  Urgent restock needed
                </p>
              </div>
            </div>
          </GlassPanel>

          {/* Alert Preferences */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Alert Preferences</h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                <div>
                  <span className="text-sm font-medium text-white">Size Curve Alerts</span>
                  <p className="text-xs text-white/50 mt-1">Monitor size distribution and gaps</p>
                </div>
                <Switch checked={enableSizeCurveAlerts} onChange={setEnableSizeCurveAlerts} />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                <div>
                  <span className="text-sm font-medium text-white">AI Restock Suggestions</span>
                  <p className="text-xs text-white/50 mt-1">Get automated restock recommendations</p>
                </div>
                <Switch checked={enableAIRecommendations} onChange={setEnableAIRecommendations} />
              </label>
            </div>
          </GlassPanel>

          {/* Notification Recipients */}
          <GlassPanel variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Alert Recipients</h2>
              <Button variant="secondary" className="border-white/20 text-sm">
                + Add Email
              </Button>
            </div>

            <div className="space-y-3">
              {['buyer@brand.com', 'inventory@brand.com'].map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/8"
                >
                  <span className="text-sm text-white">{email}</span>
                  <button className="text-xs text-rose-400 hover:text-rose-300">Remove</button>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Save Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" className="bg-emerald-400 hover:bg-emerald-500">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySettingsPage;
