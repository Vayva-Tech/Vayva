// @ts-nocheck
'use client';

import { useState, useCallback, useRef, useMemo, DragEvent } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ShoppingCart,
  Package,
  UserPlus,
  Clock,
  Webhook,
  Mail,
  MessageCircle,
  BarChart3,
  Tag,
  Globe,
  GitBranch,
  Timer,
  Brain,
  Sparkles,
  Save,
  Play,
  ChevronDown,
  GripVertical,
  Zap,
  Settings,
  Layers,
  Bot,
  Lock,
} from 'lucide-react';

// ── Node Data Types ──────────────────────────────────────────────────────────

interface BaseNodeData {
  label: string;
  description: string;
  icon?: string;
  [key: string]: unknown;
}

// ── Custom Node Components ───────────────────────────────────────────────────

function TriggerNode({ data, selected }: NodeProps) {
  const iconMap: Record<string, any> = {
    'order-placed': ShoppingCart,
    'inventory-low': Package,
    'customer-signup': UserPlus,
    'schedule': Clock,
    'webhook': Webhook,
  };
  const Icon = iconMap[data.icon as string] || Zap;

  return (
    <div
      className={`relative min-w-[180px] bg-white rounded-2xl shadow-md border-2 transition-all ${
        selected ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-green-300'
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-green-100 bg-green-50/50 rounded-t-2xl">
        <div className="p-1.5 bg-green-500 rounded-lg">
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-green-800 truncate">{data.label as string}</p>
        </div>
      </div>
      <div className="px-4 py-2.5">
        <p className="text-[11px] text-gray-500 leading-relaxed">{data.description as string}</p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !-bottom-1.5"
      />
    </div>
  );
}

function ActionNode({ data, selected }: NodeProps) {
  const iconMap: Record<string, any> = {
    'send-email': Mail,
    'send-whatsapp': MessageCircle,
    'update-inventory': Package,
    'create-discount': Tag,
    'api-call': Globe,
  };
  const Icon = iconMap[data.icon as string] || Settings;

  return (
    <div
      className={`relative min-w-[180px] bg-white rounded-2xl shadow-md border-2 transition-all ${
        selected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-blue-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !-top-1.5"
      />
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-blue-100 bg-blue-50/50 rounded-t-2xl">
        <div className="p-1.5 bg-blue-500 rounded-lg">
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-800 truncate">{data.label as string}</p>
        </div>
      </div>
      <div className="px-4 py-2.5">
        <p className="text-[11px] text-gray-500 leading-relaxed">{data.description as string}</p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !-bottom-1.5"
      />
    </div>
  );
}

function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`relative min-w-[180px] bg-white rounded-2xl shadow-md border-2 transition-all ${
        selected ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-amber-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !-top-1.5"
      />
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-amber-100 bg-amber-50/50 rounded-t-2xl">
        <div className="p-1.5 bg-amber-500 rounded-lg">
          <GitBranch className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800 truncate">{data.label as string}</p>
        </div>
      </div>
      <div className="px-4 py-2.5">
        <p className="text-[11px] text-gray-500 leading-relaxed">{data.description as string}</p>
      </div>
      {/* Yes/No outputs */}
      <div className="flex justify-between px-4 pb-2">
        <span className="text-[10px] font-semibold text-green-600">Yes</span>
        <span className="text-[10px] font-semibold text-red-500">No</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !-bottom-1.5"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white !-bottom-1.5"
        style={{ left: '70%' }}
      />
    </div>
  );
}

function DelayNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`relative min-w-[180px] bg-white rounded-2xl shadow-md border-2 transition-all ${
        selected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-purple-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white !-top-1.5"
      />
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-purple-100 bg-purple-50/50 rounded-t-2xl">
        <div className="p-1.5 bg-purple-500 rounded-lg">
          <Timer className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-purple-800 truncate">{data.label as string}</p>
        </div>
      </div>
      <div className="px-4 py-2.5">
        <p className="text-[11px] text-gray-500 leading-relaxed">{data.description as string}</p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white !-bottom-1.5"
      />
    </div>
  );
}

function AINode({ data, selected }: NodeProps) {
  return (
    <div
      className={`relative min-w-[180px] bg-white rounded-2xl shadow-md border-2 transition-all ${
        selected ? 'border-rose-500 shadow-lg shadow-rose-500/20' : 'border-rose-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white !-top-1.5"
      />
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-rose-100 bg-rose-50/50 rounded-t-2xl">
        <div className="p-1.5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-rose-800 truncate">{data.label as string}</p>
        </div>
        <Sparkles className="w-3 h-3 text-rose-400" />
      </div>
      <div className="px-4 py-2.5">
        <p className="text-[11px] text-gray-500 leading-relaxed">{data.description as string}</p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white !-bottom-1.5"
      />
    </div>
  );
}

// ── Sidebar Node Definitions ─────────────────────────────────────────────────

const SIDEBAR_NODES = [
  {
    category: 'Triggers',
    color: 'green',
    items: [
      { type: 'trigger', icon: 'order-placed', label: 'Order Placed', description: 'When a new order is placed' },
      { type: 'trigger', icon: 'inventory-low', label: 'Inventory Low', description: 'When stock drops below threshold' },
      { type: 'trigger', icon: 'customer-signup', label: 'Customer Signup', description: 'When a new customer registers' },
      { type: 'trigger', icon: 'schedule', label: 'Schedule', description: 'Run on a timed schedule' },
      { type: 'trigger', icon: 'webhook', label: 'Webhook', description: 'Triggered by external webhook' },
    ],
  },
  {
    category: 'Actions',
    color: 'blue',
    items: [
      { type: 'action', icon: 'send-email', label: 'Send Email', description: 'Send an email notification' },
      { type: 'action', icon: 'send-whatsapp', label: 'Send WhatsApp', description: 'Send a WhatsApp message' },
      { type: 'action', icon: 'update-inventory', label: 'Update Inventory', description: 'Adjust stock levels' },
      { type: 'action', icon: 'create-discount', label: 'Create Discount', description: 'Generate a discount code' },
      { type: 'action', icon: 'api-call', label: 'API Call', description: 'Make an external API request' },
    ],
  },
  {
    category: 'Logic',
    color: 'amber',
    items: [
      { type: 'condition', icon: 'condition', label: 'If / Else', description: 'Branch based on a condition' },
      { type: 'delay', icon: 'delay', label: 'Delay', description: 'Wait for a specified time' },
    ],
  },
  {
    category: 'AI',
    color: 'rose',
    items: [
      { type: 'ai', icon: 'ai-decision', label: 'AI Decision', description: 'Let AI decide the next step' },
      { type: 'ai', icon: 'ai-simulate', label: 'What-If Simulation', description: 'Simulate outcomes with AI' },
    ],
  },
];

const WORKFLOW_TEMPLATES = [
  { id: 'abandoned-cart', name: 'Abandoned Cart Recovery' },
  { id: 'welcome-series', name: 'Welcome Email Series' },
  { id: 'restock-alert', name: 'Low Stock Alert' },
  { id: 'review-request', name: 'Post-Purchase Review' },
  { id: 'vip-discount', name: 'VIP Customer Discount' },
];

// ── Default Nodes & Edges ────────────────────────────────────────────────────

const DEFAULT_NODES: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 300, y: 50 },
    data: { label: 'Order Placed', description: 'When a new order is placed', icon: 'order-placed' },
  },
  {
    id: '2',
    type: 'condition',
    position: { x: 300, y: 220 },
    data: { label: 'Order > $50?', description: 'Check if order total exceeds $50', icon: 'condition' },
  },
  {
    id: '3',
    type: 'action',
    position: { x: 100, y: 420 },
    data: { label: 'Send Thank You', description: 'Send a thank you email', icon: 'send-email' },
  },
  {
    id: '4',
    type: 'delay',
    position: { x: 500, y: 420 },
    data: { label: 'Wait 2 Hours', description: 'Delay for 2 hours', icon: 'delay' },
  },
  {
    id: '5',
    type: 'ai',
    position: { x: 500, y: 600 },
    data: { label: 'AI Upsell', description: 'AI suggests related products', icon: 'ai-decision' },
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22C55E', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', sourceHandle: 'yes', style: { stroke: '#22C55E', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', sourceHandle: 'no', style: { stroke: '#EF4444', strokeWidth: 2 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#A855F7', strokeWidth: 2 } },
];

// ── Sidebar Component ────────────────────────────────────────────────────────

function Sidebar() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const onDragStart = (event: DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-data', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (category: string) => {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  };

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-green-500" />
          Node Library
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">Drag nodes onto the canvas</p>
      </div>

      <div className="p-3 space-y-3">
        {SIDEBAR_NODES.map((group) => {
          const colors = colorMap[group.color];
          const isCollapsed = collapsed[group.category];

          return (
            <div key={group.category}>
              <button
                onClick={() => toggleCategory(group.category)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  {group.category}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                />
              </button>

              {!isCollapsed && (
                <div className="space-y-1.5 mt-1">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      draggable
                      onDragStart={(e) =>
                        onDragStart(e, item.type, {
                          label: item.label,
                          description: item.description,
                          icon: item.icon,
                        })
                      }
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${colors.bg} ${colors.border} hover:scale-[1.02]`}
                    >
                      <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${colors.text}`}>{item.label}</p>
                        <p className="text-[10px] text-gray-500 truncate">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main WorkflowCanvas Component ────────────────────────────────────────────

export default function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_EDGES);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      action: ActionNode,
      condition: ConditionNode,
      delay: DelayNode,
      ai: AINode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        animated: true,
        style: { stroke: '#22C55E', strokeWidth: 2 },
      } as Edge;
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type');
      const rawData = event.dataTransfer.getData('application/reactflow-data');

      if (!type || !rawData) return;

      const nodeData = JSON.parse(rawData);

      const wrapper = reactFlowWrapper.current;
      if (!wrapper) return;

      const bounds = wrapper.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 30,
      };

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleSave = useCallback(() => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('vayva-workflow-draft', JSON.stringify(workflow));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [workflowName, nodes, edges]);

  const handleLoad = useCallback(() => {
    const saved = localStorage.getItem('vayva-workflow-draft');
    if (saved) {
      const workflow = JSON.parse(saved);
      setWorkflowName(workflow.name || 'My Workflow');
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
    }
  }, [setNodes, setEdges]);

  const handleLoadTemplate = useCallback(
    (templateId: string) => {
      // For now, just reset to defaults -- templates would come from API
      setNodes(DEFAULT_NODES);
      setEdges(DEFAULT_EDGES);
      setShowTemplates(false);
      const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
      if (template) setWorkflowName(template.name);
    },
    [setNodes, setEdges]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-green-500" />
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none px-1 py-0.5 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Templates dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Templates
              <ChevronDown className="w-3 h-3" />
            </button>

            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1">
                {WORKFLOW_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleLoadTemplate(template.id)}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Load */}
          <button
            onClick={handleLoad}
            className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Load
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              isSaved
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaved ? 'Saved!' : 'Save'}
          </button>

          {/* Run/Test */}
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm">
            <Play className="w-3.5 h-3.5" />
            Run / Test
          </button>
        </div>
      </div>

      {/* Canvas + Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#22C55E', strokeWidth: 2 },
            }}
            proOptions={{ hideAttribution: true }}
            className="bg-gray-50/30"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
            <Controls
              className="!bg-white !border-gray-200 !rounded-xl !shadow-sm"
              showInteractive={false}
            />
            <MiniMap
              className="!bg-white !border-gray-200 !rounded-xl !shadow-sm"
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
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

// ── Locked State for non-PRO_PLUS users ──────────────────────────────────────

export function WorkflowCanvasLocked() {
  return (
    <div className="relative h-[calc(100vh-12rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Blurred preview background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-80" />
      <div className="absolute inset-0 backdrop-blur-[2px]">
        <div className="flex h-full">
          {/* Fake sidebar */}
          <div className="w-64 border-r border-gray-200 bg-white/50 p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200/60 rounded-xl animate-pulse" />
            ))}
          </div>
          {/* Fake canvas */}
          <div className="flex-1 p-8">
            <div className="flex flex-col items-center gap-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-48 h-20 bg-gray-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md text-center">
          <div className="mx-auto w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Visual Workflow Builder</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Drag-and-drop workflow automation with AI-powered decision nodes, conditional branching,
            and pre-built templates. Available on the Pro Plus plan.
          </p>
          <a
            href="/dashboard/account"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro Plus
          </a>
        </div>
      </div>
    </div>
  );
}
