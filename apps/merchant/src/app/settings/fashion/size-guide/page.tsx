'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { Button } from '@vayva/ui/components';

const SizeGuideSettingsPage = () => {
  const [sizeFormat, setSizeFormat] = useState('US');
  const [includeMeasurements, setIncludeMeasurements] = useState(true);
  const [sizeConverter, setSizeConverter] = useState(true);
  const [fitRecommendations, setFitRecommendations] = useState('ai');

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
          <h1 className="text-3xl font-bold text-white mb-2">Size Guide Settings</h1>
          <p className="text-white/60">Configure sizing standards and fit recommendations</p>
        </div>

        <div className="space-y-6">
          {/* Sizing & Fit Section */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Sizing & Fit</h2>

            <div className="space-y-6">
              {/* Default Size Format */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Default Size Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['US', 'UK', 'EU'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setSizeFormat(format)}
                      className={`px-4 py-3 rounded-lg border transition-all ${
                        sizeFormat === format
                          ? 'bg-rose-400 border-rose-400 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                  <div>
                    <span className="text-sm font-medium text-white">Include Measurements</span>
                    <p className="text-xs text-white/50 mt-1">Show chest, waist, hip measurements</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeMeasurements}
                    onChange={(e) => setIncludeMeasurements(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-rose-400 focus:ring-rose-400"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8">
                  <div>
                    <span className="text-sm font-medium text-white">Size Converter</span>
                    <p className="text-xs text-white/50 mt-1">Allow customers to convert between sizes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sizeConverter}
                    onChange={(e) => setSizeConverter(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-rose-400 focus:ring-rose-400"
                  />
                </label>
              </div>

              {/* Fit Recommendations */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Fit Recommendations
                </label>
                <select
                  value={fitRecommendations}
                  onChange={(e) => setFitRecommendations(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="ai" className="bg-[#0F0F0F]">Enable AI Sizing (Recommended)</option>
                  <option value="manual" className="bg-[#0F0F0F]">Manual Size Chart Only</option>
                  <option value="disabled" className="bg-[#0F0F0F]">Disable Recommendations</option>
                </select>
                {fitRecommendations === 'ai' && (
                  <p className="text-xs text-emerald-400 mt-2">
                    ✨ AI will analyze customer data to suggest optimal sizes
                  </p>
                )}
              </div>
            </div>
          </GlassPanel>

          {/* Size Chart Builder */}
          <GlassPanel variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Size Charts</h2>
              <Button variant="primary" className="bg-rose-400 hover:bg-rose-500">
                + Create Size Chart
              </Button>
            </div>

            <div className="space-y-3">
              {/* Example Size Charts */}
              {[
                { name: 'Women\'s Tops', category: 'Apparel', sizes: 'XS - XXL', products: 24 },
                { name: 'Women\'s Bottoms', category: 'Apparel', sizes: 'XS - XL', products: 18 },
                { name: 'Dresses', category: 'Apparel', sizes: 'XS - XXL', products: 15 },
              ].map((chart, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white/3 rounded-lg border border-white/8 hover:border-rose-400/30 transition-all"
                >
                  <div>
                    <h3 className="text-sm font-medium text-white">{chart.name}</h3>
                    <p className="text-xs text-white/50 mt-1">
                      {chart.category} • Sizes: {chart.sizes} • {chart.products} products
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs text-white/60 hover:text-white transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Measurement Guide */}
          <GlassPanel variant="elevated" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Measurement Guide</h2>
            <p className="text-sm text-white/60 mb-6">
              Provide clear instructions on how customers should measure themselves
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white/3 rounded-lg border border-white/8">
                <h3 className="text-sm font-medium text-white mb-2">Chest/Bust</h3>
                <p className="text-xs text-white/60">
                  Measure around the fullest part of the chest, keeping tape level
                </p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg border border-white/8">
                <h3 className="text-sm font-medium text-white mb-2">Waist</h3>
                <p className="text-xs text-white/60">
                  Measure around the natural waistline (narrowest part)
                </p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg border border-white/8">
                <h3 className="text-sm font-medium text-white mb-2">Hips</h3>
                <p className="text-xs text-white/60">
                  Measure around the fullest part of the hips
                </p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg border border-white/8">
                <h3 className="text-sm font-medium text-white mb-2">Inseam</h3>
                <p className="text-xs text-white/60">
                  Measure from crotch to ankle bone
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="border-white/20">
                📷 Upload Measurement Diagram
              </Button>
              <Button variant="secondary" className="border-white/20">
                📄 Download PDF Guide
              </Button>
            </div>
          </GlassPanel>

          {/* Save Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" className="bg-rose-400 hover:bg-rose-500">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideSettingsPage;
