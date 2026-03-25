/**
 * Execution Service
 * Handles workflow execution
 */

import { type WorkflowExecution, getDefaultExecutor } from '@vayva/workflow-engine';
import { WorkflowService } from './workflow-service.js';

const executions = new Map<string, WorkflowExecution>();
const workflowService = new WorkflowService();

export interface ExecuteOptions {
  workflowId: string;
  merchantId: string;
  triggerData: Record<string, unknown>;
  testMode?: boolean;
}

export interface HistoryOptions {
  limit: number;
  offset: number;
}

export class ExecutionService {
  private executor = getDefaultExecutor();

  async execute(options: ExecuteOptions): Promise<WorkflowExecution> {
    const { workflowId, merchantId, triggerData, testMode = false } = options;

    // Get workflow
    const workflow = await workflowService.get(workflowId, merchantId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.status !== 'active' && !testMode) {
      throw new Error('Workflow is not active');
    }

    // Create execution record
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Execute workflow
    const execution = await this.executor.execute(
      workflow,
      triggerData,
      executionId
    );

    // Store execution
    executions.set(executionId, execution);

    return execution;
  }

  async get(executionId: string, merchantId: string): Promise<WorkflowExecution | null> {
    const execution = executions.get(executionId);
    if (!execution || execution.merchantId !== merchantId) {
      return null;
    }
    return execution;
  }

  async getHistory(
    workflowId: string,
    merchantId: string,
    options: HistoryOptions
  ): Promise<WorkflowExecution[]> {
    const { limit, offset } = options;

    const result = Array.from(executions.values())
      .filter((e) => e.workflowId === workflowId && e.merchantId === merchantId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(offset, offset + limit);

    return result;
  }

  async cancel(executionId: string, merchantId: string): Promise<boolean> {
    const execution = await this.get(executionId, merchantId);
    if (!execution) {
      return false;
    }

    if (execution.status === 'running') {
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      executions.set(executionId, execution);
    }

    return true;
  }

  // For testing purposes
  clear(): void {
    executions.clear();
  }
}

export default ExecutionService;
