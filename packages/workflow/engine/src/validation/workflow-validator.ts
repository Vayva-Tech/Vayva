/**
 * Workflow Validator
 * Validates workflow structure and configuration
 */

import type { Workflow, WorkflowNode, WorkflowEdge, NodeType } from '../types.js';
import { isValidNodeType, getNodeDefinition } from '../nodes/registry.js';
import { TRIGGER_DEFINITIONS } from '../triggers/registry.js';

export interface ValidationError {
  field: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class WorkflowValidator {
  private maxNodes: number;

  constructor(maxNodes: number = 100) {
    this.maxNodes = maxNodes;
  }

  validate(workflow: Workflow): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic structure validation
    this.validateBasicStructure(workflow, errors);

    // Node validation
    this.validateNodes(workflow, errors, warnings);

    // Edge validation
    this.validateEdges(workflow, errors);

    // Trigger validation
    this.validateTrigger(workflow, errors);

    // Graph validation
    this.validateGraphStructure(workflow, errors);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateBasicStructure(workflow: Workflow, errors: ValidationError[]): void {
    if (!workflow.id) {
      errors.push({ field: 'id', message: 'Workflow ID is required' });
    }

    if (!workflow.name || workflow.name.trim() === '') {
      errors.push({ field: 'name', message: 'Workflow name is required' });
    }

    if (!workflow.industry) {
      errors.push({ field: 'industry', message: 'Industry is required' });
    }

    if (!workflow.merchantId) {
      errors.push({ field: 'merchantId', message: 'Merchant ID is required' });
    }

    if (!workflow.trigger) {
      errors.push({ field: 'trigger', message: 'Trigger is required' });
    }

    if (!Array.isArray(workflow.nodes)) {
      errors.push({ field: 'nodes', message: 'Nodes must be an array' });
    }

    if (!Array.isArray(workflow.edges)) {
      errors.push({ field: 'edges', message: 'Edges must be an array' });
    }

    if (workflow.nodes && workflow.nodes.length > this.maxNodes) {
      errors.push({ 
        field: 'nodes', 
        message: `Workflow cannot have more than ${this.maxNodes} nodes` 
      });
    }
  }

  private validateNodes(
    workflow: Workflow, 
    errors: ValidationError[], 
    warnings: ValidationError[]
  ): void {
    if (!workflow.nodes) return;

    const nodeIds = new Set<string>();
    let triggerCount = 0;

    for (const node of workflow.nodes) {
      // Check for duplicate IDs
      if (nodeIds.has(node.id)) {
        errors.push({
          field: 'nodes',
          message: `Duplicate node ID: ${node.id}`,
          nodeId: node.id,
        });
      }
      nodeIds.add(node.id);

      // Validate node type
      if (!isValidNodeType(node.type)) {
        errors.push({
          field: 'nodes',
          message: `Invalid node type: ${node.type}`,
          nodeId: node.id,
        });
      }

      // Count triggers
      if (node.type === 'trigger') {
        triggerCount++;
      }

      // Validate position
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push({
          field: 'nodes',
          message: 'Node position must have numeric x and y coordinates',
          nodeId: node.id,
        });
      }

      // Validate node data
      this.validateNodeData(node, errors, warnings);

      // Check industry compatibility
      const definition = getNodeDefinition(node.type);
      if (definition?.industries && !definition.industries.includes(workflow.industry)) {
        warnings.push({
          field: 'nodes',
          message: `Node type ${node.type} may not be compatible with industry ${workflow.industry}`,
          nodeId: node.id,
        });
      }
    }

    // Must have exactly one trigger
    if (triggerCount === 0) {
      errors.push({
        field: 'nodes',
        message: 'Workflow must have exactly one trigger node',
      });
    } else if (triggerCount > 1) {
      errors.push({
        field: 'nodes',
        message: 'Workflow cannot have more than one trigger node',
      });
    }
  }

  private validateNodeData(
    node: WorkflowNode,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    if (!node.data) {
      errors.push({
        field: 'nodes',
        message: 'Node data is required',
        nodeId: node.id,
      });
      return;
    }

    // Validate condition nodes
    if (node.type === 'condition') {
      const data = node.data as { condition?: string; field?: string; operator?: string };
      if (!data.condition) {
        warnings.push({
          field: 'nodes',
          message: 'Condition node should have a condition expression',
          nodeId: node.id,
        });
      }
      if (!data.field) {
        warnings.push({
          field: 'nodes',
          message: 'Condition node should specify a field to evaluate',
          nodeId: node.id,
        });
      }
    }

    // Validate delay nodes
    if (node.type === 'delay') {
      const data = node.data as { delay?: string };
      if (!data.delay) {
        errors.push({
          field: 'nodes',
          message: 'Delay node must specify a delay duration',
          nodeId: node.id,
        });
      } else if (!this.isValidDelayFormat(data.delay)) {
        errors.push({
          field: 'nodes',
          message: 'Invalid delay format. Use format like "5m", "1h", "24h"',
          nodeId: node.id,
        });
      }
    }

    // Validate send_email nodes
    if (node.type === 'send_email') {
      const data = node.data as { to?: string; template?: string; subject?: string };
      if (!data.to && !data.template) {
        warnings.push({
          field: 'nodes',
          message: 'Send email node should specify recipient or template',
          nodeId: node.id,
        });
      }
    }

    // Validate send_sms nodes
    if (node.type === 'send_sms') {
      const data = node.data as { to?: string; message?: string; template?: string };
      if (!data.to && !data.template) {
        warnings.push({
          field: 'nodes',
          message: 'Send SMS node should specify recipient or template',
          nodeId: node.id,
        });
      }
    }
  }

  private validateEdges(workflow: Workflow, errors: ValidationError[]): void {
    if (!workflow.edges) return;

    const edgeIds = new Set<string>();
    const nodeIds = new Set(workflow.nodes?.map((n) => n.id) || []);

    for (const edge of workflow.edges) {
      // Check for duplicate IDs
      if (edgeIds.has(edge.id)) {
        errors.push({
          field: 'edges',
          message: `Duplicate edge ID: ${edge.id}`,
          edgeId: edge.id,
        });
      }
      edgeIds.add(edge.id);

      // Validate source node exists
      if (!nodeIds.has(edge.source)) {
        errors.push({
          field: 'edges',
          message: `Edge references non-existent source node: ${edge.source}`,
          edgeId: edge.id,
        });
      }

      // Validate target node exists
      if (!nodeIds.has(edge.target)) {
        errors.push({
          field: 'edges',
          message: `Edge references non-existent target node: ${edge.target}`,
          edgeId: edge.id,
        });
      }

      // Validate condition if present
      if (edge.condition) {
        if (edge.condition.type === 'custom' && !edge.condition.expression) {
          errors.push({
            field: 'edges',
            message: 'Custom condition must have an expression',
            edgeId: edge.id,
          });
        }
      }
    }
  }

  private validateTrigger(workflow: Workflow, errors: ValidationError[]): void {
    if (!workflow.trigger) return;

    const definition = TRIGGER_DEFINITIONS[workflow.trigger.type];
    if (!definition) {
      errors.push({
        field: 'trigger',
        message: `Unknown trigger type: ${workflow.trigger.type}`,
      });
      return;
    }

    // Validate trigger config based on type
    switch (workflow.trigger.type) {
      case 'schedule': {
        const config = workflow.trigger.config as { cron?: string; interval?: string };
        if (!config.cron && !config.interval) {
          errors.push({
            field: 'trigger',
            message: 'Schedule trigger must have cron expression or interval',
          });
        }
        break;
      }
      case 'webhook': {
        const config = workflow.trigger.config as { endpoint?: string };
        if (!config.endpoint) {
          errors.push({
            field: 'trigger',
            message: 'Webhook trigger must have an endpoint',
          });
        }
        break;
      }
    }
  }

  private validateGraphStructure(workflow: Workflow, errors: ValidationError[]): void {
    if (!workflow.nodes || !workflow.edges) return;

    // Build adjacency list
    const adjacencyList = new Map<string, string[]>();
    const incomingEdges = new Map<string, number>();

    for (const node of workflow.nodes) {
      adjacencyList.set(node.id, []);
      incomingEdges.set(node.id, 0);
    }

    for (const edge of workflow.edges) {
      const neighbors = adjacencyList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjacencyList.set(edge.source, neighbors);

      const incoming = incomingEdges.get(edge.target) || 0;
      incomingEdges.set(edge.target, incoming + 1);
    }

    // Find trigger node
    const triggerNode = workflow.nodes.find((n) => n.type === 'trigger');
    if (!triggerNode) return;

    // Check for unreachable nodes (nodes not reachable from trigger)
    const reachable = new Set<string>();
    const queue = [triggerNode.id];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);

      const neighbors = adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!reachable.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    for (const node of workflow.nodes) {
      if (!reachable.has(node.id) && node.type !== 'trigger') {
        errors.push({
          field: 'nodes',
          message: `Node is not reachable from trigger: ${node.id}`,
          nodeId: node.id,
        });
      }
    }

    // Check for dead ends (nodes with no outgoing edges, except end nodes)
    const endNodeTypes: NodeType[] = ['send_email', 'send_sms', 'send_whatsapp', 'send_push', 
      'update_inventory', 'create_task', 'update_customer', 'tag_customer', 'apply_discount',
      'restaurant_86_item', 'fashion_size_alert'];

    for (const node of workflow.nodes) {
      const neighbors = adjacencyList.get(node.id) || [];
      if (neighbors.length === 0 && !endNodeTypes.includes(node.type) && node.type !== 'trigger') {
        errors.push({
          field: 'nodes',
          message: `Node has no outgoing edges and is not an end node: ${node.id}`,
          nodeId: node.id,
        });
      }
    }

    // Check for cycles (simple check)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    if (hasCycle(triggerNode.id)) {
      errors.push({
        field: 'edges',
        message: 'Workflow contains a cycle, which is not allowed',
      });
    }
  }

  private isValidDelayFormat(delay: string): boolean {
    return /^\d+\s*(ms|s|m|h|d)$/.test(delay);
  }
}

// Singleton instance
let defaultValidator: WorkflowValidator | null = null;

export function getDefaultValidator(): WorkflowValidator {
  if (!defaultValidator) {
    defaultValidator = new WorkflowValidator();
  }
  return defaultValidator;
}
