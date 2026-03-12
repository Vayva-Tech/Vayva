/**
 * PropertiesPanel Component
 * Side panel for editing node and edge properties
 */

import React from 'react';
import type { Node, Edge } from '@xyflow/react';
import { X, Trash2 } from 'lucide-react';

export interface PropertiesPanelProps {
  node: Node | null;
  edge: Edge | null;
  onNodeUpdate: (nodeId: string, data: Record<string, unknown>) => void;
  onEdgeUpdate: (edgeId: string, data: Record<string, unknown>) => void;
  onClose: () => void;
  className?: string;
}

export function PropertiesPanel({
  node,
  edge,
  onNodeUpdate,
  onEdgeUpdate,
  onClose,
  className = '',
}: PropertiesPanelProps) {
  if (!node && !edge) return null;

  const isNode = !!node;
  const item = (node || edge)!;
  const data = item.data as Record<string, unknown> || {};

  const handleDataChange = (key: string, value: unknown) => {
    const newData = { ...data, [key]: value };
    if (isNode) {
      onNodeUpdate(item.id, newData);
    } else {
      onEdgeUpdate(item.id, newData);
    }
  };

  const renderNodeProperties = () => {
    const nodeType = item.type as string;

    return (
      <div className="space-y-4">
        {/* Common Properties */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={String(data.label || '')}
            onChange={(e) => handleDataChange('label', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type-specific Properties */}
        {nodeType === 'condition' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Field
              </label>
              <input
                type="text"
                value={String(data.field || '')}
                onChange={(e) => handleDataChange('field', e.target.value)}
                placeholder="e.g., order.amount"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Operator
              </label>
              <select
                value={String(data.operator || 'equals')}
                onChange={(e) => handleDataChange('operator', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
                <option value="in">In</option>
                <option value="not_in">Not In</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="text"
                value={String(data.value || '')}
                onChange={(e) => handleDataChange('value', e.target.value)}
                placeholder="Value to compare"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {nodeType === 'delay' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Delay Duration
            </label>
            <input
              type="text"
              value={String(data.delay || '')}
              onChange={(e) => handleDataChange('delay', e.target.value)}
              placeholder="e.g., 5m, 1h, 24h"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 5m (minutes), 1h (hours), 24h (days)
            </p>
          </div>
        )}

        {(nodeType === 'send_email') && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="text"
                value={String(data.to || '')}
                onChange={(e) => handleDataChange('to', e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Template
              </label>
              <input
                type="text"
                value={String(data.template || '')}
                onChange={(e) => handleDataChange('template', e.target.value)}
                placeholder="Template name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {'includeLookbook' in data && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(data.includeLookbook)}
                  onChange={(e) => handleDataChange('includeLookbook', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">Include Lookbook</label>
              </div>
            )}
          </>
        )}

        {(nodeType === 'send_sms' || nodeType === 'send_whatsapp') && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="text"
                value={String(data.to || '')}
                onChange={(e) => handleDataChange('to', e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Template
              </label>
              <input
                type="text"
                value={String(data.template || '')}
                onChange={(e) => handleDataChange('template', e.target.value)}
                placeholder="Template name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {nodeType === 'update_inventory' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product ID
              </label>
              <input
                type="text"
                value={String(data.productId || '')}
                onChange={(e) => handleDataChange('productId', e.target.value)}
                placeholder="Product ID"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                value={String(data.operation || 'set')}
                onChange={(e) => handleDataChange('operation', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="set">Set</option>
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={String(data.quantity || '')}
                onChange={(e) => handleDataChange('quantity', parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {nodeType === 'create_task' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={String(data.title || '')}
                onChange={(e) => handleDataChange('title', e.target.value)}
                placeholder="Task title"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={String(data.assignee || '')}
                onChange={(e) => handleDataChange('assignee', e.target.value)}
                placeholder="User ID"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={String(data.priority || 'medium')}
                onChange={(e) => handleDataChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </>
        )}

        {nodeType === 'tag_customer' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={Array.isArray(data.tags) ? data.tags.join(', ') : ''}
                onChange={(e) => handleDataChange('tags', e.target.value.split(',').map(t => t.trim()))}
                placeholder="vip, repeat-customer"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                value={String(data.operation || 'add')}
                onChange={(e) => handleDataChange('operation', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="add">Add</option>
                <option value="remove">Remove</option>
                <option value="set">Set</option>
              </select>
            </div>
          </>
        )}

        {nodeType === 'ai_generate' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Prompt
              </label>
              <textarea
                value={String(data.prompt || '')}
                onChange={(e) => handleDataChange('prompt', e.target.value)}
                placeholder="Enter prompt for AI generation"
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Output Variable
              </label>
              <input
                type="text"
                value={String(data.outputVariable || '')}
                onChange={(e) => handleDataChange('outputVariable', e.target.value)}
                placeholder="generatedContent"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {nodeType === 'ai_classify' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Input
              </label>
              <input
                type="text"
                value={String(data.input || '')}
                onChange={(e) => handleDataChange('input', e.target.value)}
                placeholder="Text to classify"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Categories (comma-separated)
              </label>
              <input
                type="text"
                value={Array.isArray(data.categories) ? data.categories.join(', ') : ''}
                onChange={(e) => handleDataChange('categories', e.target.value.split(',').map(t => t.trim()))}
                placeholder="positive, negative, neutral"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Output Variable
              </label>
              <input
                type="text"
                value={String(data.outputVariable || '')}
                onChange={(e) => handleDataChange('outputVariable', e.target.value)}
                placeholder="classification"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Description field for all nodes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={String(data.description || '')}
            onChange={(e) => handleDataChange('description', e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  const renderEdgeProperties = () => {
    const edgeData = data as { condition?: { type: string; expression?: string }; label?: string };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={String(edgeData.label || '')}
            onChange={(e) => handleDataChange('label', e.target.value)}
            placeholder="Edge label"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Condition Type
          </label>
          <select
            value={edgeData.condition?.type || 'true'}
            onChange={(e) => handleDataChange('condition', { 
              ...edgeData.condition, 
              type: e.target.value 
            })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Always True</option>
            <option value="false">Always False</option>
            <option value="custom">Custom Expression</option>
          </select>
        </div>

        {edgeData.condition?.type === 'custom' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Expression
            </label>
            <input
              type="text"
              value={String(edgeData.condition?.expression || '')}
              onChange={(e) => handleDataChange('condition', { 
                ...edgeData.condition, 
                expression: e.target.value 
              })}
              placeholder="e.g., order.amount > 100"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          {isNode ? 'Node Properties' : 'Edge Properties'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isNode ? renderNodeProperties() : renderEdgeProperties()}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <p>ID: <span className="font-mono">{item.id}</span></p>
          <p>Type: <span className="font-mono">{item.type}</span></p>
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;
