'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectFinancial {
  id: string;
  name: string;
  budget: number;
  spent: number;
  margin: number;
  status: 'healthy' | 'at-risk' | 'critical';
}

interface ProjectFinancialsProps {
  projects?: ProjectFinancial[];
  className?: string;
}

/**
 * ProjectFinancials - Displays project profitability and budget health
 */
export const ProjectFinancials: React.FC<ProjectFinancialsProps> = ({
  projects = [
    {
      id: '1',
      name: 'Website Redesign (Acme Corp)',
      budget: 25000,
      spent: 18000,
      margin: 72,
      status: 'healthy',
    },
    {
      id: '2',
      name: 'Brand Campaign (TechStart)',
      budget: 15000,
      spent: 17000,
      margin: 45,
      status: 'at-risk',
    },
    {
      id: '3',
      name: 'Mobile App (GlobalInc)',
      budget: 50000,
      spent: 31000,
      margin: 68,
      status: 'healthy',
    },
  ],
  className,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      healthy: 'text-green-500',
      'at-risk': 'text-amber-500',
      critical: 'text-red-500',
    };
    return colors[status] || 'text-gray-500';
  };

  const getStatusBg = (status: string) => {
    const colors: Record<string, string> = {
      healthy: 'bg-green-500',
      'at-risk': 'bg-amber-500',
      critical: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      healthy: <CheckCircle className="h-4 w-4" />,
      'at-risk': <AlertTriangle className="h-4 w-4" />,
      critical: <AlertTriangle className="h-4 w-4" />,
    };
    return icons[status] || null;
  };

  const atRiskProjects = projects.filter((p) => p.status !== 'healthy');

  return (
    <Card className={cn("relative overflow-hidden bg-card/90 backdrop-blur-sm border-white/20 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Project Financials</h3>
          </div>
          <Badge variant={atRiskProjects.length > 0 ? "destructive" : "secondary"}>
            {atRiskProjects.length} at risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project List */}
        <div className="space-y-3">
          {projects.map((project) => {
            const remaining = project.budget - project.spent;
            const budgetUsed = Math.round((project.spent / project.budget) * 100);

            return (
              <div 
                key={project.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Budget: {formatCurrency(project.budget)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Spent: {formatCurrency(project.spent)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("flex items-center gap-1", getStatusColor(project.status))}>
                      {getStatusIcon(project.status)}
                      <span className="text-xs font-semibold capitalize">{project.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Budget Used</span>
                    <span className="font-medium">{budgetUsed}%</span>
                  </div>
                  <Progress value={budgetUsed} className="h-2" />
                </div>

                {/* Margin & Remaining */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Margin:</span>
                    <span className={cn("text-xs font-semibold", 
                      project.margin >= 60 ? "text-green-500" : 
                      project.margin >= 50 ? "text-amber-500" : "text-red-500"
                    )}>
                      {project.margin}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {remaining >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={cn("text-xs font-semibold",
                      remaining >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {remaining >= 0 ? '+' : ''}{formatCurrency(remaining)} remaining
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t">
          <div>
            <span className="text-xs text-muted-foreground">Avg Margin</span>
            <p className="text-lg font-bold">
              {Math.round(projects.reduce((sum, p) => sum + p.margin, 0) / projects.length)}%
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total Budget</span>
            <p className="text-lg font-bold">
              {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {atRiskProjects.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 text-amber-600 text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {atRiskProjects.length} project(s) over budget or low margin
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectFinancials;
