/**
 * IndustryNode Component
 * Visual representation of industry-specific nodes
 */

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { 
  ShoppingBag, 
  Utensils, 
  Home, 
  Heart, 
  Building2,
  type LucideIcon 
} from 'lucide-react';

interface IndustryNodeData {
  label?: string;
  description?: string;
}

const iconMap: Record<string, LucideIcon> = {
  fashion_size_alert: ShoppingBag,
  restaurant_86_item: Utensils,
  realestate_schedule_showing: Home,
  healthcare_send_reminder: Heart,
};

const colorMap: Record<string, { bg: string; border: string; icon: string; gradient: string }> = {
  fashion_size_alert: { 
    bg: 'bg-pink-100', 
    border: 'border-pink-400', 
    icon: 'text-pink-600',
    gradient: 'from-white to-pink-50'
  },
  restaurant_86_item: { 
    bg: 'bg-orange-100', 
    border: 'border-orange-400', 
    icon: 'text-orange-600',
    gradient: 'from-white to-orange-50'
  },
  realestate_schedule_showing: { 
    bg: 'bg-emerald-100', 
    border: 'border-emerald-400', 
    icon: 'text-emerald-600',
    gradient: 'from-white to-emerald-50'
  },
  healthcare_send_reminder: { 
    bg: 'bg-red-100', 
    border: 'border-red-400', 
    icon: 'text-red-600',
    gradient: 'from-white to-red-50'
  },
};

const industryLabelMap: Record<string, string> = {
  fashion_size_alert: 'Fashion',
  restaurant_86_item: 'Restaurant',
  realestate_schedule_showing: 'Real Estate',
  healthcare_send_reminder: 'Healthcare',
};

function IndustryNodeComponent({ data, selected, type }: NodeProps & { data: IndustryNodeData }) {
  const nodeType = type as string;
  const Icon = iconMap[nodeType] || Building2;
  const colors = colorMap[nodeType] || { 
    bg: 'bg-gray-100', 
    border: 'border-gray-400', 
    icon: 'text-gray-600',
    gradient: 'from-white to-gray-50'
  };
  const industryLabel = industryLabelMap[nodeType] || 'Industry';

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[160px]
        ${selected 
          ? `${colors.border} shadow-lg ring-2 ring-opacity-50` 
          : `${colors.border} shadow-md`
        }
        bg-gradient-to-br ${colors.gradient}
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className={`flex items-center justify-center w-6 h-6 ${colors.bg} rounded-md`}>
          <Icon className={`w-3 h-3 ${colors.icon}`} />
        </div>
        <span className={`text-xs font-semibold ${colors.icon} uppercase tracking-wide`}>
          {industryLabel}
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-900 truncate">
        {data.label || 'Industry Action'}
      </div>

      {/* Description */}
      {data.description && (
        <div className="mt-1 text-xs text-gray-500 truncate">
          {data.description}
        </div>
      )}

      {/* Industry badge */}
      <div className="absolute -top-2 -right-2">
        <div className={`flex items-center justify-center w-5 h-5 ${colors.bg.replace('100', '500')} rounded-full`}>
          <Icon className={`w-3 h-3 ${colors.icon.replace('600', '100').replace('text-', 'text-')}`} />
        </div>
      </div>
    </div>
  );
}

export const IndustryNode = memo(IndustryNodeComponent);
