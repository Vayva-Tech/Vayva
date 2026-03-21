'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KanbanSquare, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectStage {
  stage: string;
  count: number;
  percentage?: number;
  avgDuration?: number;
}

interface ProjectPipelineProps {
  projectsByStage?: Record<string, number>;
  onTimeDeliveryRate?: number;
  budgetHealth?: number;
  className?: string;
}

/**
 * ProjectPipeline - Visualizes project distribution by stage
 */
export const ProjectPipeline: React.FC<ProjectPipelineProps> = ({
  projectsByStage = {
    discovery: 4,
    concept: 6,
    production: 8,
    review: 3,
    delivered: 3,
  },
  onTimeDeliveryRate = 94,
  budgetHealth = 87,
  className,
}) => {
  const stages: ProjectStage[] = [
    { stage: 'Discovery', count: projectsByStage.discovery || 0 },
    { stage: 'Concept', count: projectsByStage.concept || 0 },
    { stage: 'Production', count: projectsByStage.production || 0 },
    { stage: 'Review', count: projectsByStage.review || 0 },
    { stage: 'Delivered', count: projectsByStage.delivered || 0 },
  ];

  const totalProjects = stages.reduce((sum, s) => sum + s.count, 0);

  const getStageColor = (stageName: string) => {
    const colors: Record<string, string> = {
      Discovery: 'bg-blue-500',
      Concept: 'bg-purple-500',
      Production: 'bg-orange-500',
      Review: 'bg-orange-500',
      Delivered: 'bg-green-500',
    };
    return colors[stageName] || 'bg-gray-500';
  };

  return (
    <Card className={cn("relative overflow-hidden bg-white/90  border-white/20 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KanbanSquare className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Project Pipeline</h3>
          </div>
          <Badge variant="secondary">{totalProjects} total</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Projects by Stage Bars */}
        <div className="space-y-3">
          {stages.map((stage) => (
            <div key={stage.stage} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.stage}</span>
                <span className="text-gray-500">{stage.count} projects</span>
              </div>
              <div className="relative">
                <Progress 
                  value={(stage.count / totalProjects) * 100} 
                  className="h-2"
                />
                <div 
                  className={cn(
                    "absolute top-0 left-0 h-full rounded-full opacity-20",
                    getStageColor(stage.stage)
                  )}
                  style={{ width: `${(stage.count / totalProjects) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-500">On-Time Delivery</span>
            </div>
            <p className="text-lg font-bold">{onTimeDeliveryRate}%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500">Budget Health</span>
            </div>
            <p className="text-lg font-bold">{budgetHealth}% on track</p>
          </div>
        </div>

        {/* Alerts */}
        {(onTimeDeliveryRate < 90 || budgetHealth < 80) && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-orange-500/10 text-orange-600 text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {onTimeDeliveryRate < 90 && "Delivery delays detected. "}
              {budgetHealth < 80 && "Multiple projects over budget."}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectPipeline;
