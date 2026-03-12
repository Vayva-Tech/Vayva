"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react";

interface NightlifeKPICardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  live?: boolean;
}

export function NightlifeKPICard({
  label,
  value,
  change,
  trend = 'up',
  icon,
  live = false,
}: NightlifeKPICardProps) {
  return (
    <Card className="p-5 bg-[#252525] border-[#333333] hover:border-[#00D9FF] transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className="p-2 bg-cyan-500/10 rounded-lg">{icon}</div>}
          <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
            {label}
          </span>
        </div>
        {live && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-text-primary mb-2">
        {value}
      </div>
      
      {change && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trend === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          {trend === 'up' ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {change}
        </div>
      )}
    </Card>
  );
}
