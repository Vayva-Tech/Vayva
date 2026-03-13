'use client';

import React, { useState, useEffect } from 'react';
import { KDSService } from '../../services';
import { Card, CardContent, CardHeader, CardTitle , Badge , Button } from '@vayva/ui';
import { 
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';

interface PrepTask {
  id: string;
  name: string;
  quantity: number;
  completed: number;
  station: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  deadline?: Date;
}

interface PrepListProps {
  kdsService: KDSService;
}

export function PrepList({ kdsService }: PrepListProps) {
  const [prepTasks, setPrepTasks] = useState<PrepTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrepTasks = async () => {
      try {
        // Mock data - in real implementation, this would come from the service
        const mockTasks: PrepTask[] = [
          {
            id: '1',
            name: 'Chop Vegetables',
            quantity: 50,
            completed: 32,
            station: 'Prep',
            priority: 'high',
            estimatedTime: 30,
            deadline: new Date(Date.now() + 3600000) // 1 hour from now
          },
          {
            id: '2',
            name: 'Prepare Marinades',
            quantity: 15,
            completed: 15,
            station: 'Prep',
            priority: 'medium',
            estimatedTime: 45
          },
          {
            id: '3',
            name: 'Make Stock',
            quantity: 3,
            completed: 1,
            station: 'Sauté',
            priority: 'high',
            estimatedTime: 120,
            deadline: new Date(Date.now() + 7200000) // 2 hours from now
          },
          {
            id: '4',
            name: 'Prep Garnishes',
            quantity: 25,
            completed: 8,
            station: 'Cold',
            priority: 'low',
            estimatedTime: 20
          },
          {
            id: '5',
            name: 'Clean Griddles',
            quantity: 2,
            completed: 0,
            station: 'Grill',
            priority: 'medium',
            estimatedTime: 15
          }
        ];
        
        setPrepTasks(mockTasks);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch prep tasks:', error);
        setLoading(false);
      }
    };

    fetchPrepTasks();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPrepTasks, 30000);
    return () => clearInterval(interval);
  }, [kdsService]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const updateTaskProgress = (taskId: string, increment: number) => {
    setPrepTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newCompleted = Math.max(0, Math.min(task.quantity, task.completed + increment));
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const incompleteTasks = prepTasks.filter(task => task.completed < task.quantity);
  const completedTasks = prepTasks.filter(task => task.completed >= task.quantity);

  const urgentTasks = incompleteTasks.filter(task => 
    task.priority === 'high' && task.deadline && 
    task.deadline.getTime() - Date.now() < 3600000 // Less than 1 hour
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-gray-900 border border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <ClipboardList className="h-5 w-5" />
              Prep List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Prep List Card */}
      <Card className="bg-gray-900 border border-cyan-500/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <ClipboardList className="h-5 w-5" />
            Prep List
            <Badge variant="secondary" className="ml-auto bg-cyan-500/20 text-cyan-300">
              {incompleteTasks.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {incompleteTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
              <p className="font-medium text-green-400">All prep tasks completed!</p>
              <p className="text-sm">Great job keeping up with prep work</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentTasks.length > 0 && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="font-medium text-red-400">Urgent Tasks</span>
                  </div>
                  <div className="text-sm text-red-300">
                    {urgentTasks.length} task{urgentTasks.length > 1 ? 's' : ''} due soon
                  </div>
                </div>
              )}
              
              {incompleteTasks.map(task => {
                const progress = getProgressPercentage(task.completed, task.quantity);
                return (
                  <div 
                    key={task.id}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{task.name}</h3>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <span>{task.station} Station</span>
                      <span>{task.estimatedTime} min</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{task.completed}/{task.quantity} completed</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskProgress(task.id, -1)}
                          disabled={task.completed <= 0}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-white font-medium w-8 text-center">
                          {task.completed}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskProgress(task.id, 1)}
                          disabled={task.completed >= task.quantity}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {task.completed >= task.quantity && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    
                    {task.deadline && (
                      <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2">
                        <Clock className="h-3 w-3" />
                        Due: {task.deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Completed */}
      {completedTasks.length > 0 && (
        <Card className="bg-gray-900 border border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              Recently Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedTasks.slice(0, 3).map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-green-900/20 rounded-lg border border-green-500/30"
                >
                  <div>
                    <div className="font-medium text-green-300">{task.name}</div>
                    <div className="text-xs text-green-400/80">{task.station} Station</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gray-900 border border-cyan-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Prep Task
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              View Full Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}