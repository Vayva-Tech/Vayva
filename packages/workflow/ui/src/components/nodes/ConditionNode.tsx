/**
 * ConditionNode Component
 * Visual representation of a condition/decision node
 */

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

interface ConditionNodeData {
  label?: string;
  description?: string;
  condition?: string;
  field?: string;
  operator?: string;
  value?: string;
}

function ConditionNodeComponent({ data, selected }: NodeProps & { data: ConditionNodeData }) {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[180px]
        ${selected 
          ? 'border-amber-500 shadow-lg ring-2 ring-amber-200' 
          : 'border-amber-400 shadow-md'
        }
        bg-white
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
      />

      {/* True output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
        style={{ top: '35%' }}
      />

      {/* False output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
        style={{ top: '65%' }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center w-6 h-6 bg-amber-100 rounded-md">
          <GitBranch className="w-3 h-3 text-amber-600" />
        </div>
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
          Condition
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-900 truncate">
        {data.label || 'Condition'}
      </div>

      {/* Condition preview */}
      {(data.field || data.condition) && (
        <div className="mt-2 p-2 bg-amber-50 rounded text-xs font-mono text-amber-800 truncate">
          {data.condition || `${data.field} ${data.operator || '=='} ${data.value || '?'}`}
        </div>
      )}

      {/* Branch labels */}
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-green-600 font-medium">True</span>
        <span className="text-red-600 font-medium">False</span>
      </div>

      {/* Description */}
      {data.description && (
        <div className="mt-1 text-xs text-gray-500 truncate">
          {data.description}
        </div>
      )}
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
