// @ts-nocheck
/**
 * Workflow Automation Dashboard
 * Visual workflow builder, template library, and execution monitoring
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shuffle, 
  Play,
  Pause,
  Stop,
  Eye,
  Copy,
  Trash,
  Plus,
  ArrowRight,
  Timer,
  Users,
  ShoppingCart,
  Envelope,
  Lightning,
  Gear,
  ChartLine
} from '@phosphor-icons/react';
import { useSWR } from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  position: { x: number; y: number };
  config: any;
  connections: string[];
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  nodes: WorkflowNode[];
  connections: { from: string; to: string }[];
  createdAt: string;
  lastModified: string;
  executionCount: number;
  successRate: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  category: 'marketing' | 'sales' | 'operations' | 'customer-service';
  description: string;
  preview: string;
  usageCount: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration: number;
  triggeredBy: string;
  results: {
    actionsExecuted: number;
    errors: number;
    dataProcessed: number;
  };
}

// Main Workflow Automation Dashboard
export default function WorkflowAutomationDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'monitor'>('builder');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);

  // Fetch workflows
  const { data: workflows, isLoading: workflowsLoading } = useSWR<WorkflowDefinition[]>(
    '/api/workflow/definitions',
    async (url: string) => {
      try {
        const response = await apiJson<{ workflows: WorkflowDefinition[] }>(url);
        return response.workflows || [];
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
        return [];
      }
    }
  );

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useSWR<WorkflowTemplate[]>(
    '/api/workflow/templates',
    async (url: string) => {
      try {
        const response = await apiJson<{ templates: WorkflowTemplate[] }>(url);
        return response.templates || [];
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        return [];
      }
    }
  );

  // Fetch executions
  const { data: executions, isLoading: executionsLoading } = useSWR<WorkflowExecution[]>(
    '/api/workflow/executions',
    async (url: string) => {
      try {
        const response = await apiJson<{ executions: WorkflowExecution[] }>(url);
        return response.executions || [];
      } catch (error) {
        console.error('Failed to fetch executions:', error);
        return [];
      }
    }
  );

  const tabs = [
    { id: 'builder', label: 'Workflow Builder', icon: <Shuffle className="h-4 w-4" /> },
    { id: 'templates', label: 'Templates', icon: <Copy className="h-4 w-4" /> },
    { id: 'monitor', label: 'Execution Monitor', icon: <ChartLine className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Workflow Automation"
        subtitle="Build automated workflows, use templates, and monitor executions"
        industry={store?.industrySlug || 'default'}
        icon={<Lightning className="h-8 w-8" />}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
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
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'builder' && (
        <WorkflowBuilder 
          workflows={workflows || []}
          loading={workflowsLoading}
          selectedWorkflow={selectedWorkflow}
          onSelectWorkflow={setSelectedWorkflow}
        />
      )}
      
      {activeTab === 'templates' && (
        <TemplateLibrary 
          templates={templates || []}
          loading={templatesLoading}
        />
      )}
      
      {activeTab === 'monitor' && (
        <ExecutionMonitor 
          executions={executions || []}
          loading={executionsLoading}
        />
      )}
    </div>
  );
}

// Workflow Builder Component
function WorkflowBuilder({ 
  workflows, 
  loading, 
  selectedWorkflow,
  onSelectWorkflow
}: any) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="lg:col-span-3">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Workflow List */}
      <div className="lg:col-span-1 space-y-4">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Workflows</h3>
            <button className="p-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {workflows.map((workflow: WorkflowDefinition) => (
              <div
                key={workflow.id}
                onClick={() => onSelectWorkflow(workflow)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedWorkflow?.id === workflow.id
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-gray-100 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{workflow.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                    workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {workflow.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{workflow.executionCount} runs</span>
                  <span>{workflow.successRate}% success</span>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>

        {/* Quick Actions */}
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors">
              <Play className="h-4 w-4 text-green-600" />
              Start Selected
            </button>
            <button className="w-full flex items-center gap-2 p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors">
              <Pause className="h-4 w-4 text-yellow-600" />
              Pause Selected
            </button>
            <button className="w-full flex items-center gap-2 p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors">
              <Copy className="h-4 w-4 text-blue-600" />
              Duplicate
            </button>
            <button className="w-full flex items-center gap-2 p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-red-600">
              <Trash className="h-4 w-4" />
              Delete
            </button>
          </div>
        </ThemedCard>
      </div>

      {/* Workflow Canvas */}
      <div className="lg:col-span-3">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">
                {selectedWorkflow ? selectedWorkflow.name : 'Select a workflow to edit'}
              </h3>
              {selectedWorkflow && (
                <p className="text-sm text-gray-500 mt-1">
                  {selectedWorkflow.description}
                </p>
              )}
            </div>
            
            {selectedWorkflow && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                  <Play className="h-4 w-4" />
                  Run Workflow
                </button>
                <button className="px-4 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Visual Workflow Builder */}
          <div className="h-96 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-dashed border-gray-100 relative overflow-hidden">
            {selectedWorkflow ? (
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {/* Trigger Node */}
                  <div className="p-4 bg-blue-500 text-white rounded-lg shadow-lg">
                    <Lightning className="h-6 w-6 mx-auto" />
                    <p className="text-xs mt-2 text-center">Trigger</p>
                  </div>
                  
                  <ArrowRight className="h-5 w-5 text-gray-500" />
                  
                  {/* Action Nodes */}
                  <div className="flex gap-4">
                    {selectedWorkflow.nodes.slice(0, 3).map((node: WorkflowNode, index: number) => (
                      <div key={node.id} className="relative">
                        <div className={`p-4 rounded-lg shadow-lg ${
                          node.type === 'action' ? 'bg-green-500 text-white' :
                          node.type === 'condition' ? 'bg-yellow-500 text-white' :
                          'bg-purple-500 text-white'
                        }`}>
                          {node.type === 'action' && <Gear className="h-6 w-6 mx-auto" />}
                          {node.type === 'condition' && <Eye className="h-6 w-6 mx-auto" />}
                          {node.type === 'delay' && <Timer className="h-6 w-6 mx-auto" />}
                          <p className="text-xs mt-2 text-center">{node.name}</p>
                        </div>
                        
                        {index < 2 && (
                          <ArrowRight className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center text-gray-500">
                  <p className="font-medium">Workflow Visualization</p>
                  <p className="text-sm mt-1">Drag and drop nodes to build your automation</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Shuffle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Select a workflow from the list to start building</p>
                </div>
              </div>
            )}
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}

// Template Library Component
function TemplateLibrary({ templates, loading }: { templates: WorkflowTemplate[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing': return <Envelope className="h-5 w-5 text-blue-600" />;
      case 'sales': return <ShoppingCart className="h-5 w-5 text-green-600" />;
      case 'operations': return <Gear className="h-5 w-5 text-purple-600" />;
      case 'customer-service': return <Users className="h-5 w-5 text-orange-600" />;
      default: return <Lightning className="h-5 w-5 text-gray-600" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(template.category)}
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                  {template.category.replace('-', ' ')}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(template.complexity)}`}>
                {template.complexity}
              </span>
            </div>
            
            <h3 className="font-semibold mb-2">{template.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{template.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>{template.usageCount?.toLocaleString() || '0'} uses</span>
              <span>Preview: {template.preview}</span>
            </div>
            
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
              Use Template
            </button>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Execution Monitor Component
function ExecutionMonitor({ executions, loading }: { executions: WorkflowExecution[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ThemedCard industry={store?.industrySlug || 'default'}>
      <h3 className="font-semibold mb-6">Recent Executions</h3>
      
      <div className="space-y-4">
        {executions.map((execution, index) => (
          <motion.div
            key={execution.id}
            className="p-4 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">{execution.workflowName}</h4>
                <p className="text-sm text-gray-500">
                  Triggered by: {execution.triggeredBy}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(execution.status)}`}>
                {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <p className="text-gray-500">Start Time</p>
                <p className="font-medium">{new Date(execution.startTime).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">{execution.duration}s</p>
              </div>
              <div>
                <p className="text-gray-500">Actions</p>
                <p className="font-medium">{execution.results.actionsExecuted}</p>
              </div>
              <div>
                <p className="text-gray-500">Errors</p>
                <p className={execution.results.errors > 0 ? 'font-medium text-red-600' : 'font-medium'}>
                  {execution.results.errors}
                </p>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(execution.results.actionsExecuted / Math.max(execution.results.actionsExecuted, 1)) * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </ThemedCard>
  );
}