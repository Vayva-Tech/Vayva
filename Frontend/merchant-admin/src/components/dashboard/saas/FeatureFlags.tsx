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
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Feature Flags</h3>
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">{feature.name}</p>
                <p className="text-xs text-text-tertiary">{feature.version}</p>
              </div>
              <span className="text-lg">{statusIcons[feature.status]}</span>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-2">
              <div 
                className="bg-accent-primary h-2 rounded-full transition-all" 
                style={{ width: `${feature.rollout}%` }} 
              />
            </div>
            <p className="text-xs text-text-tertiary">{feature.rollout}% rollout</p>
          </div>
        ))}
      </div>
    </div>
  );
}
