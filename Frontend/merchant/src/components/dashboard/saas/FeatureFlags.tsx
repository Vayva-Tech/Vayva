'use client';

import React from 'react';

export function FeatureFlags() {
  const features = [
    { name: 'AI Dashboard', version: 'v2.4', rollout: 100, status: 'stable' as const },
    { name: 'Dark Mode', version: 'v2.5', rollout: 45, status: 'monitoring' as const },
    { name: 'Beta Analytics', version: 'v3.0', rollout: 5, status: 'testing' as const },
  ];

  const statusIcons = {
    stable: '✓',
    monitoring: '⚠️',
    testing: '🧪',
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h3>
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                <p className="text-xs text-gray-400">{feature.version}</p>
              </div>
              <span className="text-lg">{statusIcons[feature.status]}</span>
            </div>
            <div className="w-full bg-white-tertiary rounded-full h-2">
              <div 
                className="bg-green-50-primary h-2 rounded-full transition-all" 
                style={{ width: `${feature.rollout}%` }} 
              />
            </div>
            <p className="text-xs text-gray-400">{feature.rollout}% rollout</p>
          </div>
        ))}
      </div>
    </div>
  );
}
