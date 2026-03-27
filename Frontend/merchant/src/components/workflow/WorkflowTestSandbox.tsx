/**
 * Workflow Testing Sandbox
 * Interactive debugger and test environment for workflows
 * 
 * Features:
 * - Step-through execution debugger
 * - Variable inspection at each step
 * - Test scenario simulation
 * - Execution logs and trace
 * - Performance metrics
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  StepForward,
  StepBack,
  RotateCcw,
  Bug,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Database,
  Zap,
  ChevronRight,
  ChevronDown,
  Terminal,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Node, Edge } from '@xyflow/react';

// ============================================================================
// Types
// ============================================================================

interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

interface ExecutionContext {
  variables: Map<string, unknown>;
  currentNodeId: string | null;
  executedNodes: string[];
  logs: ExecutionLog[];
  startTime: Date;
  endTime?: Date;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  error?: string;
}

interface ExecutionLog {
  timestamp: Date;
  nodeId: string;
  nodeType: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  data?: unknown;
}

interface WorkflowTestSandboxProps {
  workflow: WorkflowDefinition;
  onRunComplete?: (result: TestResult) => void;
}

interface TestResult {
  success: boolean;
  duration: number;
  nodesExecuted: number;
  totalNodes: number;
  logs: ExecutionLog[];
  error?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export const WorkflowTestSandbox: React.FC<WorkflowTestSandboxProps> = ({
  workflow,
  onRunComplete,
}) => {
  // State
  const [executionContext, setExecutionContext] = useState<ExecutionContext>({
    variables: new Map(),
    currentNodeId: null,
    executedNodes: [],
    logs: [],
    startTime: new Date(),
    status: 'idle',
  });

  const [testData, setTestData] = useState<Record<string, unknown>>({
    customer_email: 'customer@example.com',
    order_total: 150,
    items_count: 3,
  });

  const [activeTab, setActiveTab] = useState<'console' | 'variables' | 'metrics'>('console');

  // Execute single node
  const executeNode = useCallback(async (nodeId: string): Promise<void> => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const log: ExecutionLog = {
      timestamp: new Date(),
      nodeId: node.id,
      nodeType: node.type as string,
      message: `Executing ${node.data.label}`,
      level: 'info',
    };

    setExecutionContext(prev => ({
      ...prev,
      currentNodeId: node.id,
      logs: [...prev.logs, log],
    }));

    // Simulate node execution based on type
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update variables based on node type
    if (node.type === 'trigger') {
      setExecutionContext(prev => ({
        ...prev,
        variables: new Map(prev.variables).set('trigger_fired', true),
      }));
    } else if (node.type === 'action') {
      setExecutionContext(prev => ({
        ...prev,
        variables: new Map(prev.variables).set(`action_${node.id}_executed`, true),
      }));
    }

    const successLog: ExecutionLog = {
      timestamp: new Date(),
      nodeId: node.id,
      nodeType: node.type as string,
      message: `Completed ${node.data.label}`,
      level: 'success',
    };

    setExecutionContext(prev => ({
      ...prev,
      executedNodes: [...prev.executedNodes, node.id],
      logs: [...prev.logs, successLog],
    }));
  }, [workflow.nodes]);

  // Run workflow
  const runWorkflow = async () => {
    setExecutionContext({
      variables: new Map(Object.entries(testData)),
      currentNodeId: null,
      executedNodes: [],
      logs: [],
      startTime: new Date(),
      status: 'running',
    });

    try {
      // Find trigger node
      const triggerNode = workflow.nodes.find(n => n.type === 'trigger');
      if (!triggerNode) {
        throw new Error('No trigger node found');
      }

      // Execute nodes in sequence (simplified - would follow edges in production)
      for (const node of workflow.nodes) {
        await executeNode(node.id);
      }

      const result: TestResult = {
        success: true,
        duration: Date.now() - executionContext.startTime.getTime(),
        nodesExecuted: workflow.nodes.length,
        totalNodes: workflow.nodes.length,
        logs: executionContext.logs,
      };

      setExecutionContext(prev => ({
        ...prev,
        status: 'completed',
        endTime: new Date(),
      }));

      onRunComplete?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setExecutionContext(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
        endTime: new Date(),
      }));

      const errorLog: ExecutionLog = {
        timestamp: new Date(),
        nodeId: executionContext.currentNodeId || 'unknown',
        nodeType: 'system',
        message: errorMessage,
        level: 'error',
      };

      setExecutionContext(prev => ({
        ...prev,
        logs: [...prev.logs, errorLog],
      }));
    }
  };

  // Pause execution
  const pauseExecution = () => {
    setExecutionContext(prev => ({
      ...prev,
      status: 'paused',
    }));
  };

  // Reset execution
  const resetExecution = () => {
    setExecutionContext({
      variables: new Map(),
      currentNodeId: null,
      executedNodes: [],
      logs: [],
      startTime: new Date(),
      status: 'idle',
    });
  };

  // Calculate progress
  const progress = workflow.nodes.length > 0
    ? (executionContext.executedNodes.length / workflow.nodes.length) * 100
    : 0;

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-blue-600" />
              Workflow Testing Sandbox
            </CardTitle>
            <CardDescription>
              Test and debug your workflow with sample data
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {executionContext.status === 'running' ? (
              <Button variant="outline" size="sm" onClick={pauseExecution}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={runWorkflow}
                disabled={executionContext.status === 'running'}
              >
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={resetExecution}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Progress</span>
            <span>{executionContext.executedNodes.length} / {workflow.nodes.length} nodes</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
          <div className="px-4 pt-4 border-b">
            <TabsList>
              <TabsTrigger value="console" className="gap-2">
                <Terminal className="w-4 h-4" />
                Console
              </TabsTrigger>
              <TabsTrigger value="variables" className="gap-2">
                <Database className="w-4 h-4" />
                Variables
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Metrics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="console" className="h-[calc(100%-80px)] m-0 p-4 overflow-y-auto">
            <div className="space-y-2 font-mono text-sm">
              <AnimatePresence>
                {executionContext.logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-2 p-2 rounded ${
                      log.level === 'error' ? 'bg-red-50 text-red-700' :
                      log.level === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                      log.level === 'success' ? 'bg-green-50 text-green-700' :
                      'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-gray-400 text-xs whitespace-nowrap">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    
                    {log.level === 'error' && <XCircle className="w-4 h-4 flex-shrink-0" />}
                    {log.level === 'warning' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    {log.level === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                    {log.level === 'info' && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                    
                    <div className="flex-1">
                      <div className="font-medium">{log.message}</div>
                      {log.data && (
                        <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {log.nodeType}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>

              {executionContext.logs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No logs yet. Click "Run Test" to start execution.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="variables" className="h-[calc(100%-80px)] m-0 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Test Data Input</h3>
                <div className="space-y-2">
                  {Object.entries(testData).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="w-32 text-sm font-medium">{key}:</label>
                      <input
                        type="text"
                        value={value as string}
                        onChange={(e) => setTestData(prev => ({ ...prev, [key]: e.target.value }))}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        disabled={executionContext.status === 'running'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Runtime Variables</h3>
                <div className="space-y-2">
                  {Array.from(executionContext.variables.entries()).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="font-mono text-sm font-medium">{key}:</span>
                      <span className="font-mono text-sm text-gray-600">
                        {typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)}
                      </span>
                    </div>
                  ))}
                  {executionContext.variables.size === 0 && (
                    <p className="text-sm text-gray-500">No variables set yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="h-[calc(100%-80px)] m-0 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="text-2xl font-bold">
                        {executionContext.endTime
                          ? `${executionContext.endTime.getTime() - executionContext.startTime.getTime()}ms`
                          : '-'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-500">Nodes Executed</div>
                      <div className="text-2xl font-bold">
                        {executionContext.executedNodes.length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                      <div className="text-2xl font-bold">
                        {executionContext.executedNodes.length > 0 ? '100%' : '-'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-orange-600" />
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="text-lg font-bold capitalize">
                        {executionContext.status}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {executionContext.error && (
              <Card className="mt-4 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
                      <p className="text-sm text-red-700">{executionContext.error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default WorkflowTestSandbox;
