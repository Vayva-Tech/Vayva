/**
 * Customer Success Dashboard Page
 * Phase 3 Implementation
 */

import { Metadata } from 'next';
import { HealthDashboard } from '@/components/health-dashboard/health-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HeartPulse,
  BookOpen,
  BarChart3,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Customer Success | Vayva Ops',
  description: 'Health scores, playbooks, and NPS management',
};

export default function CustomerSuccessPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <HeartPulse className="h-8 w-8 mr-3 text-rose-500" />
          Customer Success Platform
        </h1>
        <p className="text-gray-500 mt-2">
          Monitor merchant health, automate playbooks, and track NPS scores
        </p>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="health" className="flex items-center">
            <HeartPulse className="h-4 w-4 mr-2" />
            Health Scores
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Playbooks
          </TabsTrigger>
          <TabsTrigger value="nps" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            NPS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <HealthDashboard />
        </TabsContent>

        <TabsContent value="playbooks" className="space-y-6">
          <PlaybooksOverview />
        </TabsContent>

        <TabsContent value="nps" className="space-y-6">
          <NpsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlaybooksOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Playbooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">24</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Executions Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">156</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600">94%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Playbook Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Trial & Onboarding',
                count: 6,
                description: 'Welcome, trial ending, onboarding milestones',
              },
              {
                name: 'Health Score Based',
                count: 4,
                description: 'Critical, at-risk, declining interventions',
              },
              {
                name: 'Feature Adoption',
                count: 3,
                description: 'Low adoption, AI not used, WhatsApp not connected',
              },
              {
                name: 'Engagement',
                count: 2,
                description: 'Inactive 7 days, inactive 14 days',
              },
              {
                name: 'Business Milestones',
                count: 3,
                description: 'First order, 10th order, revenue milestones',
              },
              {
                name: 'Support & Billing',
                count: 6,
                description: 'Tickets, payment failures, cancellations',
              },
            ].map((category) => (
              <Card key={category.name} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {category.description}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    {category.count} playbooks
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NpsOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              NPS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-blue-600">+42</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">28%</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Promoters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">58%</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Detractors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-red-600">16%</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NPS Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Promoters */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-green-600">Promoters (9-10)</span>
                <span className="text-green-600">58%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: '58%' }}
                ></div>
              </div>
            </div>

            {/* Passives */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-amber-600">Passives (7-8)</span>
                <span className="text-amber-600">26%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{ width: '26%' }}
                ></div>
              </div>
            </div>

            {/* Detractors */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-red-600">Detractors (0-6)</span>
                <span className="text-red-600">16%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{ width: '16%' }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
