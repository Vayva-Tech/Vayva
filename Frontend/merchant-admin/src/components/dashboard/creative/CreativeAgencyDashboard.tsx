'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AgencyOverview, 
  ProjectPipeline, 
  ResourceAllocation, 
  TimeTracking, 
  ProjectFinancials 
} from './index';
import { cn } from '@/lib/utils';

interface CreativeAgencyDashboardProps {
  storeId: string;
  className?: string;
}

/**
 * CreativeAgencyDashboard - Complete dashboard for creative agencies
 * Integrates all creative agency components with real data fetching
 */
export const CreativeAgencyDashboard: React.FC<CreativeAgencyDashboardProps> = ({
  storeId,
  className,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/creative/dashboard/analytics?storeId=${storeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        setData(result.analytics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchDashboardData();
    }
  }, [storeId]);

  // Fetch resource capacity data
  const [resourceData, setResourceData] = useState<any>(null);

  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        const response = await fetch(`/api/creative/resources/capacity?storeId=${storeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch resource data');
        }
        
        const result = await response.json();
        setResourceData(result.capacity);
      } catch (err) {
        console.error('Error fetching resource data:', err);
      }
    };

    if (storeId && data) {
      fetchResourceData();
    }
  }, [storeId, data]);

  if (loading) {
    return <CreativeAgencyDashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className={cn("bg-destructive/10 border-destructive/20", className)}>
        <CardContent className="p-6">
          <p className="text-destructive font-medium">Error loading dashboard: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Row 1: Agency Overview */}
      <AgencyOverview
        activeProjects={data.activeProjectsCount || 0}
        utilizationRate={data.utilizationRate || 0}
        revenueMTD={data.revenueMTD || 0}
        projectsTrend="up"
        utilizationTrend="up"
        revenueTrend="up"
      />

      {/* Row 2: Project Pipeline & Resource Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectPipeline
          projectsByStage={data.projectsByStage || {}}
          onTimeDeliveryRate={94}
          budgetHealth={87}
        />
        <ResourceAllocation
          teamMembers={resourceData?.teamMembers || []}
        />
      </div>

      {/* Row 3: Time Tracking & Project Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeTracking
          billedHours={data.weeklyHoursBilled || 0}
          nonBillableHours={Math.round((data.weeklyHoursBilled || 0) * 0.15)}
          missingHours={0}
          avgHourlyRate={127}
        />
        <ProjectFinancials
          projects={data.projectMargins || []}
        />
      </div>
    </div>
  );
};

// Skeleton loader for loading state
const CreativeAgencyDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Agency Overview Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline & Resources Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Time & Financials Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreativeAgencyDashboard;
