'use client';

import React from 'react';

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface BulkActionToolbarProps {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (actionKey: string) => void;
  onCancel: () => void;
  className?: string;
}

export function BulkActionToolbar({
  selectedCount,
  actions,
  onAction,
  onCancel,
  className = '',
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-blue-800">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => onAction(action.key)}
              disabled={action.disabled}
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                action.danger
                  ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                  : 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
              } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {action.icon && <span className="mr-1.5">{action.icon}</span>}
              {action.label}
            </button>
          ))}
          
          <button
            type="button"
            onClick={onCancel}
            className="ml-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}