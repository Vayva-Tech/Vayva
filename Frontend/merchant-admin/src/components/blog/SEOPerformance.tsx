'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function SEOPerformance({ keywords = [] }: { keywords?: any[] }): React.JSX.Element {
  const topKeywords = keywords.length > 0 ? keywords : [
    { keyword: 'AI trends 2026', position: 3, volume: 12000 },
    { keyword: 'React hooks', position: 5, volume: 8500 },
    { keyword: 'TypeScript tips', position: 7, volume: 6200 },
    { keyword: 'Web dev best practices', position: 12, volume: 4800 },
  ];

  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">SEO Performance</h3>
        <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
          SEO Audit
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-text-secondary mb-1">Organic Traffic: 142,847 (68%)</p>
        <div className="flex gap-4 mt-2">
          <p className="text-xs text-text-tertiary">Domain Authority: <span className="font-bold text-text-primary">68</span></p>
          <p className="text-xs text-text-tertiary">Page Authority: <span className="font-bold text-text-primary">72</span></p>
          <p className="text-xs text-text-tertiary">Backlinks: <span className="font-bold text-text-primary">2,847</span></p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Top Keywords</p>
        {topKeywords.map((kw, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
            <div>
              <p className="text-sm font-medium text-text-primary">{kw.keyword}</p>
              <p className="text-xs text-text-tertiary">Volume: {kw.volume?.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded-md ${
                kw.position <= 3 ? 'bg-success/20 text-success' :
                kw.position <= 10 ? 'bg-warning/20 text-warning' :
                'bg-background-secondary text-text-tertiary'
              }`}>
                <p className="text-xs font-bold">#{kw.position}</p>
              </div>
              <Icon name="Search" size={16} className="text-text-tertiary" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Technical SEO</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={14} className="text-success" />
            <p className="text-xs text-text-secondary">Site speed: 92/100</p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={14} className="text-success" />
            <p className="text-xs text-text-secondary">Mobile-friendly</p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={14} className="text-warning" />
            <p className="text-xs text-text-secondary">Meta descriptions (8 missing)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
