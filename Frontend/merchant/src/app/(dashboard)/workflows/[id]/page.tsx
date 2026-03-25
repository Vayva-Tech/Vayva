/**
 * Workflow Editor Page
 * Edit an existing workflow using the visual builder
 */
'use client';

import { Button } from "@vayva/ui";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Workflow } from '@vayva/workflow-engine';
import { WorkflowBuilderPlaceholder } from '@/components/workflow/WorkflowBuilderPlaceholder';
import { apiJson } from '@/lib/api-client-shared';

function parseWorkflow(raw: unknown): Workflow {
  const o = raw as Record<string, unknown>;
  return {
    ...(o as unknown as Workflow),
    createdAt: new Date(String(o.createdAt ?? Date.now())),
    updatedAt: new Date(String(o.updatedAt ?? Date.now())),
  };
}

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const workflowId =
    typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId) {
        setError('Invalid workflow');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await apiJson<{ workflow?: unknown }>(
          `/api/workflows/${encodeURIComponent(workflowId)}`,
        );
        const w = res.workflow;
        if (!w) {
          setError('Workflow not found');
          return;
        }
        setWorkflow(parseWorkflow(w));
      } catch {
        setError('Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    };

    void loadWorkflow();
  }, [workflowId]);

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
        <Button
          onClick={() => router.push('/workflows')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workflows
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/workflows')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
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
      <div className="flex-1 overflow-hidden p-4">
        <WorkflowBuilderPlaceholder />
      </div>
    </div>
  );
}
