'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { Button, Input, Switch } from '@vayva/ui/components';

const AISettingsPage = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [maxCostPerQuery, setMaxCostPerQuery] = useState(0.01);
  const [showLocalPreference, setShowLocalPreference] = useState(true);
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Settings</h1>
          <p className="text-white/60">Configure your AI assistant preferences</p>
        </div>

        <div className="space-y-6">
          {/* AI Assistant Toggle */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
            
            <div className="space-y-6">
              {/* Enable AI */}
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Enable AI Assistant</span>
                  <p className="text-xs text-white/50 mt-1">
                    Allow AI-powered insights and recommendations
                  </p>
                </div>
                <Switch checked={aiEnabled} onChange={setAiEnabled} />
              </label>

              {/* Use OpenRouter for complex queries */}
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Use OpenRouter</span>
                  <p className="text-xs text-white/50 mt-1">
                    Enable internet research for complex queries (incurs cost)
                  </p>
                </div>
                <Switch checked={useOpenRouter} onChange={setUseOpenRouter} />
              </label>

              {/* Max cost per query */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Maximum Cost per Query ($)
                </label>
                <Input
                  type="number"
                  value={maxCostPerQuery.toString()}
                  onChange={(e) => setMaxCostPerQuery(parseFloat(e.target.value) || 0)}
                  step={0.001}
                  min={0}
                  max={0.10}
                  className="w-full max-w-md"
                  disabled={!useOpenRouter}
                />
                <p className="text-xs text-white/40 mt-2">
                  Queries requiring internet research typically cost ~$0.002
                </p>
              </div>
            </div>
          </GlassPanel>

          {/* Query Preferences */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Query Preferences</h2>
            
            <div className="space-y-6">
              {/* Prefer local processing */}
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Prefer Local Processing</span>
                  <p className="text-xs text-white/50 mt-1">
                    Process queries locally when possible (faster, free)
                  </p>
                </div>
                <Switch checked={showLocalPreference} onChange={setShowLocalPreference} />
              </label>

              {/* Show cost indicators */}
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Show Cost Indicators</span>
                  <p className="text-xs text-white/50 mt-1">
                    Display cost and latency information for each response
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400"
                />
              </label>
            </div>
          </GlassPanel>

          {/* OpenRouter API Key */}
          {useOpenRouter && (
            <GlassPanel variant="elevated" className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">OpenRouter Configuration</h2>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  API Key
                </label>
                <Input
                  type="password"
                  value={openRouterApiKey}
                  onChange={(e) => setOpenRouterApiKey(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full max-w-md"
                />
                <p className="text-xs text-white/40 mt-2">
                  Get your API key from{' '}
                  <a href="https://openrouter.ai" target="_blank" className="text-emerald-400 hover:underline">
                    openrouter.ai
                  </a>
                </p>
              </div>
            </GlassPanel>
          )}

          {/* Usage Statistics */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Usage Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/3 rounded-lg">
                <p className="text-sm text-white/60 mb-1">Total Queries (Today)</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              
              <div className="p-4 bg-white/3 rounded-lg">
                <p className="text-sm text-white/60 mb-1">Local Queries</p>
                <p className="text-2xl font-bold text-emerald-400">0%</p>
              </div>
              
              <div className="p-4 bg-white/3 rounded-lg">
                <p className="text-sm text-white/60 mb-1">Total Cost (Today)</p>
                <p className="text-2xl font-bold text-white">$0.00</p>
              </div>
            </div>
            
            <p className="text-xs text-white/40 mt-4">
              Statistics will appear after you start using the AI assistant
            </p>
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

export default AISettingsPage;
