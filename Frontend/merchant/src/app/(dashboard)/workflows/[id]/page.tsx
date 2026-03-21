// @ts-nocheck
/**
 * Workflow Editor Page
 * Edit an existing workflow using the visual builder
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Play, Loader2 } from 'lucide-react';
import type { Workflow, IndustrySlug } from '@vayva/workflow-engine';
import { WorkflowBuilderPlaceholder } from '@/components/workflow/WorkflowBuilderPlaceholder';

// Mock workflow data - replace with actual API call
const mockWorkflows: Record<string, Workflow> = {
  wf_1: {
    id: 'wf_1',
    name: 'Auto-Reorder Low Sizes',
    description: 'Automatically create PO when size stock drops below threshold',
    industry: 'fashion',
    merchantId: 'merchant_1',
    trigger: { 
      type: 'inventory_low', 
      config: { thresholdType: 'size_specific', minQuantity: 5 } 
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Size Stock < 5', triggerType: 'inventory_low' },
      },
      {
        id: 'check-season',
        type: 'condition',
        position: { x: 350, y: 100 },
        data: {
          label: 'Is Current Season?',
          condition: 'product.season == currentSeason',
          field: 'product.season',
          operator: 'equals',
          value: 'currentSeason',
        },
      },
      {
        id: 'create-po',
        type: 'create_purchase_order',
        position: { x: 650, y: 50 },
        data: {
          label: 'Create PO',
          quantity: 'reorder_point * 2',
          vendor: 'product.preferred_vendor',
        },
      },
      {
        id: 'notify-buyer',
        type: 'send_email',
        position: { x: 650, y: 150 },
        data: {
          label: 'Notify Buyer',
          template: 'low-stock-alert',
          to: 'buyer@store.com',
        },
      },
    ],
    edges: [
      { 
        id: 'e1', 
        source: 'trigger', 
        target: 'check-season',
      },
      { 
        id: 'e2', 
        source: 'check-season', 
        target: 'create-po', 
        condition: { type: 'true' } 
      },
      { 
        id: 'e3', 
        source: 'check-season', 
        target: 'notify-buyer', 
        condition: { type: 'false' } 
      },
    ],
    status: 'active',
    version: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'user_1',
  },
};

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const loadWorkflow = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const loadedWorkflow = mockWorkflows[workflowId];
        if (!loadedWorkflow) {
          setError('Workflow not found');
          return;
        }
        
        setWorkflow(loadedWorkflow);
      } catch (err) {
        setError('Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [workflowId]);

  const handleSave = async (updatedWorkflow: Workflow) => {
    setIsSaving(true);
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Update local state
      setWorkflow(updatedWorkflow);
      
      // Show success message (you could use a toast here)
      console.log('Workflow saved successfully');
    } catch (err) {
      console.error('Failed to save workflow:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (workflowToTest: Workflow) => {
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log('Workflow tested successfully');
      // Show test results modal or notification
    } catch (err) {
      console.error('Failed to test workflow:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Workflow not found'}</h1>
        <button
          onClick={() => router.push('/workflows')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workflows
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/workflows')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{workflow.name}</h1>
            <p className="text-sm text-gray-500">{workflow.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${workflow.status === 'active' ? 'bg-green-100 text-green-700' : ''}
            ${workflow.status === 'draft' ? 'bg-gray-100 text-gray-700' : ''}
            ${workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : ''}
          `}>
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Workflow Builder */}
      <div className="flex-1 overflow-hidden">
        <WorkflowBuilder
          workflow={workflow}
          industry={workflow.industry as IndustrySlug}
          onSave={handleSave}
          onTest={handleTest}
        />
      </div>
    </div>
  );
}
