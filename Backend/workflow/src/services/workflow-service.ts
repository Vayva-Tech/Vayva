/**
 * Workflow Service
 * Business logic for workflow management
 */

import type { Workflow, WorkflowStatus, IndustrySlug } from '@vayva/workflow-engine';
import { getAllTemplates, getTemplatesByIndustry } from '@vayva/workflow-templates';

// In-memory storage for now - would be replaced with database
const workflows = new Map<string, Workflow>();

export interface ListWorkflowsOptions {
  merchantId: string;
  industry?: string;
  status?: WorkflowStatus;
}

export class WorkflowService {
  async list(options: ListWorkflowsOptions): Promise<Workflow[]> {
    const { merchantId, industry, status } = options;

    let result = Array.from(workflows.values()).filter(
      (w) => w.merchantId === merchantId
    );

    if (industry) {
      result = result.filter((w) => w.industry === industry);
    }

    if (status) {
      result = result.filter((w) => w.status === status);
    }

    return result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async get(id: string, merchantId: string): Promise<Workflow | null> {
    const workflow = workflows.get(id);
    if (!workflow || workflow.merchantId !== merchantId) {
      return null;
    }
    return workflow;
  }

  async create(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const now = new Date();
    const workflow: Workflow = {
      ...data,
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    workflows.set(workflow.id, workflow);
    return workflow;
  }

  async update(
    id: string,
    merchantId: string,
    data: Partial<Workflow>
  ): Promise<Workflow | null> {
    const existing = await this.get(id, merchantId);
    if (!existing) {
      return null;
    }

    const updated: Workflow = {
      ...existing,
      ...data,
      id: existing.id,
      merchantId: existing.merchantId,
      updatedAt: new Date(),
      version: existing.version + 1,
    };

    workflows.set(id, updated);
    return updated;
  }

  async delete(id: string, merchantId: string): Promise<boolean> {
    const existing = await this.get(id, merchantId);
    if (!existing) {
      return false;
    }

    workflows.delete(id);
    return true;
  }

  async updateStatus(
    id: string,
    merchantId: string,
    status: WorkflowStatus
  ): Promise<Workflow | null> {
    return this.update(id, merchantId, { status });
  }

  async getTemplates(industry?: string) {
    if (industry) {
      return getTemplatesByIndustry(industry as IndustrySlug);
    }
    return getAllTemplates();
  }

  // For testing purposes
  clear(): void {
    workflows.clear();
  }
}

export default WorkflowService;
