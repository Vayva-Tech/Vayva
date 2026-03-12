/* eslint-disable react/no-unknown-property */
"use client";

import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button, Icon, cn } from "@vayva/ui";

const initialNodes: Node[] = [
  {
    id: "trigger-1",
    type: "input",
    data: { label: "When Order is Paid" },
    position: { x: 250, y: 50 },
    className:
      "bg-black text-white rounded-xl p-4 border-2 border-text-primary shadow-xl font-bold",
  },
  {
    id: "condition-1",
    data: { label: "Total Amount > 50,000 NGN" },
    position: { x: 250, y: 150 },
    className:
      "bg-background text-black rounded-xl p-4 border border-border shadow-lg",
  },
  {
    id: "action-1",
    type: "output",
    data: { label: "Send WhatsApp Coupon" },
    position: { x: 250, y: 250 },
    className:
      "bg-indigo-600 text-white rounded-xl p-4 border border-indigo-500 shadow-xl",
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "trigger-1", target: "condition-1", animated: true },
  { id: "e2-3", source: "condition-1", target: "action-1" },
];

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-[700px] w-full border border-border rounded-3xl overflow-hidden bg-background/50 backdrop-blur-sm relative group">
      <div className="absolute top-6 left-6 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur shadow-sm"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Add Trigger
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur shadow-sm"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Add Action
        </Button>
      </div>

      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <Button variant="primary" size="sm" className="shadow-lg">
          <Icon name="Save" size={16} className="mr-2" />
          Save Workflow
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-dot-pattern"
      >
        <Background gap={20} color="#f1f1f1" />
        <Controls
          showInteractive={false}
          className="bg-background border-border rounded-lg shadow-sm"
        />
        <MiniMap
          className="bg-background border-border rounded-lg shadow-sm"
          nodeColor={(n) => {
            if (n.type === "input") return "#000";
            if (n.type === "output") return "#4f46e5";
            return "#fff";
          }}
        />
      </ReactFlow>

      <style jsx global>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .react-flow__node {
          font-family: inherit;
        }
        .react-flow__handle {
          width: 8px;
          height: 8px;
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
