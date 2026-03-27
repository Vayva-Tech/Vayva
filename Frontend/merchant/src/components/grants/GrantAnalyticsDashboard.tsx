"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, CheckCircle, Clock, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency } from "@vayva/shared";

interface SuccessRateMetrics {
  totalApplications: number;
  awardedApplications: number;
  totalAwarded: number;
  successRate: number;
}

interface PipelineMetrics {
  draftCount: number;
  submittedCount: number;
  underReviewCount: number;
  fundedCount: number;
  rejectedCount: number;
  pipelineValue: number;
  averageGrantSize: number;
}

interface DeadlineMetrics {
  upcomingDeadlines: number;
  overdueGrants: number;
  averageDaysToDeadline: number;
}

export default function GrantAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [successMetrics, setSuccessMetrics] = useState<SuccessRateMetrics | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [deadlineMetrics, setDeadlineMetrics] = useState<DeadlineMetrics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [grantsData] = await Promise.all([
        apiJson<{ data: any[] }>("/api/nonprofit/grants?limit=100"),
      ]);

      const grants = grantsData.data || [];

      // Calculate success rate metrics
      const totalApplications = grants.reduce((sum, g) => sum + (g.applications?.length || 0), 0);
      const awardedApplications = grants.reduce(
        (sum, g) => sum + (g.applications?.filter((a: any) => a.status === "awarded")?.length || 0),
        0
      );
      const totalAwarded = grants.reduce(
        (sum, g) =>
          sum +
          (g.applications?.reduce((s: number, a: any) => s + (Number(a.awardedAmount) || 0), 0) || 0),
        0
      );

      setSuccessMetrics({
        totalApplications,
        awardedApplications,
        totalAwarded,
        successRate: totalApplications > 0 ? Math.round((awardedApplications / totalApplications) * 10000) / 100 : 0,
      });

      // Calculate pipeline metrics
      const draftCount = grants.filter((g: any) => g.status === "draft").length;
      const submittedCount = grants.filter((g: any) => g.status === "submitted").length;
      const underReviewCount = grants.filter((g: any) => g.status === "under_review").length;
      const fundedCount = grants.filter((g: any) => g.status === "funded").length;
      const rejectedCount = grants.filter((g: any) => g.status === "rejected").length;
      const pipelineValue = grants.reduce((sum: number, g: any) => sum + Number(g.requestedAmount || 0), 0);
      const averageGrantSize = grants.length > 0 ? pipelineValue / grants.length : 0;

      setPipelineMetrics({
        draftCount,
        submittedCount,
        underReviewCount,
        fundedCount,
        rejectedCount,
        pipelineValue,
        averageGrantSize,
      });

      // Calculate deadline metrics
      const now = Date.now();
      const deadlines = grants.map((g: any) => ({
        daysUntil: Math.ceil((new Date(g.deadline).getTime() - now) / (1000 * 60 * 60 * 24)),
      }));

      const upcomingDeadlines = deadlines.filter((d: any) => d.daysUntil > 0 && d.daysUntil <= 30).length;
      const overdueGrants = deadlines.filter((d: any) => d.daysUntil < 0).length;
      const positiveDeadlines = deadlines.filter((d: any) => d.daysUntil > 0);
      const averageDaysToDeadline =
        positiveDeadlines.length > 0
          ? Math.round(positiveDeadlines.reduce((sum: number, d: any) => sum + d.daysUntil, 0) / positiveDeadlines.length)
          : 0;

      setDeadlineMetrics({
        upcomingDeadlines,
        overdueGrants,
        averageDaysToDeadline,
      });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_ANALYTICS_ERROR]", { error: _errMsg });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Rate Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Success Rate Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successMetrics?.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awarded</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successMetrics?.awardedApplications || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Successful applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Awarded</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(successMetrics?.totalAwarded || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total funding secured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successMetrics?.successRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {successMetrics?.successRate && successMetrics.successRate >= 50
                  ? "Above average"
                  : "Below average"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pipeline Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Grant Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelineMetrics?.draftCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Not yet submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelineMetrics?.submittedCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelineMetrics?.underReviewCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">In evaluation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funded</CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelineMetrics?.fundedCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully awarded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <Target className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipelineMetrics?.rejectedCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Not awarded</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pipelineMetrics?.pipelineValue || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total requested amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Grant Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pipelineMetrics?.averageGrantSize || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per grant opportunity</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deadline Tracking Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Deadline Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deadlineMetrics?.upcomingDeadlines || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deadlineMetrics?.overdueGrants || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Past deadline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Days to Deadline</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deadlineMetrics?.averageDaysToDeadline || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Average time remaining</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
