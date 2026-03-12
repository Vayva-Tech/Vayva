/**
 * TriggerNode Component
 * Visual representation of a workflow trigger node
 */

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

interface TriggerNodeData {
  label?: string;
  description?: string;
  triggerType?: string;
}

function TriggerNodeComponent({ data, selected }: NodeProps & { data: TriggerNodeData }) {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[160px]
        ${selected 
          ? 'border-green-500 shadow-lg ring-2 ring-green-200' 
          : 'border-green-400 shadow-md'
        }
        bg-white
      `}
    >
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-md">
          <Play className="w-3 h-3 text-green-600" />
        </div>
        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
          Trigger
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-900 truncate">
        {data.label || 'Trigger'}
      </div>

      {/* Trigger type badge */}
      {data.triggerType && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
            {data.triggerType.replace(/_/g, ' ')}
          </span>
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

export const TriggerNode = memo(TriggerNodeComponent);
