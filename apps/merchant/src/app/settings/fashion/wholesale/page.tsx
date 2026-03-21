'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { Button, Input, Switch } from '@vayva/ui/components';

const WholesaleSettingsPage = () => {
  const [enableWholesale, setEnableWholesale] = useState(true);
  const [minimumOrder, setMinimumOrder] = useState(500);
  const [tiers, setTiers] = useState([
    { name: 'Tier 1', minUnits: 5, maxUnits: 24, discount: 40 },
    { name: 'Tier 2', minUnits: 25, maxUnits: 99, discount: 50 },
    { name: 'Tier 3', minUnits: 100, maxUnits: Infinity, discount: 55 },
  ]);

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
          <h1 className="text-3xl font-bold text-white mb-2">Wholesale Pricing</h1>
          <p className="text-white/60">Configure B2B pricing tiers and customer management</p>
        </div>

        <div className="space-y-6">
          {/* Enable Wholesale */}
          <GlassPanel variant="elevated" className="p-6">
            <label className="flex items-center justify-between mb-6">
              <div>
                <span className="text-lg font-medium text-white">Enable Wholesale</span>
                <p className="text-sm text-white/50 mt-1">Allow B2B orders with tiered pricing</p>
              </div>
              <Switch checked={enableWholesale} onChange={setEnableWholesale} size="lg" />
            </label>

            {enableWholesale && (
              <>
                <div className="pt-6 border-t border-white/10">
                  <label className="block">
                    <span className="text-sm font-medium text-white/80">Minimum Order Value</span>
                    <div className="mt-2 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">$</span>
                      <Input
                        type="number"
                        value={minimumOrder.toString()}
                        onChange={(e) => setMinimumOrder(parseInt(e.target.value))}
                        className="w-full pl-8"
                      />
                    </div>
                  </label>
                </div>
              </>
            )}
          </GlassPanel>

          {/* Pricing Tiers */}
          {enableWholesale && (
            <GlassPanel variant="elevated" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Pricing Tiers</h2>
                <Button variant="secondary" className="border-white/20 text-sm">
                  + Add Tier
                </Button>
              </div>

              <div className="space-y-4">
                {tiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/3 rounded-lg border border-white/8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Tier Name</label>
                        <Input
                          value={tier.name}
                          readOnly
                          className="w-full bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Min Units</label>
                        <Input
                          type="number"
                          value={tier.minUnits}
                          readOnly
                          className="w-full bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Max Units</label>
                        <Input
                          type="number"
                          value={tier.maxUnits === Infinity ? '∞' : tier.maxUnits}
                          readOnly
                          className="w-full bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Discount %</label>
                        <Input
                          type="number"
                          value={tier.discount}
                          onChange={(e) => {
                            const newTiers = [...tiers];
                            newTiers[idx].discount = parseInt(e.target.value);
                            setTiers(newTiers);
                          }}
                          className="w-full bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-white/50">
                        Net price: {(100 - tier.discount)}% of retail
                      </p>
                      <button className="text-xs text-rose-400 hover:text-rose-300">
                        Delete Tier
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  💡 Tip: Higher volume tiers get better discounts to incentivize larger orders
                </p>
              </div>
            </GlassPanel>
          )}

          {/* Wholesale Customers */}
          {enableWholesale && (
            <GlassPanel variant="elevated" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Wholesale Customers</h2>
                <Button variant="primary" className="bg-blue-400 hover:bg-blue-500">
                  Manage Customers
                </Button>
              </div>

              <div className="text-center py-8">
                <p className="text-sm text-white/60">
                  0 wholesale customers approved
                </p>
                <p className="text-xs text-white/40 mt-2">
                  Approve wholesale applications to grant access to B2B pricing
                </p>
              </div>
            </GlassPanel>
          )}

          {/* Save Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary" className="bg-blue-400 hover:bg-blue-500">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesaleSettingsPage;
