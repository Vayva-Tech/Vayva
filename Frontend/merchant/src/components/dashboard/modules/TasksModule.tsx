"use client";

import React, { useState } from 'react';
import { CheckSquare, Clock, AlertCircle, Calendar, Target } from 'lucide-react';
import cn from 'clsx';

interface Task {
  id: string;
  title: string;
  subtitle?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  icon?: React.ReactNode;
}

interface TasksModuleProps {
  tasks?: Task[];
  onToggleTask?: (id: string) => void;
  onViewAll?: () => void;
  className?: string;
}

/**
 * Universal Tasks Module - Adaptive task management
 * Extracted from UniversalProDashboard & DashboardV2Content
 */
export function TasksModule({
  tasks = [],
  onToggleTask,
  onViewAll,
  className,
}: TasksModuleProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  
  const handleToggle = (id: string) => {
    if (onToggleTask) {
      onToggleTask(id);
    } else {
      setLocalTasks(prev => prev.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    }
  };
  
  const pendingTasks = localTasks.filter(t => !t.completed);
  const completedCount = localTasks.filter(t => t.completed).length;
  
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return <AlertCircle size={14} />;
      case 'medium': return <Clock size={14} />;
      case 'low': return <CheckSquare size={14} />;
    }
  };
  
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <CheckSquare size={16} className="text-green-500" />
          Tasks ({pendingTasks.length} pending)
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-green-600 hover:text-green-700"
          >
            View all
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {localTasks.slice(0, 5).map((task) => (
          <div
            key={task.id}
            className={cn(
              'flex items-start gap-3 p-2 rounded-xl transition-colors',
              task.completed ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
            )}
          >
            <button
              onClick={() => handleToggle(task.id)}
              className={cn(
                'mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors',
                task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500'
              )}
              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {task.completed && <CheckSquare size={14} />}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium truncate',
                task.completed ? 'text-gray-400 line-through' : 'text-gray-900'
              )}>
                {task.title}
              </p>
              {task.subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{task.subtitle}</p>
              )}
              {(task.dueDate || task.priority) && (
                <div className="flex items-center gap-2 mt-1.5">
                  {task.dueDate && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {task.dueDate}
                    </span>
                  )}
                  {task.priority && (
                    <span className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                      getPriorityColor(task.priority)
                    )}>
                      {getPriorityIcon(task.priority)}
                      {task.priority}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {completedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            ✅ {completedCount} {completedCount === 1 ? 'task' : 'tasks'} completed
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Industry-specific task presets
 */
export const IndustryTasks = {
  restaurant: {
    morning: [
      { id: '1', title: 'Check inventory levels', completed: false, priority: 'high' },
      { id: '2', title: 'Review today\'s reservations', completed: false, priority: 'medium' },
      { id: '3', title: 'Brief kitchen staff', completed: false, priority: 'medium' },
      { id: '4', title: 'Update daily specials', completed: true, priority: 'low' },
    ],
  },
  retail: {
    morning: [
      { id: '1', title: 'Restock low inventory', completed: false, priority: 'high' },
      { id: '2', title: 'Update product displays', completed: false, priority: 'medium' },
      { id: '3', title: 'Review sales reports', completed: false, priority: 'medium' },
    ],
  },
  beauty: {
    morning: [
      { id: '1', title: 'Confirm today\'s appointments', completed: false, priority: 'high' },
      { id: '2', title: 'Prepare treatment rooms', completed: false, priority: 'medium' },
      { id: '3', title: 'Review client notes', completed: false, priority: 'low' },
    ],
  },
  healthcare: {
    morning: [
      { id: '1', title: 'Review patient schedule', completed: false, priority: 'high' },
      { id: '2', title: 'Check lab results', completed: false, priority: 'high' },
      { id: '3', title: 'Update medical records', completed: false, priority: 'medium' },
    ],
  },
};
