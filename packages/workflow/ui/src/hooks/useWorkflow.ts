/**
 * useWorkflow Hook
 * React hook for managing workflow state
 */

import { useState, useCallback, useMemo } from 'react';
import type { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge, 
  IndustrySlug,
  ValidationResult 
} from '@vayva/workflow-engine';
import { getDefaultValidator } from '@vayva/workflow-engine';
import type { Node, Edge } from '@xyflow/react';

export interface UseWorkflowOptions {
  initialWorkflow?: Workflow;
  industry: IndustrySlug;
  merchantId?: string;
}

export interface UseWorkflowReturn {
  workflow: Workflow;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, data: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  updateEdge: (edgeId: string, data: Record<string, unknown>) => void;
  removeEdge: (edgeId: string) => void;
  toWorkflow: () => Workflow;
  validate: () => ValidationResult;
  isDirty: boolean;
  reset: () => void;
}

export function useWorkflow(options: UseWorkflowOptions): UseWorkflowReturn {
  const { initialWorkflow, industry, merchantId = 'default' } = options;
  const validator = useMemo(() => getDefaultValidator(), []);

  const createDefaultWorkflow = useCallback((): Workflow => ({
    id: `wf_${Date.now()}`,
    name: 'New Workflow',
    description: '',
    industry,
    merchantId,
    trigger: {
      type: 'manual',
      config: { allowBulkExecution: false },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Start', triggerType: 'manual' },
      },
    ],
    edges: [],
    status: 'draft',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  }), [industry, merchantId]);

  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow || createDefaultWorkflow());
  const [isDirty, setIsDirty] = useState(false);

  // Convert workflow nodes to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return workflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data as unknown as Record<string, unknown>,
    }));
  }, [workflow.nodes]);

  // Convert workflow edges to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      data: {
        condition: edge.condition,
      },
      type: 'condition',
      animated: true,
    }));
  }, [workflow.edges]);

  const addNode = useCallback((node: WorkflowNode) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, node],
      updatedAt: new Date(),
    }));
    setIsDirty(true);
  }, []);

  const updateNode = useCallback((nodeId: string, data: Record<string, unknown>) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
      updatedAt: new Date(),
    }));
    setIsDirty(true);
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((node) => node.id !== nodeId),
      edges: prev.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      updatedAt: new Date(),
    }));
    setIsDirty(true);
  }, []);

  const addEdge = useCallback((edge: WorkflowEdge) => {
    setWorkflow((prev) => ({
      ...prev,
      edges: [...prev.edges, edge],
      updatedAt: new Date(),
    }));
    setIsDirty(true);
  }, []);

  const updateEdge = useCallback((edgeId: string, data: Record<string, unknown>) => {
    setWorkflow((prev) => ({
      ...prev,
      edges: prev.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, ...data } : edge
      ),
      updatedAt: new Date(),
    }));
    setIsDirty(true);
  }, []);

  const removeEdge = useCallback((edgeId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      edges: prev.edges.filter((edge) => edge.id !== edgeId),
      updatedAt: new Date(),
    }));
    setIsDirty(true);
  }, []);

  const toWorkflow = useCallback((): Workflow => {
    return workflow;
  }, [workflow]);

  const validate = useCallback((): ValidationResult => {
    return validator.validate(workflow);
  }, [validator, workflow]);

  const reset = useCallback(() => {
    setWorkflow(initialWorkflow || createDefaultWorkflow());
    setIsDirty(false);
  }, [initialWorkflow, createDefaultWorkflow]);

  return {
    workflow,
    nodes,
    edges,
    setNodes: () => {}, // React Flow manages its own state, we sync from workflow
    setEdges: () => {},
    addNode,
    updateNode,
    removeNode,
    addEdge,
    updateEdge,
    removeEdge,
    toWorkflow,
    validate,
    isDirty,
    reset,
  };
}

export default useWorkflow;
