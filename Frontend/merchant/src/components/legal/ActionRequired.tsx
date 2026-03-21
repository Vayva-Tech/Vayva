"use client";

import React from "react";
import { Card, Button } from "@vayva/ui";
import { CheckSquare, Square } from "@phosphor-icons/react";
import type { ActionRequiredItem } from "@/types/legal";

interface ActionRequiredProps {
  items: ActionRequiredItem[];
  onRefresh?: () => void;
}

export function ActionRequired({ items, onRefresh }: ActionRequiredProps) {
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());

  const toggleComplete = (id: string) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompleted(newCompleted);
  };

  const pendingItems = items.filter(item => !completed.has(item.id));
  const urgentItems = pendingItems.filter(item => item.priority === 'urgent' || item.priority === 'critical');
  const normalItems = pendingItems.filter(item => item.priority !== 'urgent' && item.priority !== 'critical');

  return (
    <Card className="p-6 border-l-4 border-orange-600 shadow-lg  bg-white/90">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={24} className="text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
        </div>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        )}
      </div>

      {pendingItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckSquare size={48} className="mx-auto mb-2 text-green-600" />
          <p>All caught up! No pending actions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Urgent Items */}
          {urgentItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide">Urgent</h3>
              {urgentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className="mt-0.5 text-red-600 hover:text-red-800"
                  >
                    <Square size={20} />
                  </button>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                    {item.caseNumber && (
                      <div className="text-xs text-gray-500 mt-1">Case: {item.caseNumber}</div>
                    )}
                    <div className="text-xs text-red-700 mt-2 font-medium">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Normal Priority Items */}
          {normalItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Normal Priority</h3>
              {normalItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className="mt-0.5 text-gray-600 hover:text-gray-800"
                  >
                    <Square size={20} />
                  </button>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                    {item.caseNumber && (
                      <div className="text-xs text-gray-500 mt-1">Case: {item.caseNumber}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
