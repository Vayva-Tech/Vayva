'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, AlertTriangle, UserPlus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  allocatedHours: number;
  availableHours: number;
  utilizationRate: number;
  isOverallocated: boolean;
  skills?: string[];
}

interface ResourceAllocationProps {
  teamMembers?: TeamMember[];
  className?: string;
}

/**
 * ResourceAllocation - Displays team workload and capacity
 */
export const ResourceAllocation: React.FC<ResourceAllocationProps> = ({
  teamMembers = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Designer',
      allocatedHours: 32,
      availableHours: 40,
      utilizationRate: 80,
      isOverallocated: false,
      skills: ['UI/UX', 'Figma'],
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      role: 'Developer',
      allocatedHours: 36,
      availableHours: 40,
      utilizationRate: 90,
      isOverallocated: false,
      skills: ['React', 'Node.js'],
    },
    {
      id: '3',
      name: 'Jessica Park',
      role: 'Copywriter',
      allocatedHours: 16,
      availableHours: 40,
      utilizationRate: 40,
      isOverallocated: false,
      skills: ['Content', 'SEO'],
    },
    {
      id: '4',
      name: 'Tom Wilson',
      role: 'Strategist',
      allocatedHours: 24,
      availableHours: 40,
      utilizationRate: 60,
      isOverallocated: false,
      skills: ['Strategy', 'Analytics'],
    },
  ],
  className,
}) => {
  const overallocated = teamMembers.filter((m) => m.isOverallocated);
  const available = teamMembers.filter((m) => !m.isOverallocated && m.utilizationRate < 80);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-500';
    if (rate >= 70) return 'text-green-500';
    if (rate >= 50) return 'text-amber-500';
    return 'text-blue-500';
  };

  const getUtilizationBg = (rate: number) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 50) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <Card className={cn("relative overflow-hidden bg-card/90 backdrop-blur-sm border-white/20 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Resource Allocation</h3>
          </div>
          <div className="flex gap-2">
            {overallocated.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {overallocated.length} overallocated
              </Badge>
            )}
            {available.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <UserPlus className="h-3 w-3" />
                {available.length} available
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Workload Bars */}
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-xs text-muted-foreground">({member.role})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {member.allocatedHours}/{member.availableHours}h
                  </span>
                  <span className={cn("text-xs font-semibold", getUtilizationColor(member.utilizationRate))}>
                    {member.utilizationRate}%
                  </span>
                </div>
              </div>
              <div className="relative">
                <Progress value={member.utilizationRate} className="h-2" />
                <div 
                  className={cn(
                    "absolute top-0 left-0 h-full rounded-full",
                    getUtilizationBg(member.utilizationRate)
                  )}
                  style={{ width: `${member.utilizationRate}%` }}
                />
              </div>
              {member.skills && member.skills.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {member.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t text-sm">
          <div>
            <span className="text-muted-foreground">Avg Utilization</span>
            <p className="text-lg font-bold">
              {Math.round(teamMembers.reduce((sum, m) => sum + m.utilizationRate, 0) / teamMembers.length)}%
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Capacity</span>
            <p className="text-lg font-bold">{available.length} people free</p>
          </div>
        </div>

        {/* Alerts */}
        {overallocated.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 text-red-600 text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {overallocated.map((m) => m.name).join(', ')} {overallocated.length === 1 ? 'is' : 'are'} overallocated
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceAllocation;
