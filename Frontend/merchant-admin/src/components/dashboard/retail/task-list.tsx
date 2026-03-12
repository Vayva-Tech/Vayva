'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  Package,
  Users,
  DollarSign,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'inventory' | 'sales' | 'customer' | 'finance' | 'operations';
  dueDate?: string;
  assignee?: string;
}

interface TaskListProps {
  tasks?: Task[];
  onTaskToggle?: (taskId: string) => void;
  className?: string;
}

export function TaskList({ tasks = [], onTaskToggle, className }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  const handleToggle = (taskId: string) => {
    if (onTaskToggle) {
      onTaskToggle(taskId);
    } else {
      setLocalTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return <Package className="w-4 h-4" />;
      case 'sales': return <BarChart3 className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'finance': return <DollarSign className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'text-amber-600';
      case 'sales': return 'text-green-600';
      case 'customer': return 'text-blue-600';
      case 'finance': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const timeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) return 'Overdue';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m left`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h left`;
    return `${Math.floor(diffInSeconds / 86400)}d left`;
  };

  const completedCount = localTasks.filter(t => t.completed).length;
  const totalCount = localTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Sample tasks if none provided
  const displayTasks = localTasks.length > 0 ? localTasks : getSampleTasks();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Daily Tasks</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <Button size="sm">Add Task</Button>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4 p-3 bg-accent/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="text-sm font-bold">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 border rounded-lg transition-all hover:shadow-md ${
                task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
              }`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggle(task.id)}
                className="mt-0.5"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Mark as complete</DropdownMenuItem>
                      <DropdownMenuItem>Edit task</DropdownMenuItem>
                      <DropdownMenuItem>Change priority</DropdownMenuItem>
                      <DropdownMenuItem>Delete task</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {task.description && (
                  <p className="text-xs text-muted-foreground pl-6">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-3 pl-6">
                  <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                    {task.priority}
                  </Badge>
                  
                  <div className={`flex items-center gap-1 text-xs ${getCategoryColor(task.category)}`}>
                    {getCategoryIcon(task.category)}
                    <span className="capitalize">{task.category}</span>
                  </div>
                  
                  {task.dueDate && (
                    <div className="text-xs text-muted-foreground">
                      {timeAgo(task.dueDate)}
                    </div>
                  )}
                  
                  {task.assignee && (
                    <div className="text-xs text-muted-foreground">
                      @{task.assignee}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add Suggestions */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium mb-2">Quick Add:</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7">
              Restock Alert
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7">
              Follow-up Call
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7">
              Review Sales
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for sample tasks
function getSampleTasks(): Task[] {
  return [
    {
      id: '1',
      title: 'Review low stock alerts',
      description: 'Check inventory for products below reorder point',
      completed: false,
      priority: 'urgent',
      category: 'inventory',
      dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 hours
    },
    {
      id: '2',
      title: 'Approve transfer request',
      description: 'Store #2 requesting stock transfer',
      completed: false,
      priority: 'high',
      category: 'operations',
      dueDate: new Date(Date.now() + 5 * 3600 * 1000).toISOString(), // 5 hours
    },
    {
      id: '3',
      title: 'Call VIP customer',
      description: 'Follow up on large order inquiry',
      completed: true,
      priority: 'medium',
      category: 'customer',
      assignee: 'Sarah',
    },
    {
      id: '4',
      title: 'Review daily sales report',
      completed: false,
      priority: 'medium',
      category: 'sales',
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 1 day
    },
    {
      id: '5',
      title: 'Process refund request',
      completed: false,
      priority: 'low',
      category: 'finance',
    },
  ];
}
