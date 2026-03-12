/**
 * Workflow Executor Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowExecutor, createDefaultNodeExecutors } from '../src/engine/executor.js';
import type { Workflow, WorkflowNode, WorkflowEdge } from '../src/types.js';

describe('WorkflowExecutor', () => {
  let executor: WorkflowExecutor;

  beforeEach(() => {
    executor = new WorkflowExecutor();
    const executors = createDefaultNodeExecutors();
    executors.forEach((exec, type) => {
      executor.registerNodeExecutor(type, exec);
    });
  });

  const createTestWorkflow = (
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Workflow => ({
    id: 'test-workflow',
    name: 'Test Workflow',
    industry: 'fashion',
    merchantId: 'merchant_1',
    trigger: { type: 'manual', config: {} },
    nodes,
    edges,
    status: 'active',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'test',
  });

  it('should execute a simple linear workflow', async () => {
    const nodes: WorkflowNode[] = [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Trigger' },
      },
      {
        id: 'action1',
        type: 'send_email',
        position: { x: 100, y: 0 },
        data: { label: 'Send Email', to: 'test@example.com' },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: 'e1', source: 'trigger', target: 'action1' },
    ];

    const workflow = createTestWorkflow(nodes, edges);
    const execution = await executor.execute(workflow, { test: true }, 'exec_1');

    expect(execution.status).toBe('completed');
    expect(execution.results).toHaveLength(2);
    expect(execution.results[0].nodeId).toBe('trigger');
    expect(execution.results[1].nodeId).toBe('action1');
  });

  it('should execute a workflow with conditions', async () => {
    const nodes: WorkflowNode[] = [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Trigger' },
      },
      {
        id: 'condition',
        type: 'condition',
        position: { x: 100, y: 0 },
        data: { label: 'Check Value', field: 'value', operator: 'equals', value: 'test' },
      },
      {
        id: 'action1',
        type: 'send_email',
        position: { x: 300, y: -50 },
        data: { label: 'Send Email (True)' },
      },
      {
        id: 'action2',
        type: 'send_sms',
        position: { x: 300, y: 50 },
        data: { label: 'Send SMS (False)' },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: 'e1', source: 'trigger', target: 'condition' },
      { id: 'e2', source: 'condition', target: 'action1', condition: { type: 'true' } },
      { id: 'e3', source: 'condition', target: 'action2', condition: { type: 'false' } },
    ];

    const workflow = createTestWorkflow(nodes, edges);
    const execution = await executor.execute(workflow, { value: 'test' }, 'exec_1');

    expect(execution.status).toBe('completed');
    expect(execution.results.some((r) => r.nodeId === 'action1')).toBe(true);
  });

  it('should handle delay nodes', async () => {
    const nodes: WorkflowNode[] = [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Trigger' },
      },
      {
        id: 'delay',
        type: 'delay',
        position: { x: 100, y: 0 },
        data: { label: 'Wait', delay: '100ms', delayType: 'fixed' },
      },
      {
        id: 'action',
        type: 'send_email',
        position: { x: 200, y: 0 },
        data: { label: 'Send Email' },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: 'e1', source: 'trigger', target: 'delay' },
      { id: 'e2', source: 'delay', target: 'action' },
    ];

    const workflow = createTestWorkflow(nodes, edges);
    const startTime = Date.now();
    const execution = await executor.execute(workflow, {}, 'exec_1');
    const endTime = Date.now();

    expect(execution.status).toBe('completed');
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });

  it('should fail when workflow has no trigger node', async () => {
    const nodes: WorkflowNode[] = [
      {
        id: 'action',
        type: 'send_email',
        position: { x: 0, y: 0 },
        data: { label: 'Send Email' },
      },
    ];

    const workflow = createTestWorkflow(nodes, []);
    const execution = await executor.execute(workflow, {}, 'exec_1');

    expect(execution.status).toBe('failed');
    expect(execution.error).toContain('trigger');
  });

  it('should store variables between nodes', async () => {
    const nodes: WorkflowNode[] = [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Trigger' },
      },
      {
        id: 'action',
        type: 'send_email',
        position: { x: 100, y: 0 },
        data: { label: 'Send Email' },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: 'e1', source: 'trigger', target: 'action' },
    ];

    const workflow = createTestWorkflow(nodes, edges);
    const triggerData = { orderId: '123', customerEmail: 'test@example.com' };
    await executor.execute(workflow, triggerData, 'exec_1');

    const context = executor.getExecutionContext();
    expect(context).not.toBeNull();
    expect(context!.variables.get('trigger')).toEqual(triggerData);
  });
});
