'use client';

import React, { useState } from 'react';

export interface ProjectWorkflowBoardProps {
  businessId: string;
  onViewTask?: (taskId: string) => void;
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export function ProjectWorkflowBoard({ businessId, onViewTask }: ProjectWorkflowBoardProps) {
  const columns: Column[] = [
    {
      id: 'backlog',
      title: 'Backlog',
      tasks: [
        { id: '1', title: 'Research competitors', assignee: 'John D.', priority: 'low', dueDate: new Date('2024-02-01') },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        { id: '2', title: 'Design homepage mockup', assignee: 'Sarah M.', priority: 'high', dueDate: new Date('2024-01-20') },
      ],
    },
    {
      id: 'review',
      title: 'Client Review',
      tasks: [
        { id: '3', title: 'Brand guidelines doc', assignee: 'Mike R.', priority: 'medium', dueDate: new Date('2024-01-18') },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: '4', title: 'Initial client meeting', assignee: 'Team', priority: 'high', dueDate: new Date('2024-01-10') },
      ],
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="project-workflow-board max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Workflow</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
              {column.title}
              <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </h3>

            <div className="space-y-3">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onViewTask?.(task.id)}
                  className="bg-white rounded-md shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{task.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{task.assignee}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Due: {task.dueDate.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
