/**
 * Workflow Validation Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowValidator } from '../src/validation/workflow-validator.js';
import type { Workflow, WorkflowNode, WorkflowEdge } from '../src/types.js';

describe('WorkflowValidator', () => {
  let validator: WorkflowValidator;

  beforeEach(() => {
    validator = new WorkflowValidator();
  });

  const createTestWorkflow = (
    overrides: Partial<Workflow> = {}
  ): Workflow => ({
    id: 'test-workflow',
    name: 'Test Workflow',
    industry: 'fashion',
    merchantId: 'merchant_1',
    trigger: { type: 'manual', config: {} },
    nodes: [
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
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'action' },
    ],
    status: 'draft',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'test',
    ...overrides,
  });

  it('should validate a correct workflow', () => {
    const workflow = createTestWorkflow();
    const result = validator.validate(workflow);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when workflow has no name', () => {
    const workflow = createTestWorkflow({ name: '' });
    const result = validator.validate(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('should fail when workflow has no trigger node', () => {
    const workflow = createTestWorkflow({
      nodes: [
        {
          id: 'action',
          type: 'send_email',
          position: { x: 0, y: 0 },
          data: { label: 'Send Email' },
        },
      ],
    });
    const result = validator.validate(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('trigger'))).toBe(true);
  });

  it('should fail when workflow has multiple trigger nodes', () => {
    const workflow = createTestWorkflow({
      nodes: [
        {
          id: 'trigger1',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Trigger 1' },
        },
        {
          id: 'trigger2',
          type: 'trigger',
          position: { x: 100, y: 0 },
          data: { label: 'Trigger 2' },
        },
      ],
    });
    const result = validator.validate(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('more than one trigger'))).toBe(true);
  });

  it('should fail when edge references non-existent node', () => {
    const workflow = createTestWorkflow({
      edges: [
        { id: 'e1', source: 'trigger', target: 'non-existent' },
      ],
    });
    const result = validator.validate(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'edges')).toBe(true);
  });

  it('should fail when workflow has a cycle', () => {
    const workflow = createTestWorkflow({
      nodes: [
        {
          id: 'trigger',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Trigger' },
        },
        {
          id: 'node1',
          type: 'send_email',
          position: { x: 100, y: 0 },
          data: { label: 'Node 1' },
        },
        {
          id: 'node2',
          type: 'send_sms',
          position: { x: 200, y: 0 },
          data: { label: 'Node 2' },
        },
      ],
      edges: [
        { id: 'e1', source: 'trigger', target: 'node1' },
        { id: 'e2', source: 'node1', target: 'node2' },
        { id: 'e3', source: 'node2', target: 'node1' }, // Creates cycle
      ],
    });
    const result = validator.validate(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('cycle'))).toBe(true);
  });

  it('should fail when node has invalid delay format', () => {
    const workflow = createTestWorkflow({
      nodes: [
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
          data: { label: 'Delay', delay: 'invalid' },
        },
      ],
      edges: [
        { id: 'e1', source: 'trigger', target: 'delay' },
      ],
    });
    const result = validator.validate(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('delay format'))).toBe(true);
  });

  it('should warn about unreachable nodes', () => {
    const workflow = createTestWorkflow({
      nodes: [
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
        {
          id: 'unreachable',
          type: 'send_sms',
          position: { x: 200, y: 0 },
          data: { label: 'Unreachable' },
        },
      ],
      edges: [
        { id: 'e1', source: 'trigger', target: 'action' },
        // No edge to unreachable node
      ],
    });
    const result = validator.validate(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('not reachable'))).toBe(true);
  });

  it('should fail when workflow exceeds max nodes', () => {
    const nodes: WorkflowNode[] = [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Trigger' },
      },
    ];

    // Add 101 action nodes
    for (let i = 0; i < 101; i++) {
      nodes.push({
        id: `action${i}`,
        type: 'send_email',
        position: { x: i * 100, y: 0 },
        data: { label: `Action ${i}` },
      });
    }

    const workflow = createTestWorkflow({ nodes });
    const result = validator.validate(workflow);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('more than'))).toBe(true);
  });
});
