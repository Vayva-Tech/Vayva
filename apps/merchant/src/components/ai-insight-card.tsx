'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface AIInsightCardProps {
  title: string;
  value: string;
  change?: number;
  icon: string;
  query?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  value,
  change,
  icon,
  query,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (query) {
      // Navigate to AI chat with pre-filled query
      router.push(`/dashboard/ai?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-400/20 flex items-center justify-center">
          <span className="text-2xl">{icon}</span>
        </div>
        
        {change !== undefined && (
          <span
            className={`text-sm font-medium ${
              change >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {change >= 0 ? '↑' : '↓'} {Math.abs(change * 100)}%
          </span>
        )}
      </div>

      <h3 className="text-white/60 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      
      {query && (
        <p className="text-xs text-emerald-400 group-hover:text-emerald-300 transition-colors">
          Ask AI →
        </p>
      )}
    </div>
  );
};
