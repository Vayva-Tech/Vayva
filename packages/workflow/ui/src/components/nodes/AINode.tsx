/**
 * AINode Component
 * Visual representation of AI nodes (ai_classify, ai_generate, etc.)
 */

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Sparkles, Brain, FileText, ScanSearch, type LucideIcon } from 'lucide-react';

interface AINodeData {
  label?: string;
  description?: string;
  prompt?: string;
  outputVariable?: string;
}

const iconMap: Record<string, LucideIcon> = {
  ai_classify: ScanSearch,
  ai_generate: Sparkles,
  ai_summarize: FileText,
  ai_extract: Brain,
};

const labelMap: Record<string, string> = {
  ai_classify: 'AI Classify',
  ai_generate: 'AI Generate',
  ai_summarize: 'AI Summarize',
  ai_extract: 'AI Extract',
};

function AINodeComponent({ data, selected, type }: NodeProps & { data: AINodeData }) {
  const nodeType = type as string;
  const Icon = iconMap[nodeType] || Sparkles;
  const label = labelMap[nodeType] || 'AI';

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[160px]
        ${selected 
          ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' 
          : 'border-purple-400 shadow-md'
        }
        bg-gradient-to-br from-white to-purple-50
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-md">
          <Icon className="w-3 h-3 text-purple-600" />
        </div>
        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
          AI
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-900 truncate">
        {data.label || label}
      </div>

      {/* Output variable preview */}
      {data.outputVariable && (
        <div className="mt-2 text-xs">
          <span className="text-gray-500">Output: </span>
          <span className="font-mono text-purple-700 bg-purple-100 px-1 rounded">
            {data.outputVariable}
          </span>
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div className="mt-1 text-xs text-gray-500 truncate">
          {data.description}
        </div>
      )}

      {/* AI badge */}
      <div className="absolute -top-2 -right-2">
        <div className="flex items-center justify-center w-5 h-5 bg-purple-500 rounded-full">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
}

export const AINode = memo(AINodeComponent);
