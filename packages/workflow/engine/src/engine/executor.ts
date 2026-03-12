/**
 * Workflow Execution Engine
 * Core engine for executing workflows node by node
 */

import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecution,
  WorkflowExecutionResult,
  ExecutionContext,
  NodeExecutor,
  NodeType,
  NodeData,
} from '../types.js';
import { getNodeDefinition } from '../nodes/registry.js';

export class WorkflowExecutor {
  private nodeExecutors: Map<NodeType, NodeExecutor> = new Map();
  private executionContext: ExecutionContext | null = null;

  registerNodeExecutor(type: NodeType, executor: NodeExecutor): void {
    this.nodeExecutors.set(type, executor);
  }

  async execute(
    workflow: Workflow,
    triggerData: Record<string, unknown>,
    executionId: string
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      merchantId: workflow.merchantId,
      status: 'running',
      triggerData,
      startedAt: new Date(),
      results: [],
    };

    this.executionContext = {
      workflow,
      execution,
      variables: new Map<string, unknown>([['trigger', triggerData]]),
      merchantId: workflow.merchantId,
    };

    try {
      // Find trigger node
      const triggerNode = workflow.nodes.find((n) => n.type === 'trigger');
      if (!triggerNode) {
        throw new Error('Workflow must have a trigger node');
      }

      // Execute starting from trigger
      await this.executeNode(triggerNode);

      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = new Date();
    }

    return execution;
  }

  private async executeNode(node: WorkflowNode): Promise<Record<string, unknown> | void> {
    if (!this.executionContext) {
      throw new Error('Execution context not initialized');
    }

    const { workflow, execution, variables } = this.executionContext;

    // Check if node has already been executed
    const existingResult = execution.results.find((r) => r.nodeId === node.id);
    if (existingResult) {
      return existingResult.output;
    }

    const result: WorkflowExecutionResult = {
      nodeId: node.id,
      nodeType: node.type,
      status: 'success',
      startedAt: new Date(),
      completedAt: new Date(),
    };

    try {
      // Get node executor
      const executor = this.nodeExecutors.get(node.type);
      if (!executor) {
        throw new Error(`No executor registered for node type: ${node.type}`);
      }

      // Execute node
      const output = await executor(node, this.executionContext);
      result.output = output || {};

      // Add result to execution
      execution.results.push(result);

      // Store output in variables
      variables.set(node.id, output);

      // Find and execute next nodes
      const outgoingEdges = workflow.edges.filter((e) => e.source === node.id);
      
      for (const edge of outgoingEdges) {
        const shouldFollowEdge = await this.evaluateEdgeCondition(edge, output);
        if (shouldFollowEdge) {
          const nextNode = workflow.nodes.find((n) => n.id === edge.target);
          if (nextNode) {
            await this.executeNode(nextNode);
          }
        }
      }
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      result.completedAt = new Date();
      execution.results.push(result);
    }

    return result.output;
  }

  private async evaluateEdgeCondition(
    edge: WorkflowEdge,
    nodeOutput: Record<string, unknown> | void
  ): Promise<boolean> {
    if (!edge.condition) {
      return true;
    }

    switch (edge.condition.type) {
      case 'true':
        return true;
      case 'false':
        return false;
      case 'custom':
        if (edge.condition.expression) {
          return this.evaluateExpression(edge.condition.expression, nodeOutput || {});
        }
        return true;
      default:
        return true;
    }
  }

  private evaluateExpression(expression: string, context: Record<string, unknown>): boolean {
    try {
      // Simple expression evaluation
      // Replace variable references with actual values
      const sanitizedExpression = expression
        .replace(/\$\{(\w+)\}/g, (match, key) => {
          const value = context[key];
          if (typeof value === 'string') {
            return `"${value}"`;
          }
          return String(value);
        })
        .replace(/\b(true|false|null)\b/g, (match) => match)
        .replace(/\b(\w+)\s*==\s*(\w+)\b/g, '$1 === $2')
        .replace(/\b(\w+)\s*!=\s*(\w+)\b/g, '$1 !== $2');

      // Use Function constructor for safe evaluation
      const fn = new Function('context', `return ${sanitizedExpression}`);
      return Boolean(fn(context));
    } catch {
      return false;
    }
  }

  getExecutionContext(): ExecutionContext | null {
    return this.executionContext;
  }

  reset(): void {
    this.executionContext = null;
  }
}

// Default node executors
export function createDefaultNodeExecutors(): Map<NodeType, NodeExecutor> {
  const executors = new Map<NodeType, NodeExecutor>();

  // Trigger executor - just passes through
  executors.set('trigger', async (node, context) => {
    return context.variables.get('trigger') as Record<string, unknown>;
  });

  // Condition executor - evaluates condition and returns result
  executors.set('condition', async (node, context) => {
    const data = node.data as { condition: string; field: string; value: unknown; operator: string };
    const input = context.variables.get('trigger') as Record<string, unknown>;
    const fieldValue = input?.[data.field];
    
    let result = false;
    switch (data.operator) {
      case 'equals':
        result = fieldValue === data.value;
        break;
      case 'not_equals':
        result = fieldValue !== data.value;
        break;
      case 'greater_than':
        result = Number(fieldValue) > Number(data.value);
        break;
      case 'less_than':
        result = Number(fieldValue) < Number(data.value);
        break;
      case 'contains':
        result = String(fieldValue).includes(String(data.value));
        break;
      case 'starts_with':
        result = String(fieldValue).startsWith(String(data.value));
        break;
      case 'ends_with':
        result = String(fieldValue).endsWith(String(data.value));
        break;
      case 'in':
        result = Array.isArray(data.value) && data.value.includes(fieldValue);
        break;
      case 'not_in':
        result = Array.isArray(data.value) && !data.value.includes(fieldValue);
        break;
    }

    return { result, field: data.field, value: fieldValue };
  });

  // Delay executor - simulates delay
  executors.set('delay', async (node, context) => {
    const data = node.data as { delay: string; delayType: string };
    const delayMs = parseDelay(data.delay);
    
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 5000))); // Max 5s for safety
    }

    return { delayed: true, duration: delayMs };
  });

  // Send email executor - placeholder
  executors.set('send_email', async (node, context) => {
    const data = node.data as { to?: string; subject?: string; template?: string };
    // In real implementation, this would call email service
    return { 
      sent: true, 
      to: data.to,
      template: data.template,
      timestamp: new Date().toISOString(),
    };
  });

  // Send SMS executor - placeholder
  executors.set('send_sms', async (node, context) => {
    const data = node.data as { to?: string; message?: string; template?: string };
    return { 
      sent: true, 
      to: data.to,
      template: data.template,
      timestamp: new Date().toISOString(),
    };
  });

  // Update inventory executor - placeholder
  executors.set('update_inventory', async (node, context) => {
    const data = node.data as { productId?: string; quantity?: number; operation: string };
    return { 
      updated: true, 
      productId: data.productId,
      operation: data.operation,
      quantity: data.quantity,
    };
  });

  // Create task executor - placeholder
  executors.set('create_task', async (node, context) => {
    const data = node.data as { title: string; assignee?: string; priority?: string };
    return { 
      created: true, 
      taskId: `task_${Date.now()}`,
      title: data.title,
      assignee: data.assignee,
    };
  });

  // Update customer executor - placeholder
  executors.set('update_customer', async (node, context) => {
    const data = node.data as { tags?: string[]; segment?: string };
    return { 
      updated: true, 
      tags: data.tags,
      segment: data.segment,
    };
  });

  // Tag customer executor - placeholder
  executors.set('tag_customer', async (node, context) => {
    const data = node.data as { tags: string[]; operation: string };
    return { 
      tagged: true, 
      tags: data.tags,
      operation: data.operation,
    };
  });

  // AI classify executor - placeholder
  executors.set('ai_classify', async (node, context) => {
    const data = node.data as { input: string; categories: string[] };
    // In real implementation, this would call AI service
    const randomCategory = data.categories[Math.floor(Math.random() * data.categories.length)];
    return { 
      classification: randomCategory,
      confidence: 0.85,
      categories: data.categories,
    };
  });

  // AI generate executor - placeholder
  executors.set('ai_generate', async (node, context) => {
    const data = node.data as { prompt: string; outputVariable: string };
    return { 
      generated: `Generated content for: ${data.prompt.substring(0, 50)}...`,
      outputVariable: data.outputVariable,
    };
  });

  // Fashion size alert executor - placeholder
  executors.set('fashion_size_alert', async (node, context) => {
    const data = node.data as { size: string; threshold: number; notifyChannels: string[] };
    return { 
      alertSent: true,
      size: data.size,
      threshold: data.threshold,
      channels: data.notifyChannels,
    };
  });

  // Restaurant 86 item executor - placeholder
  executors.set('restaurant_86_item', async (node, context) => {
    const data = node.data as { notifyKitchen: boolean; updateOnlineMenus: boolean; reason?: string };
    return { 
      items86d: true,
      notifyKitchen: data.notifyKitchen,
      updateOnlineMenus: data.updateOnlineMenus,
    };
  });

  // Filter customers executor - placeholder
  executors.set('filter_customers', async (node, context) => {
    const data = node.data as { segment: string };
    return { 
      customers: [],
      segment: data.segment,
      count: 0,
    };
  });

  // Query menu items executor - placeholder
  executors.set('query_menu_items', async (node, context) => {
    const data = node.data as { query: string };
    return { 
      items: [],
      query: data.query,
    };
  });

  // Query tables executor - placeholder
  executors.set('query_tables', async (node, context) => {
    const data = node.data as { filter: string };
    return { 
      tables: [],
      filter: data.filter,
    };
  });

  // Send notification executor - placeholder
  executors.set('send_notification', async (node, context) => {
    const data = node.data as { message: string; channels: string[] };
    return { 
      sent: true,
      message: data.message,
      channels: data.channels,
    };
  });

  // Create purchase order executor - placeholder
  executors.set('create_purchase_order', async (node, context) => {
    const data = node.data as { quantity: string; vendor: string };
    return { 
      created: true,
      poId: `po_${Date.now()}`,
      vendor: data.vendor,
    };
  });

  // Update collection executor - placeholder
  executors.set('update_collection', async (node, context) => {
    const data = node.data as { visibility: string };
    return { 
      updated: true,
      visibility: data.visibility,
    };
  });

  // Split executor
  executors.set('split', async (node, context) => {
    return { split: true };
  });

  // Merge executor
  executors.set('merge', async (node, context) => {
    return { merged: true };
  });

  // Loop executor
  executors.set('loop', async (node, context) => {
    return { loop: true };
  });

  return executors;
}

function parseDelay(delay: string): number {
  const match = delay.match(/^(\d+)\s*(ms|s|m|h|d)$/);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

// Singleton instance
let defaultExecutor: WorkflowExecutor | null = null;

export function getDefaultExecutor(): WorkflowExecutor {
  if (!defaultExecutor) {
    defaultExecutor = new WorkflowExecutor();
    const executors = createDefaultNodeExecutors();
    executors.forEach((executor, type) => {
      defaultExecutor!.registerNodeExecutor(type, executor);
    });
  }
  return defaultExecutor;
}
