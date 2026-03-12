/**
 * ActionNode Component
 * Visual representation of action nodes (send_email, update_inventory, etc.)
 */

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { 
  Mail, 
  MessageSquare, 
  Database, 
  User, 
  Tag, 
  Package, 
  FileText,
  Layers,
  Search,
  Bell,
  Percent,
  type LucideIcon 
} from 'lucide-react';

interface ActionNodeData {
  label?: string;
  description?: string;
}

const iconMap: Record<string, LucideIcon> = {
  send_email: Mail,
  send_sms: MessageSquare,
  send_whatsapp: MessageSquare,
  send_push: Bell,
  send_notification: Bell,
  update_inventory: Database,
  create_task: FileText,
  update_customer: User,
  tag_customer: Tag,
  apply_discount: Percent,
  create_purchase_order: Package,
  update_collection: Layers,
  filter_customers: User,
  query_menu_items: Search,
  query_tables: Search,
};

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  send_email: { bg: 'bg-blue-50', border: 'border-blue-400', icon: 'text-blue-600' },
  send_sms: { bg: 'bg-purple-50', border: 'border-purple-400', icon: 'text-purple-600' },
  send_whatsapp: { bg: 'bg-green-50', border: 'border-green-400', icon: 'text-green-600' },
  send_push: { bg: 'bg-orange-50', border: 'border-orange-400', icon: 'text-orange-600' },
  send_notification: { bg: 'bg-orange-50', border: 'border-orange-400', icon: 'text-orange-600' },
  update_inventory: { bg: 'bg-cyan-50', border: 'border-cyan-400', icon: 'text-cyan-600' },
  create_task: { bg: 'bg-indigo-50', border: 'border-indigo-400', icon: 'text-indigo-600' },
  update_customer: { bg: 'bg-pink-50', border: 'border-pink-400', icon: 'text-pink-600' },
  tag_customer: { bg: 'bg-yellow-50', border: 'border-yellow-400', icon: 'text-yellow-600' },
  apply_discount: { bg: 'bg-red-50', border: 'border-red-400', icon: 'text-red-600' },
  create_purchase_order: { bg: 'bg-teal-50', border: 'border-teal-400', icon: 'text-teal-600' },
  update_collection: { bg: 'bg-violet-50', border: 'border-violet-400', icon: 'text-violet-600' },
  filter_customers: { bg: 'bg-pink-50', border: 'border-pink-400', icon: 'text-pink-600' },
  query_menu_items: { bg: 'bg-amber-50', border: 'border-amber-400', icon: 'text-amber-600' },
  query_tables: { bg: 'bg-amber-50', border: 'border-amber-400', icon: 'text-amber-600' },
};

function ActionNodeComponent({ id, data, selected, type }: NodeProps & { data: ActionNodeData }) {
  const nodeType = type as string;
  const Icon = iconMap[nodeType] || Database;
  const colors = colorMap[nodeType] || { bg: 'bg-gray-50', border: 'border-gray-400', icon: 'text-gray-600' };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[160px]
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
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Action
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-900 truncate">
        {data.label || 'Action'}
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

export const ActionNode = memo(ActionNodeComponent);
