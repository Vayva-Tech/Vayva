'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, MessageSquare, PlayCircle, FileText } from 'lucide-react';
import { UniversalSectionHeader } from './universal';

interface EngagementMetrics {
  overallScore: number;
  videoViews: number;
  quizAttempts: number;
  forumPosts: number;
  assignmentsCompleted: number;
  loginFrequency?: {
    daily: number;
    weekly: number;
    monthly: number;
    rarely: number;
  };
  discussionForums?: {
    activeThreads: number;
    postsToday: number;
    avgResponseTime: number;
  };
}

interface EngagementMetricsPanelProps {
  metrics: EngagementMetrics;
  designCategory?: string;
}

export function EngagementMetricsPanel({ metrics, designCategory }: EngagementMetricsPanelProps) {
  const engagementActivities = [
    { label: 'Video Views', value: metrics.videoViews, icon: PlayCircle, color: 'text-blue-600' },
    { label: 'Quiz Attempts', value: metrics.quizAttempts, icon: FileText, color: 'text-purple-600' },
    { label: 'Forum Posts', value: metrics.forumPosts, icon: MessageSquare, color: 'text-green-600' },
    { label: 'Assignments', value: metrics.assignmentsCompleted, icon: FileText, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-4">
      <UniversalSectionHeader
        title="Student Engagement"
        subtitle={`Overall score: ${metrics.overallScore}%`}
        icon={<Activity className="h-5 w-5" />}
      />

      {/* Overall Score */}
      <Card className="bg-card border-border/50 rounded-2xl">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Engagement Score</span>
              <span className="text-2xl font-bold text-foreground">{metrics.overallScore}%</span>
            </div>
            <Progress value={metrics.overallScore} className="h-3 rounded-full" style={{
              background: 'linear-gradient(90deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.6) 100%)'
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {engagementActivities.map((activity) => (
          <Card key={activity.label} className="bg-card border-border/50 rounded-2xl hover:border-primary/50 transition-all">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${activity.color.replace('text', 'bg')}/10`}>
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{activity.label}</p>
                  <p className="text-xl font-bold text-foreground">{activity.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Login Frequency */}
      {metrics.loginFrequency && (
        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Login Frequency</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-secondary/30">
                <span className="text-muted-foreground">Daily</span>
                <span className="font-bold text-foreground">{metrics.loginFrequency.daily}%</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-secondary/30">
                <span className="text-muted-foreground">Weekly</span>
                <span className="font-bold text-foreground">{metrics.loginFrequency.weekly}%</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-secondary/30">
                <span className="text-muted-foreground">Monthly</span>
                <span className="font-bold text-foreground">{metrics.loginFrequency.monthly}%</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-secondary/30">
                <span className="text-muted-foreground">Rarely</span>
                <span className="font-bold text-foreground">{metrics.loginFrequency.rarely}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussion Forums */}
      {metrics.discussionForums && (
        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Discussion Forums</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-secondary/30">
                <span className="text-muted-foreground">Active Threads</span>
                <span className="font-bold text-foreground">{metrics.discussionForums.activeThreads}</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-secondary/30">
                <span className="text-muted-foreground">Posts Today</span>
                <span className="font-bold text-foreground">{metrics.discussionForums.postsToday}</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-secondary/30">
                <span className="text-muted-foreground">Avg Response Time</span>
                <span className="font-bold text-foreground">{metrics.discussionForums.avgResponseTime}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
