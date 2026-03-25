/**
 * Workflows List Page
 * Displays all workflows for the merchant
 */
'use client';

import { Button } from "@vayva/ui";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiJson } from '@/lib/api-client-shared';
import {
  Plus,
  Play,
  Pause,
  Edit3,
  Trash2,
  Copy,
  Workflow as WorkflowIcon,
  Search,
  Filter,
} from 'lucide-react';
import type { Workflow, WorkflowStatus } from '@vayva/workflow-engine';

interface WorkflowListItem extends Workflow {
  executionCount?: number;
  lastExecutedAt?: Date;
}

function parseWorkflowListItem(raw: unknown): WorkflowListItem {
  const o = raw as Record<string, unknown>;
  return {
    ...(o as unknown as WorkflowListItem),
    createdAt: new Date(String(o.createdAt ?? Date.now())),
    updatedAt: new Date(String(o.updatedAt ?? Date.now())),
    lastExecutedAt: o.lastExecutedAt
      ? new Date(String(o.lastExecutedAt))
      : undefined,
  };
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');

  const loadWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiJson<{ workflows?: unknown[] }>('/api/workflows');
      const list = res.workflows ?? [];
      setWorkflows(list.map(parseWorkflowListItem));
    } catch {
      toast.error('Failed to load workflows');
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkflows();
  }, [loadWorkflows]);

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setWorkflows((prev) => prev.filter((w) => w.id !== id));
        toast.success('Workflow deleted');
      } else {
        throw new Error('Failed to delete workflow');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Could not delete workflow');
      alert('Failed to delete workflow. Please try again.');
    }
  };

  const handleDuplicate = async (workflow: WorkflowListItem) => {
    const duplicated: WorkflowListItem = {
      ...workflow,
      id: `wf_${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      status: 'draft',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      lastExecutedAt: undefined,
    };
    setWorkflows([...workflows, duplicated]);
  };

  const handleToggleStatus = async (id: string, currentStatus: WorkflowStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setWorkflows(workflows.map((w) => 
      w.id === id ? { ...w, status: newStatus } : w
    ));
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">Automate your business processes with visual workflows</p>
        </div>
        <Link
          href="/workflows/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Workflow
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | 'all')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Workflows List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-16">
          <WorkflowIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first workflow</p>
          <Link
            href="/workflows/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Workflow
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Executions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/workflows/${workflow.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {workflow.name}
                      </Link>
                      <p className="text-sm text-gray-500">{workflow.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{workflow.industry}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(workflow.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {workflow.executionCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {workflow.lastExecutedAt 
                      ? new Date(workflow.lastExecutedAt).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleToggleStatus(workflow.id, workflow.status)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {workflow.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Link
                        href={`/workflows/${workflow.id}`}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <Button
                        onClick={() => handleDuplicate(workflow)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(workflow.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
