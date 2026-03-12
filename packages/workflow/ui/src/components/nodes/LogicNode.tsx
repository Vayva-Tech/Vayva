/**
 * LogicNode Component
 * Visual representation of logic nodes (delay, split, merge, loop)
 */

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock, Split, Merge, RotateCcw, type LucideIcon } from 'lucide-react';

interface LogicNodeData {
  label?: string;
  description?: string;
  delay?: string;
}

const iconMap: Record<string, LucideIcon> = {
  delay: Clock,
  split: Split,
  merge: Merge,
  loop: RotateCcw,
};

const colorMap: Record<string, { bg: string; border: string; icon: string; label: string }> = {
  delay: { 
    bg: 'bg-slate-100', 
    border: 'border-slate-400', 
    icon: 'text-slate-600',
    label: 'Delay'
  },
  split: { 
    bg: 'bg-violet-100', 
    border: 'border-violet-400', 
    icon: 'text-violet-600',
    label: 'Split'
  },
  merge: { 
    bg: 'bg-fuchsia-100', 
    border: 'border-fuchsia-400', 
    icon: 'text-fuchsia-600',
    label: 'Merge'
  },
  loop: { 
    bg: 'bg-rose-100', 
    border: 'border-rose-400', 
    icon: 'text-rose-600',
    label: 'Loop'
  },
};

function LogicNodeComponent({ data, selected, type }: NodeProps & { data: LogicNodeData }) {
  const nodeType = type as string;
  const Icon = iconMap[nodeType] || Clock;
  const colors = colorMap[nodeType] || { 
    bg: 'bg-gray-100', 
    border: 'border-gray-400', 
    icon: 'text-gray-600',
    label: 'Logic'
  };

  const isDelay = nodeType === 'delay';
  const isSplit = nodeType === 'split';

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[140px]
        ${selected 
          ? `${colors.border} shadow-lg ring-2 ring-opacity-50` 
          : `${colors.border} shadow-md`
        }
        bg-white
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* Output handle(s) */}
      {isSplit ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="a"
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            style={{ top: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="b"
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
            style={{ top: '70%' }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className={`flex items-center justify-center w-6 h-6 ${colors.bg} rounded-md`}>
          <Icon className={`w-3 h-3 ${colors.icon}`} />
        </div>
        <span className={`text-xs font-semibold ${colors.icon} uppercase tracking-wide`}>
          {colors.label}
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-900 truncate">
        {data.label || colors.label}
      </div>

      {/* Delay-specific info */}
      {isDelay && data.delay && (
        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {data.delay}
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div className="mt-1 text-xs text-gray-500 truncate">
          {data.description}
        </div>
      )}
    </div>
  );
}

export const LogicNode = memo(LogicNodeComponent);
