'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { Button, Switch } from '@vayva/ui/components';

const TrendsSettingsPage = () => {
  const [dataSources, setDataSources] = useState({
    internalSales: true,
    socialListening: true,
    industryReports: false,
    competitorAnalysis: false,
  });
  const [forecastPeriod, setForecastPeriod] = useState('6');
  const [alertThreshold, setAlertThreshold] = useState(15);

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
          <h1 className="text-3xl font-bold text-white mb-2">Trend Analytics</h1>
          <p className="text-white/60">Configure trend data sources and forecasting settings</p>
        </div>

        <div className="space-y-6">
          {/* Data Sources */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Trend Data Sources</h2>

            <div className="space-y-4">
              {[
                {
                  key: 'internalSales',
                  name: 'Internal Sales Data',
                  desc: 'Analyze your sales patterns',
                  icon: '📊',
                  status: 'Connected',
                },
                {
                  key: 'socialListening',
                  name: 'Social Listening',
                  desc: 'Monitor Instagram, TikTok, Pinterest',
                  icon: '📱',
                  status: 'Connected',
                },
                {
                  key: 'industryReports',
                  name: 'Industry Reports',
                  desc: 'WGSN, Trendalytics integration',
                  icon: '📰',
                  status: 'Not Connected',
                },
                {
                  key: 'competitorAnalysis',
                  name: 'Competitor Analysis',
                  desc: 'Track competitor pricing & assortments',
                  icon: '🎯',
                  status: 'Not Connected',
                },
              ].map((source) => (
                <label
                  key={source.key}
                  className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8 hover:border-pink-400/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{source.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{source.name}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            source.status === 'Connected'
                              ? 'bg-emerald-400/20 text-emerald-400'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          {source.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-1">{source.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={dataSources[source.key as keyof typeof dataSources]}
                    onChange={(checked) =>
                      setDataSources({
                        ...dataSources,
                        [source.key]: checked,
                      })
                    }
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Button variant="secondary" className="border-white/20 w-full">
                🔗 Connect Additional Data Sources
              </Button>
            </div>
          </GlassPanel>

          {/* Forecast Settings */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Forecasting Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Forecast Period
                </label>
                <select
                  value={forecastPeriod}
                  onChange={(e) => setForecastPeriod(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-400"
                >
                  <option value="3" className="bg-[#0F0F0F]">3 Months</option>
                  <option value="6" className="bg-[#0F0F0F]">6 Months</option>
                  <option value="12" className="bg-[#0F0F0F]">12 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Alert Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-400"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">%</span>
                </div>
                <p className="text-xs text-white/50 mt-2">
                  Alert when trend shifts exceed this threshold
                </p>
              </div>
            </div>
          </GlassPanel>

          {/* Current Trend Alerts */}
          <GlassPanel variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Trend Alerts</h2>
              <Button variant="secondary" className="border-white/20 text-sm">
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {[
                { trend: 'Sustainable Fabrics', shift: '+52%', urgency: 'high' },
                { trend: 'Wide Leg Pants', shift: '+38%', urgency: 'medium' },
                { trend: 'Pastel Colors', shift: '+45%', urgency: 'medium' },
              ].map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/8"
                >
                  <div>
                    <span className="text-sm font-medium text-white">{alert.trend}</span>
                    <p className="text-xs text-white/50 mt-1">Shift detected in last 7 days</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-400">{alert.shift}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        alert.urgency === 'high'
                          ? 'bg-rose-400/20 text-rose-400'
                          : 'bg-amber-400/20 text-amber-400'
                      }`}
                    >
                      {alert.urgency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Save Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" className="bg-pink-400 hover:bg-pink-500">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsSettingsPage;
