/**
 * Creative Industry - Analytics & Performance Page
 * Track business metrics, project performance, and client insights
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, Users, Briefcase, TrendingDown } from "lucide-react";

export default function CreativeAnalyticsPage() {
  const router = useRouter();

  const metrics = {
    revenue: 185000,
    revenueGrowth: 22.5,
    activeProjects: 12,
    projectsCompleted: 47,
    avgProjectValue: 28500,
    clientRetention: 85,
    utilizationRate: 78,
    avgRating: 4.8,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/creative")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analytics & Performance</h1>
            <p className="text-muted-foreground">Track business metrics and insights</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${metrics.revenue.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">+{metrics.revenueGrowth}%</span>
                  <span className="text-muted-foreground ml-1">vs last month</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{metrics.activeProjects}</p>
                <p className="text-xs text-muted-foreground mt-2">{metrics.projectsCompleted} completed total</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Project Value</p>
                <p className="text-2xl font-bold">${(metrics.avgProjectValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground mt-2">Per project average</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Client Retention</p>
                <p className="text-2xl font-bold">{metrics.clientRetention}%</p>
                <p className="text-xs text-muted-foreground mt-2">Repeat clients</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.utilizationRate}%</div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${metrics.utilizationRate > 75 ? 'bg-green-500' : metrics.utilizationRate > 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                style={{ width: `${metrics.utilizationRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Billable hours vs available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Client Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{metrics.avgRating}</div>
              <div className="ml-2 flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4">
                    <svg viewBox="0 0 20 20" fill={i < Math.floor(metrics.avgRating) ? "#FBBF24" : "#D1D5DB"} className="w-full h-full">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Based on all reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245K</div>
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600 font-medium">+32%</span>
              <span className="text-muted-foreground ml-1">next quarter</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Revenue Growth</p>
                  <p className="text-sm text-muted-foreground">Strong upward trend</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600">Excellent</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Client Satisfaction</p>
                  <p className="text-sm text-muted-foreground">High retention rate</p>
                </div>
              </div>
              <Badge variant="default" className="bg-blue-600">85% Retention</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Project Pipeline</p>
                  <p className="text-sm text-muted-foreground">Healthy workload</p>
                </div>
              </div>
              <Badge variant="secondary">12 Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
