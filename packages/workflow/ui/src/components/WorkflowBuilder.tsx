import { Button } from "@vayva/ui";
/**
 * WorkflowBuilder Component
 * Main workflow builder component with drag-and-drop functionality
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type {
  Workflow,
  IndustrySlug,
  WorkflowNode,
  WorkflowEdge,
} from '@vayva/workflow-engine';

import { NodePalette } from './NodePalette';
import { PropertiesPanel } from './PropertiesPanel';
import { nodeTypes } from './nodes/index';
import { edgeTypes } from './edges/index';
import { useWorkflow } from '../hooks/useWorkflow.js';

export interface WorkflowBuilderProps {
  workflow?: Workflow;
  industry: IndustrySlug;
  onSave: (workflow: Workflow) => Promise<void>;
  onTest?: (workflow: Workflow) => Promise<void>;
  onValidate?: (workflow: Workflow) => Promise<{ valid: boolean; errors: string[] }>;
  readOnly?: boolean;
}

export function WorkflowBuilder({
  workflow,
  industry,
  onSave,
  onTest,
  onValidate,
  readOnly = false,
}: WorkflowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    workflow: currentWorkflow,
    nodes,
    edges,
    setNodes,
    setEdges,
    updateNode,
    updateEdge,
    addNode,
    removeNode,
    removeEdge,
    toWorkflow,
    validate,
  } = useWorkflow({
    initialWorkflow: workflow,
    industry,
  });

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  // Sync React Flow state with hook state
  useEffect(() => {
    setRfNodes(nodes);
  }, [nodes, setRfNodes]);

  useEffect(() => {
    setRfEdges(edges);
  }, [edges, setRfEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;
      
      const newEdge: Edge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        animated: true,
        type: 'condition',
      };
      
      setRfEdges((eds) => addEdge(newEdge, eds));
      setEdges((eds) => [...eds, newEdge as WorkflowEdge]);
    },
    [readOnly, setEdges, setRfEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (readOnly || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `${type}_${Date.now()}`,
        type: type as WorkflowNode['type'],
        position,
        data: {
          label: type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        },
      };

      addNode(newNode);
    },
    [addNode, reactFlowInstance, readOnly]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      updateNode(nodeId, data);
      
      // Update React Flow nodes
      setRfNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
          }
          return node;
        })
      );
    },
    [updateNode, setRfNodes]
  );

  const handleEdgeUpdate = useCallback(
    (edgeId: string, data: Record<string, unknown>) => {
      updateEdge(edgeId, data);
      
      setRfEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return { ...edge, ...data };
          }
          return edge;
        })
      );
    },
    [updateEdge, setRfEdges]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const workflowToSave = toWorkflow();
      await onSave(workflowToSave);
      setValidationErrors([]);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, toWorkflow]);

  const handleTest = useCallback(async () => {
    if (!onTest) return;
    
    setIsTestMode(true);
    try {
      const workflowToTest = toWorkflow();
      await onTest(workflowToTest);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTestMode(false);
    }
  }, [onTest, toWorkflow]);

  const handleValidate = useCallback(async () => {
    if (onValidate) {
      const workflowToValidate = toWorkflow();
      const result = await onValidate(workflowToValidate);
      setValidationErrors(result.errors);
    } else {
      const result = validate();
      setValidationErrors(result.errors.map((e) => e.message));
    }
  }, [onValidate, toWorkflow, validate]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      removeNode(selectedNode.id);
      setSelectedNode(null);
    }
    if (selectedEdge) {
      removeEdge(selectedEdge.id);
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, removeNode, removeEdge]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode || selectedEdge) {
          handleDeleteSelected();
        }
      }
      
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, handleSave, selectedNode, selectedEdge]);

  return (
    <div className="workflow-builder flex h-full w-full">
      {!readOnly && (
        <NodePalette industry={industry} className="w-64 flex-shrink-0" />
      )}

      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {currentWorkflow.name || 'Untitled Workflow'}
            </h2>
            {validationErrors.length > 0 && (
              <div className="text-red-600 text-sm">
                {validationErrors.length} error(s)
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && (
              <>
                <Button
                  onClick={handleValidate}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Validate
                </Button>
                {onTest && (
                  <Button
                    onClick={handleTest}
                    disabled={isTestMode}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isTestMode ? 'Testing...' : 'Test'}
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
            deleteKeyCode={readOnly ? null : 'Delete'}
          >
            <Background />
            <Controls />
            <MiniMap />
            
            <Panel position="top-left" className="bg-white p-2 rounded shadow">
              <div className="text-xs text-gray-500">
                {rfNodes.length} nodes • {rfEdges.length} edges
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Properties Panel */}
      {(selectedNode || selectedEdge) && (
        <PropertiesPanel
          node={selectedNode}
          edge={selectedEdge}
          onNodeUpdate={handleNodeUpdate}
          onEdgeUpdate={handleEdgeUpdate}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
          className="w-80 flex-shrink-0"
        />
      )}
    </div>
  );
}

export default WorkflowBuilder;
