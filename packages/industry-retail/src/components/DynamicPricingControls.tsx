'use client';

import React, { useState } from 'react';
import { Card, Button } from "@vayva/ui";

interface PricingRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'competitive';
  value: number;
  minPrice?: number;
  maxPrice?: number;
  active: boolean;
}

interface ProductPricing {
  productId: string;
  productName: string;
  currentPrice: number;
  cost: number;
  margin: number;
  suggestedPrice: number;
  competitorPrice?: number;
  demandLevel: 'low' | 'medium' | 'high';
  inventoryLevel: number;
}

export interface DynamicPricingControlsProps {
  products?: ProductPricing[];
  rules?: PricingRule[];
  onApplyPricing?: (productId: string, newPrice: number) => void;
  onCreateRule?: (rule: PricingRule) => void;
  onToggleRule?: (ruleId: string) => void;
}

export const DynamicPricingControls: React.FC<DynamicPricingControlsProps> = ({
  products = [],
  rules = [],
  onApplyPricing,
  onCreateRule,
  onToggleRule,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'rules' | 'analytics'>('products');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const calculateMargin = (price: number, cost: number) => {
    return ((price - cost) / price) * 100;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const activeRulesCount = rules.filter(r => r.active).length;
  const avgMargin = products.length > 0
    ? products.reduce((sum, p) => sum + p.margin, 0) / products.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dynamic Pricing Controls</h2>
          <p className="text-sm text-white/60 mt-1">AI-powered pricing optimization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setActiveTab('products')}>Products</Button>
          <Button variant="ghost" onClick={() => setActiveTab('rules')}>Rules</Button>
          <Button variant="ghost" onClick={() => setActiveTab('analytics')}>Analytics</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="text-sm text-white/60 mb-2">Products Tracked</div>
          <div className="text-2xl font-bold text-white">{products.length}</div>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="text-sm text-white/60 mb-2">Active Rules</div>
          <div className="text-2xl font-bold text-white">{activeRulesCount}</div>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="text-sm text-white/60 mb-2">Avg Margin</div>
          <div className="text-2xl font-bold text-white">{avgMargin.toFixed(1)}%</div>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-4">
          <div className="text-sm text-white/60 mb-2">Potential Revenue</div>
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(products.reduce((sum, p) => sum + (p.suggestedPrice - p.currentPrice) * 10, 0))}
          </div>
        </Card>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pricing Recommendations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm text-white/60">Product</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Current Price</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Cost</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Margin</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Suggested</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Demand</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Inventory</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const priceChange = product.suggestedPrice - product.currentPrice;
                  const changePercent = (priceChange / product.currentPrice) * 100;

                  return (
                    <tr key={product.productId} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{product.productName}</div>
                      </td>
                      <td className="py-3 px-4 text-white/80">{formatCurrency(product.currentPrice)}</td>
                      <td className="py-3 px-4 text-white/60">{formatCurrency(product.cost)}</td>
                      <td className="py-3 px-4">
                        <span className={product.margin >= 40 ? 'text-green-400' : product.margin >= 25 ? 'text-yellow-400' : 'text-red-400'}>
                          {product.margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{formatCurrency(product.suggestedPrice)}</span>
                          {priceChange !== 0 && (
                            <span className={`text-xs ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {priceChange > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs capitalize ${getDemandColor(product.demandLevel)}`}>
                          {product.demandLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/80">{product.inventoryLevel} units</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onApplyPricing?.(product.productId, product.suggestedPrice)}
                        >
                          Apply
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Pricing Rules</h3>
            <Button variant="primary" onClick={() => onCreateRule?.({
              id: `rule-${Date.now()}`,
              name: 'New Rule',
              type: 'percentage',
              value: 10,
              active: true,
            })}>
              Create Rule
            </Button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  rule.active ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <div>
                    <h4 className="font-medium text-white">{rule.name}</h4>
                    <div className="text-sm text-white/60">
                      {rule.type === 'percentage' && `${rule.value}% adjustment`}
                      {rule.type === 'fixed' && `$${rule.value} ${rule.value >= 0 ? 'increase' : 'decrease'}`}
                      {rule.type === 'competitive' && 'Match competitor pricing'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {rule.minPrice && (
                    <div className="text-sm text-white/60">
                      Min: {formatCurrency(rule.minPrice)}
                    </div>
                  )}
                  {rule.maxPrice && (
                    <div className="text-sm text-white/60">
                      Max: {formatCurrency(rule.maxPrice)}
                    </div>
                  )}
                  <Button
                    variant={rule.active ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onToggleRule?.(rule.id)}
                  >
                    {rule.active ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pricing Analytics</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Margin Distribution */}
            <div>
              <h4 className="font-medium text-white mb-4">Margin Distribution</h4>
              <div className="space-y-3">
                {[
                  { range: '> 50%', count: products.filter(p => p.margin > 50).length, color: 'from-green-500 to-emerald-500' },
                  { range: '40-50%', count: products.filter(p => p.margin >= 40 && p.margin <= 50).length, color: 'from-blue-500 to-cyan-500' },
                  { range: '25-40%', count: products.filter(p => p.margin >= 25 && p.margin < 40).length, color: 'from-yellow-500 to-orange-500' },
                  { range: '< 25%', count: products.filter(p => p.margin < 25).length, color: 'from-red-500 to-rose-500' },
                ].map((item) => (
                  <div key={item.range} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-white/80">{item.range}</div>
                    <div className="flex-1">
                      <div className={`h-6 rounded bg-gradient-to-r ${item.color}`} style={{ width: `${products.length > 0 ? (item.count / products.length) * 100 : 0}%` }} />
                    </div>
                    <div className="w-16 text-right text-sm font-bold text-white">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demand vs Inventory Matrix */}
            <div>
              <h4 className="font-medium text-white mb-4">Demand vs Inventory</h4>
              <div className="grid grid-cols-3 gap-3">
                {['high', 'medium', 'low'].map((demand) => (
                  <div key={demand} className="space-y-2">
                    <div className="text-xs text-white/60 capitalize text-center">{demand} Demand</div>
                    <div className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          {products.filter(p => p.demandLevel === demand).length}
                        </div>
                        <div className="text-xs text-white/40">products</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
