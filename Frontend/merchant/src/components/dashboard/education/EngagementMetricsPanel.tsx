// @ts-nocheck
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
      <Card className="bg-white border-gray-100 rounded-2xl">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Engagement Score</span>
              <span className="text-2xl font-bold text-gray-900">{metrics.overallScore}%</span>
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
          <Card key={activity.label} className="bg-white border-gray-100 rounded-2xl hover:border-green-500/50 transition-all">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${activity.color.replace('text', 'bg')}/10`}>
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{activity.label}</p>
                  <p className="text-xl font-bold text-gray-900">{activity.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Login Frequency */}
      {metrics.loginFrequency && (
        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Login Frequency</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-100/30">
                <span className="text-gray-500">Daily</span>
                <span className="font-bold text-gray-900">{metrics.loginFrequency.daily}%</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-100/30">
                <span className="text-gray-500">Weekly</span>
                <span className="font-bold text-gray-900">{metrics.loginFrequency.weekly}%</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-100/30">
                <span className="text-gray-500">Monthly</span>
                <span className="font-bold text-gray-900">{metrics.loginFrequency.monthly}%</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-100/30">
                <span className="text-gray-500">Rarely</span>
                <span className="font-bold text-gray-900">{metrics.loginFrequency.rarely}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussion Forums */}
      {metrics.discussionForums && (
        <Card className="bg-white border-gray-100 rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Discussion Forums</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-100/30">
                <span className="text-gray-500">Active Threads</span>
                <span className="font-bold text-gray-900">{metrics.discussionForums.activeThreads}</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-100/30">
                <span className="text-gray-500">Posts Today</span>
                <span className="font-bold text-gray-900">{metrics.discussionForums.postsToday}</span>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-100/30">
                <span className="text-gray-500">Avg Response Time</span>
                <span className="font-bold text-gray-900">{metrics.discussionForums.avgResponseTime}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
