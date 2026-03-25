/**
 * NodePalette Component
 * Drag-and-drop palette of available workflow nodes
 */

import React, { useMemo } from 'react';
import type { IndustrySlug, NodeType, NodeDefinition } from '@vayva/workflow-engine';
import { getNodesByIndustry } from '@vayva/workflow-engine';
import { 
  Play, 
  GitBranch, 
  Clock, 
  Mail, 
  MessageSquare, 
  Database, 
  User, 
  Tag,
  Sparkles,
  ShoppingBag,
  Utensils,
  Home,
  Heart,
  Split,
  Merge,
  RotateCcw,
  Bell,
  FileText,
  Search,
  Filter,
  Package,
  Layers,
  Plus,
  Minus,
  Percent,
} from 'lucide-react';

export interface NodePaletteProps {
  industry: IndustrySlug;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  trigger: 'Trigger',
  logic: 'Logic',
  action: 'Actions',
  ai: 'AI',
  industry: 'Industry Specific',
};

const categoryOrder = ['trigger', 'logic', 'action', 'ai', 'industry'];

function getIconForNodeType(type: NodeType): React.ComponentType<{ className?: string }> {
  switch (type) {
    case 'trigger':
      return Play;
    case 'condition':
      return GitBranch;
    case 'delay':
      return Clock;
    case 'split':
      return Split;
    case 'merge':
      return Merge;
    case 'loop':
      return RotateCcw;
    case 'send_email':
      return Mail;
    case 'send_sms':
    case 'send_whatsapp':
      return MessageSquare;
    case 'send_push':
    case 'send_notification':
      return Bell;
    case 'update_inventory':
    case 'create_purchase_order':
      return Package;
    case 'create_task':
      return FileText;
    case 'update_customer':
    case 'filter_customers':
      return User;
    case 'tag_customer':
      return Tag;
    case 'apply_discount':
      return Percent;
    case 'update_collection':
      return Layers;
    case 'query_menu_items':
    case 'query_tables':
      return Search;
    case 'ai_classify':
    case 'ai_generate':
    case 'ai_summarize':
    case 'ai_extract':
      return Sparkles;
    case 'fashion_size_alert':
      return ShoppingBag;
    case 'restaurant_86_item':
      return Utensils;
    case 'realestate_schedule_showing':
      return Home;
    case 'healthcare_send_reminder':
      return Heart;
    default:
      return Database;
  }
}

function NodePaletteItem({ node, onDragStart }: { node: NodeDefinition; onDragStart: (e: React.DragEvent, type: NodeType) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      className="flex items-center gap-3 p-3 mb-2 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md">
        {React.createElement(getIconForNodeType(node.type), {
          className: "w-4 h-4 text-gray-600",
        })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{node.label}</div>
        <div className="text-xs text-gray-500 truncate">{node.description}</div>
      </div>
    </div>
  );
}

export function NodePalette({ industry, className = '' }: NodePaletteProps) {
  const nodesByCategory = useMemo(() => {
    const industryNodes = getNodesByIndustry(industry);
    const grouped: Record<string, NodeDefinition[]> = {};

    for (const node of industryNodes) {
      if (!grouped[node.category]) {
        grouped[node.category] = [];
      }
      grouped[node.category].push(node);
    }

    return grouped;
  }, [industry]);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`bg-gray-50 border-r border-gray-200 flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Node Palette
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Drag nodes to the canvas
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {categoryOrder.map((category) => {
          const nodes = nodesByCategory[category];
          if (!nodes || nodes.length === 0) return null;

          return (
            <div key={category} className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {categoryLabels[category] || category}
              </h4>
              {nodes.map((node) => (
                <NodePaletteItem
                  key={node.type}
                  node={node}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-100">
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Drag nodes to add them</li>
            <li>Connect nodes by dragging</li>
            <li>Click to edit properties</li>
            <li>Press Delete to remove</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NodePalette;
