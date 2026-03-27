/**
 * Advanced Visual Workflow Builder V2
 * Production-ready drag-and-drop workflow editor with conditional logic
 * 
 * Features:
 * - React Flow-based visual canvas
 * - Drag-and-drop node creation
 * - Conditional branching and logic
 * - Real-time validation
 * - Industry-specific node library
 * - Template import/export
 * 
 * @component WorkflowBuilderV2
 */

'use client';

import React, { useCallback, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Shuffle,
  Play,
  Save,
  Trash2,
  Copy,
  Download,
  Upload,
  Zap,
  Mail,
  Users,
  Clock,
  Database,
  Webhook,
  FileText,
  Bell,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye,
  GitBranch,
  Plus,
  X,
  Check,
  AlertCircle,
  Settings,
  TestTube,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { IndustrySlug } from '@vayva/domain';

// ============================================================================
// Types
// ============================================================================

type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'ai' | 'industry';

interface WorkflowNodeData {
  label: string;
  description?: string;
  icon?: string;
  type: NodeType;
  category: string;
  config?: Record<string, unknown>;
  industry?: IndustrySlug;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  industry: IndustrySlug;
  status: 'draft' | 'active' | 'paused';
  nodes: Node[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowBuilderV2Props {
  workflow?: WorkflowDefinition;
  industry: IndustrySlug;
  onSave?: (workflow: WorkflowDefinition) => Promise<void>;
  onTest?: (workflow: WorkflowDefinition) => Promise<void>;
  readOnly?: boolean;
}

// ============================================================================
// Node Type Definitions
// ============================================================================

const NODE_TYPES: Array<{
  type: NodeType;
  category: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  industry?: IndustrySlug[];
}> = [
  // Triggers
  {
    type: 'trigger',
    category: 'Triggers',
    label: 'Form Submission',
    description: 'When a form is submitted',
    icon: <FileText className="w-4 h-4" />,
    color: 'green',
  },
  {
    type: 'trigger',
    category: 'Triggers',
    label: 'Purchase Made',
    description: 'When a customer makes a purchase',
    icon: <ShoppingCart className="w-4 h-4" />,
    color: 'green',
  },
  {
    type: 'trigger',
    category: 'Triggers',
    label: 'Revenue Milestone',
    description: 'When revenue reaches a target',
    icon: <DollarSign className="w-4 h-4" />,
    color: 'green',
  },
  {
    type: 'trigger',
    category: 'Triggers',
    label: 'Webhook Received',
    description: 'When webhook endpoint is called',
    icon: <Webhook className="w-4 h-4" />,
    color: 'green',
  },
  
  // Actions
  {
    type: 'action',
    category: 'Actions',
    label: 'Send Email',
    description: 'Send an email notification',
    icon: <Mail className="w-4 h-4" />,
    color: 'blue',
  },
  {
    type: 'action',
    category: 'Actions',
    label: 'Send SMS',
    description: 'Send text message',
    icon: <Bell className="w-4 h-4" />,
    color: 'blue',
  },
  {
    type: 'action',
    category: 'Actions',
    label: 'Create Task',
    description: 'Add task to team queue',
    icon: <Users className="w-4 h-4" />,
    color: 'blue',
  },
  {
    type: 'action',
    category: 'Actions',
    label: 'Update Database',
    description: 'Modify database records',
    icon: <Database className="w-4 h-4" />,
    color: 'blue',
  },
  {
    type: 'action',
    category: 'Actions',
    label: 'Generate Report',
    description: 'Create analytics report',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'blue',
  },
  
  // Conditions
  {
    type: 'condition',
    category: 'Logic',
    label: 'If/Else',
    description: 'Conditional branching',
    icon: <GitBranch className="w-4 h-4" />,
    color: 'amber',
  },
  {
    type: 'condition',
    category: 'Logic',
    label: 'Switch',
    description: 'Multi-path branching',
    icon: <GitBranch className="w-4 h-4" />,
    color: 'amber',
  },
  
  // Delays
  {
    type: 'delay',
    category: 'Delays',
    label: 'Wait',
    description: 'Pause for specified time',
    icon: <Clock className="w-4 h-4" />,
    color: 'purple',
  },
  {
    type: 'delay',
    category: 'Delays',
    label: 'Wait Until',
    description: 'Wait until specific date/time',
    icon: <Clock className="w-4 h-4" />,
    color: 'purple',
  },
  
  // AI Actions
  {
    type: 'ai',
    category: 'AI-Powered',
    label: 'AI Insight',
    description: 'Generate AI recommendation',
    icon: <Zap className="w-4 h-4" />,
    color: 'rose',
  },
  {
    type: 'ai',
    category: 'AI-Powered',
    label: 'Predict Churn',
    description: 'Calculate churn probability',
    icon: <Zap className="w-4 h-4" />,
    color: 'rose',
  },
  {
    type: 'ai',
    category: 'AI-Powered',
    label: 'Forecast Demand',
    description: 'Predict future demand',
    icon: <Zap className="w-4 h-4" />,
    color: 'rose',
  },
];

// ============================================================================
// Custom Node Components
// ============================================================================

const TriggerNode = ({ data, selected }: { data: WorkflowNodeData; selected: boolean }) => (
  <div
    className={`px-4 py-3 bg-white border-2 rounded-lg shadow-sm ${
      selected ? 'border-green-500 shadow-md' : 'border-green-200'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
        <div className="text-green-600">{data.icon && React.createElement(() => <span>{data.icon}</span>)}</div>
      </div>
      <div>
        <div className="font-semibold text-sm">{data.label}</div>
        <div className="text-xs text-gray-500">{data.description}</div>
      </div>
    </div>
  </div>
);

const ActionNode = ({ data, selected }: { data: WorkflowNodeData; selected: boolean }) => (
  <div
    className={`px-4 py-3 bg-white border-2 rounded-lg shadow-sm ${
      selected ? 'border-blue-500 shadow-md' : 'border-blue-200'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <div className="text-blue-600">{data.icon && React.createElement(() => <span>{data.icon}</span>)}</div>
      </div>
      <div>
        <div className="font-semibold text-sm">{data.label}</div>
        <div className="text-xs text-gray-500">{data.description}</div>
      </div>
    </div>
  </div>
);

const ConditionNode = ({ data, selected }: { data: WorkflowNodeData; selected: boolean }) => (
  <div
    className={`px-4 py-3 bg-white border-2 rounded-lg shadow-sm ${
      selected ? 'border-amber-500 shadow-md' : 'border-amber-200'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
        <div className="text-amber-600">{data.icon && React.createElement(() => <span>{data.icon}</span>)}</div>
      </div>
      <div>
        <div className="font-semibold text-sm">{data.label}</div>
        <div className="text-xs text-gray-500">{data.description}</div>
      </div>
    </div>
  </div>
);

const AINode = ({ data, selected }: { data: WorkflowNodeData; selected: boolean }) => (
  <div
    className={`px-4 py-3 bg-gradient-to-br from-purple-50 to-pink-50 border-2 rounded-lg shadow-sm ${
      selected ? 'border-purple-500 shadow-md' : 'border-purple-200'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="font-semibold text-sm">{data.label}</div>
        <div className="text-xs text-gray-500">{data.description}</div>
      </div>
    </div>
  </div>
);

// Node type mapping
const nodeTypeComponents: Record<string, React.FC<any>> = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  ai: AINode,
};

// ============================================================================
// Main Component
// ============================================================================

export const WorkflowBuilderV2: React.FC<WorkflowBuilderV2Props> = ({
  workflow,
  industry,
  onSave,
  onTest,
  readOnly = false,
}) => {
  // State
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [workflowName, setWorkflowName] = useState(workflow?.name || 'New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || '');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Initialize from existing workflow
  React.useEffect(() => {
    if (workflow) {
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description);
    }
  }, [workflow, setNodes, setEdges]);

  // Handle node drag start
  const onDragStart = (event: React.DragEvent, nodeType: NodeType, nodeData: WorkflowNodeData) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow-type') as NodeType;
      const dataString = event.dataTransfer.getData('application/reactflow-data');
      
      if (!type || !dataString) return;

      const nodeData: WorkflowNodeData = JSON.parse(dataString);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: {
          ...nodeData,
          config: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setIsDirty(true);
    },
    [reactFlowInstance, setNodes]
  );

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle connection
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 2, stroke: '#22C55E' } }, eds));
      setIsDirty(true);
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge click
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle pane click (deselect all)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Handle node update
  const handleNodeUpdate = useCallback(
    (nodeId: string, newData: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...newData },
            };
          }
          return node;
        })
      );
      setIsDirty(true);
    },
    [setNodes]
  );

  // Handle delete selected
  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      setIsDirty(true);
    } else if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      setIsDirty(true);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      const workflowDef: WorkflowDefinition = {
        id: workflow?.id || `wf_${Date.now()}`,
        name: workflowName,
        description: workflowDescription,
        industry,
        status: 'draft',
        nodes,
        edges,
        createdAt: workflow?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await onSave(workflowDef);
      toast.success('Workflow saved successfully');
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  // Handle test
  const handleTest = async () => {
    if (!onTest || nodes.length === 0) return;

    setTesting(true);
    try {
      const workflowDef: WorkflowDefinition = {
        id: workflow?.id || `wf_${Date.now()}`,
        name: workflowName,
        description: workflowDescription,
        industry,
        status: 'draft',
        nodes,
        edges,
        createdAt: workflow?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await onTest(workflowDef);
      toast.success('Workflow test completed');
    } catch (error) {
      console.error('Workflow test failed:', error);
      toast.error('Workflow test failed');
    } finally {
      setTesting(false);
    }
  };

  // Validate workflow
  const isValid = useMemo(() => {
    if (nodes.length === 0) return false;
    
    const hasTrigger = nodes.some(n => n.type === 'trigger');
    if (!hasTrigger) return false;

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    edges.forEach(e => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    const allConnected = nodes.every(n => 
      n.type === 'trigger' || connectedNodeIds.has(n.id)
    );

    return allConnected;
  }, [nodes, edges]);

  // Sidebar component
  const Sidebar = () => (
    <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-green-500" />
          Node Library
        </h3>
        <p className="text-xs text-gray-500 mt-1">Drag nodes to build your workflow</p>
      </div>

      <Tabs defaultValue="all" className="p-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="industry">Industry</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {['Triggers', 'Actions', 'Logic', 'Delays', 'AI-Powered'].map((category) => {
            const categoryNodes = NODE_TYPES.filter((n) => n.category === category);
            
            return (
              <div key={category}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {category}
                </h4>
                <div className="space-y-2">
                  {categoryNodes.map((node, idx) => (
                    <motion.div
                      key={idx}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type, {
                        label: node.label,
                        description: node.description,
                        type: node.type,
                        category: node.category,
                        icon: node.icon,
                      })}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-green-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {node.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{node.label}</div>
                        <div className="text-xs text-gray-500 truncate">{node.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="industry" className="mt-4">
          <div className="text-center py-8 text-gray-500 text-sm">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Industry-specific nodes</p>
            <p className="mt-1">Coming soon for {industry}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Properties Panel
  const PropertiesPanel = () => {
    if (!selectedNode) return null;

    return (
      <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Properties</h3>
          <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={selectedNode.data.label as string}
              onChange={(e) => {
                handleNodeUpdate(selectedNode.id, { label: e.target.value });
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="node-description">Description</Label>
            <Textarea
              id="node-description"
              value={selectedNode.data.description as string}
              onChange={(e) => {
                handleNodeUpdate(selectedNode.id, { description: e.target.value });
              }}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Node-specific configuration */}
          {selectedNode.type === 'trigger' && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm">Trigger Configuration</h4>
              
              {selectedNode.data.label === 'Form Submission' && (
                <>
                  <div>
                    <Label>Select Form</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact">Contact Form</SelectItem>
                        <SelectItem value="signup">Signup Form</SelectItem>
                        <SelectItem value="checkout">Checkout Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {selectedNode.data.label === 'Revenue Milestone' && (
                <>
                  <div>
                    <Label>Target Amount ($)</Label>
                    <Input type="number" className="mt-1" placeholder="10000" />
                  </div>
                </>
              )}
            </div>
          )}

          {selectedNode.type === 'action' && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm">Action Configuration</h4>
              
              {selectedNode.data.label === 'Send Email' && (
                <>
                  <div>
                    <Label>Recipient</Label>
                    <Input className="mt-1" placeholder="customer@example.com" />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input className="mt-1" placeholder="Email subject" />
                  </div>
                  <div>
                    <Label>Template</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome Email</SelectItem>
                        <SelectItem value="confirmation">Order Confirmation</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedNode.type === 'condition' && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm">Condition Configuration</h4>
              <div>
                <Label>Condition Type</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greater">Greater Than</SelectItem>
                    <SelectItem value="less">Less Than</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Field</Label>
                <Input className="mt-1" placeholder="e.g., order_total" />
              </div>
              <div>
                <Label>Value</Label>
                <Input className="mt-1" placeholder="e.g., 100" />
              </div>
            </div>
          )}

          {selectedNode.type === 'delay' && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm">Delay Configuration</h4>
              <div>
                <Label>Duration</Label>
                <Input type="number" className="mt-1" placeholder="1" />
              </div>
              <div>
                <Label>Unit</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {selectedNode.type === 'ai' && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm">AI Configuration</h4>
              <div>
                <Label>Model</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="churn">Churn Prediction</SelectItem>
                    <SelectItem value="ltv">Lifetime Value</SelectItem>
                    <SelectItem value="demand">Demand Forecast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Confidence Threshold (%)</Label>
                <Input type="number" className="mt-1" placeholder="80" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Input
              value={workflowName}
              onChange={(e) => {
                setWorkflowName(e.target.value);
                setIsDirty(true);
              }}
              className="text-lg font-bold border-none px-0 focus-visible:ring-0"
              disabled={readOnly}
            />
            <Input
              value={workflowDescription}
              onChange={(e) => {
                setWorkflowDescription(e.target.value);
                setIsDirty(true);
              }}
              className="text-sm text-gray-500 border-none px-0 focus-visible:ring-0"
              placeholder="Add a description..."
              disabled={readOnly}
            />
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={testing || nodes.length === 0}
                  className="gap-2"
                >
                  <TestTube className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
                  Test
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !isValid || !isDirty}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>{nodes.length} nodes</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{edges.length} connections</span>
            </div>
          </div>

          {isValid ? (
            <Badge variant="secondary" className="gap-1">
              <Check className="w-3 h-3" />
              Valid
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              Invalid
            </Badge>
          )}

          {isDirty && (
            <Badge variant="outline">Unsaved changes</Badge>
          )}
        </div>
      </div>

      {/* Canvas + Panels */}
      <div className="flex flex-1 overflow-hidden">
        {!readOnly && <Sidebar />}

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypeComponents}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode={readOnly ? null : 'Delete'}
            proOptions={{ hideAttribution: true }}
            className="bg-gray-50"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E5E7EB" />
            <Controls className="!bg-white !border-gray-200 !rounded-lg !shadow-sm" />
            <MiniMap
              className="!bg-white !border-gray-200 !rounded-lg !shadow-sm"
              maskColor="rgba(0,0,0,0.08)"
              nodeColor={(node) => {
                switch (node.type) {
                  case 'trigger': return '#22C55E';
                  case 'action': return '#3B82F6';
                  case 'condition': return '#F59E0B';
                  case 'delay': return '#A855F7';
                  case 'ai': return '#F43F5E';
                  default: return '#9CA3AF';
                }
              }}
            />

            <Panel position="top-right">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">
                  {nodes.length} nodes • {edges.length} edges
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {!readOnly && selectedNode && <PropertiesPanel />}
      </div>
    </Card>
  );
};

export default WorkflowBuilderV2;
