/**
 * Marketing Automation Dashboard (Industry-Adaptive)
 * Campaign workflows, personalization, and A/B testing with industry-specific metrics
 */
"use client";

import { Button } from "@vayva/ui";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Play, 
  Pause,
  Stop,
  Eye,
  Users,
  ChartBar,
  Target,
  Rocket,
  ShareNetwork,
  TrendUp,
  Wrench,
  Lightning,
  Funnel,
  Flask
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';
import { getIndustryConfig } from '@/lib/utils/industry-adaptation';
import type { IndustrySlug } from '@/lib/templates/types';

// Types
interface MarketingWorkflow {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'social';
  status: 'active' | 'paused' | 'draft' | 'completed';
  trigger: string;
  audience: number;
  conversions: number;
  revenue: number;
  lastRun: string;
  nextRun?: string;
  metrics: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
}

interface ABTest {
  id: string;
  name: string;
  type: 'subject' | 'content' | 'cta' | 'design';
  status: 'running' | 'completed' | 'scheduled';
  variants: {
    a: { name: string; performance: number };
    b: { name: string; performance: number };
  };
  winner?: 'a' | 'b';
  confidence: number;
  startDate: string;
  endDate?: string;
  audienceSize: number;
}

interface PersonalizationRule {
  id: string;
  name: string;
  type: 'behavioral' | 'demographic' | 'geographic' | 'temporal';
  condition: string;
  action: string;
  activeUsers: number;
  conversionImpact: number;
  lastModified: string;
}

interface MarketingOverview {
  totalWorkflows: number;
  activeWorkflows: number;
  totalCampaigns: number;
  avgConversionRate: number;
  totalRevenue: number;
  roi: number;
}

// Main Marketing Automation Dashboard
export default function MarketingAutomationDashboard() {
  const { store } = useStore();
  const industry = (store?.industrySlug || 'retail') as IndustrySlug;
  const industryConfig = getIndustryConfig(industry);
  const colors = getThemeColors(industry);
  const [activeTab, setActiveTab] = useState<'workflows' | 'ab-tests' | 'personalization'>('workflows');

  // Fetch marketing overview with industry-specific metrics
  const { data: overview, isLoading: overviewLoading } = useSWR<MarketingOverview>(
    `/api/marketing/automation/overview?industry=${industry}`,
    async (url: string) => {
      try {
        const response = await apiJson<MarketingOverview>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch marketing overview:', error);
        toast.error('Failed to load marketing data');
        // Return industry-adapted fallback data
        return {
          totalWorkflows: 12,
          activeWorkflows: 8,
          totalCampaigns: 24,
          avgConversionRate:
            (industryConfig as { metrics?: { conversionRate?: number } }).metrics
              ?.conversionRate ?? 3.2,
          totalRevenue: 245680,
          roi: 4.2
        };
      }
    }
  );

  // Fetch workflows
  const { data: workflows, isLoading: workflowsLoading } = useSWR<MarketingWorkflow[]>(
    '/api/marketing/automation/workflows',
    async (url: string) => {
      try {
        const response = await apiJson<{ workflows: MarketingWorkflow[] }>(url);
        return response.workflows || [];
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
        return [];
      }
    }
  );

  // Fetch A/B tests
  const { data: abTests, isLoading: testsLoading } = useSWR<ABTest[]>(
    '/api/ab-testing/active',
    async (url: string) => {
      try {
        const response = await apiJson<{ tests: ABTest[] }>(url);
        return response.tests || [];
      } catch (error) {
        console.error('Failed to fetch A/B tests:', error);
        return [];
      }
    }
  );

  // Fetch personalization rules
  const { data: personalization, isLoading: personalizationLoading } = useSWR<PersonalizationRule[]>(
    '/api/marketing/personalization/rules',
    async (url: string) => {
      try {
        const response = await apiJson<{ rules: PersonalizationRule[] }>(url);
        return response.rules || [];
      } catch (error) {
        console.error('Failed to fetch personalization rules:', error);
        return [];
      }
    }
  );

  const tabs = [
    { id: 'workflows', label: 'Automation Workflows', icon: <Lightning className="h-4 w-4" /> },
    { id: 'ab-tests', label: 'A/B Tests', icon: <Funnel className="h-4 w-4" /> },
    { id: 'personalization', label: 'Personalization', icon: <Target className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title={`${industryConfig.displayName} Marketing Automation`}
        subtitle="Automate campaigns, test variations, and personalize experiences"
        industry={industry}
        icon={<Wrench className="h-8 w-8" />}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      {!overviewLoading && overview && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={industry}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Workflows</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {overview.activeWorkflows}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Lightning className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={industry}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {overview.totalCampaigns?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <Megaphone className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={industry}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Conversion</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  {(overview.avgConversionRate ||
                    (industryConfig as { metrics?: { conversionRate?: number } }).metrics
                      ?.conversionRate ||
                    0)}
                  %
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}15` }}>
                <TrendUp className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={industry}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  ₦{(overview.totalRevenue / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <ChartBar className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={industry}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">ROI</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {overview.roi || 0}x
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <Rocket className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'workflows' && (
        <WorkflowManagement workflows={workflows || []} loading={workflowsLoading} />
      )}
      
      {activeTab === 'ab-tests' && (
        <ABTestManagement tests={abTests || []} loading={testsLoading} />
      )}
      
      {activeTab === 'personalization' && (
        <PersonalizationManagement rules={personalization || []} loading={personalizationLoading} />
      )}
    </div>
  );
}

// Workflow Management Component
function WorkflowManagement({ workflows, loading }: { workflows: MarketingWorkflow[]; loading: boolean }) {
  const { store } = useStore();
  const industry = (store?.industrySlug || 'retail') as IndustrySlug;
  const industryConfig = getIndustryConfig(industry);

  if (loading) {
    return (
      <ThemedCard industry={industry}>
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  const getTypeIcon = (type: MarketingWorkflow['type']) => {
    switch (type) {
      case 'email': return <Megaphone className="h-5 w-5 text-blue-600" />;
      case 'sms': return <ShareNetwork className="h-5 w-5 text-green-600" />;
      case 'push': return <Rocket className="h-5 w-5 text-purple-600" />;
      case 'social': return <Users className="h-5 w-5 text-orange-600" />;
      default: return <Megaphone className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: MarketingWorkflow['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ThemedCard industry={industry}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Lightning className="h-5 w-5" />
            Active Workflows
          </h3>
          <Button className="px-3 py-1 text-sm border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
            Create Workflow
          </Button>
        </div>
        
        <div className="space-y-4">
          {workflows.filter(w => w.status === 'active').map((workflow, index) => (
            <motion.div
              key={workflow.id}
              className="p-4 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getTypeIcon(workflow.type)}
                  <div>
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-gray-500">Trigger: {workflow.trigger}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Audience</p>
                  <p className="font-medium">{workflow.audience?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Conversions</p>
                  <p className="font-medium">{workflow.conversions?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Revenue</p>
                  <p className="font-medium">₦{(workflow.revenue || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Open Rate</p>
                  <p className="font-medium">{workflow.metrics?.openRate || 0}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Click Rate</p>
                  <p className="font-medium">{workflow.metrics?.clickRate || 0}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Conversion</p>
                  <p className="font-medium">{workflow.metrics?.conversionRate || 0}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ThemedCard>

      <ThemedCard industry={industry}>
        <h3 className="font-semibold mb-6">Performance Overview</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Workflow Performance</h4>
            <div className="space-y-3">
              {workflows.slice(0, 3).map((workflow, index) => (
                <div key={workflow.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(workflow.type)}
                    <span className="text-sm">{workflow.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">₦{(workflow.revenue || 0).toLocaleString()}</span>
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (workflow.revenue || 0) / Math.max(...workflows.map(w => w.revenue || 0)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Trigger Types</h4>
            <div className="space-y-2">
              {['Purchase', 'Signup', 'Browse', 'Abandon'].map((trigger, index) => (
                <div key={trigger} className="flex justify-between items-center">
                  <span className="text-sm">{trigger}</span>
                  <span className="text-sm text-gray-500">{Math.floor(Math.random() * 50) + 10} workflows</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ThemedCard>
    </div>
  );
}

// A/B Test Management Component
function ABTestManagement({ tests, loading }: { tests: ABTest[]; loading: boolean }) {
  const { store } = useStore();
  const industry = store?.industrySlug || 'retail';

  if (loading) {
    return (
      <ThemedCard industry={industry}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ThemedCard industry={industry}>
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Funnel className="h-5 w-5" />
          Active A/B Tests
        </h3>
        
        <div className="space-y-4">
          {tests.filter(t => t.status === 'running').map((test, index) => (
            <motion.div
              key={test.id}
              className="p-4 border border-gray-100 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium">{test.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.confidence >= 95 ? 'bg-green-100 text-green-800' :
                  test.confidence >= 90 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {test.confidence}% confidence
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Variant A</p>
                  <p className="text-2xl font-bold text-blue-600">{test.variants.a.performance}%</p>
                  <p className="text-xs text-gray-500">{test.variants.a.name}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium">Variant B</p>
                  <p className="text-2xl font-bold text-purple-600">{test.variants.b.performance}%</p>
                  <p className="text-xs text-gray-500">{test.variants.b.name}</p>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Audience: {test.audienceSize?.toLocaleString() || '0'}</span>
                <span>Ends: {test.endDate ? new Date(test.endDate).toLocaleDateString() : 'Ongoing'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </ThemedCard>

      <ThemedCard industry={industry}>
        <h3 className="font-semibold mb-6">Test Results</h3>
        <div className="space-y-4">
          {tests.filter(t => t.status === 'completed').map((test, index) => (
            <div key={test.id} className="p-4 border border-gray-100 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">{test.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.winner === 'a' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  Winner: Variant {test.winner?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Confidence: {test.confidence}%</span>
                <span>Completed: {new Date(test.endDate || '').toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );
}

// Personalization Management Component
function PersonalizationManagement({ rules, loading }: { rules: PersonalizationRule[]; loading: boolean }) {
  const { store } = useStore();
  const industry = store?.industrySlug || 'retail';

  if (loading) {
    return (
      <ThemedCard industry={industry}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ThemedCard industry={industry}>
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Personalization Rules
        </h3>
        
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              className="p-4 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{rule.name}</h4>
                <span className="text-xs text-gray-500 capitalize">{rule.type}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{rule.condition}</p>
              <div className="flex justify-between text-xs">
                <span>{rule.activeUsers?.toLocaleString() || '0'} users</span>
                <span>+{rule.conversionImpact || 0}% impact</span>
              </div>
            </motion.div>
          ))}
        </div>
      </ThemedCard>

      <ThemedCard industry={industry}>
        <h3 className="font-semibold mb-6">Rule Performance</h3>
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div key={rule.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{rule.name}</span>
                <span className="text-sm font-medium">+{rule.conversionImpact || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, rule.conversionImpact || 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </ThemedCard>

      <ThemedCard industry={industry}>
        <h3 className="font-semibold mb-6">Quick Actions</h3>
        <div className="space-y-3">
          <Button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <Target className="h-5 w-5 text-green-500" />
            <span className="font-medium">Create New Rule</span>
          </Button>
          <Button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <Funnel className="h-5 w-5 text-green-500" />
            <span className="font-medium">Setup A/B Test</span>
          </Button>
          <Button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <Lightning className="h-5 w-5 text-green-500" />
            <span className="font-medium">New Automation</span>
          </Button>
        </div>
      </ThemedCard>
    </div>
  );
}