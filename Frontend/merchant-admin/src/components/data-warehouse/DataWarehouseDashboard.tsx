/**
 * Data Warehouse Dashboard
 * Query interface, pipeline monitoring, and dataset management
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Play,
  Save,
  History,
  Table,
  ChartBar,
  Clock,
  Warning,
  CheckCircle,
  XCircle,
  Code,
  Download,
  Upload,
  Filter,
  MagnifyingGlass
} from '@phosphor-icons/react';
import { useSWR } from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface QueryHistory {
  id: string;
  query: string;
  timestamp: string;
  status: 'success' | 'failed' | 'running';
  executionTime: number; // ms
  rowsReturned: number;
  dataSize: number; // bytes
}

interface PipelineStatus {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'failed' | 'completed';
  lastRun: string;
  nextRun: string;
  recordsProcessed: number;
  errors: number;
  duration: number; // seconds
}

interface Dataset {
  id: string;
  name: string;
  tableName: string;
  rowCount: number;
  size: number; // bytes
  lastUpdated: string;
  freshness: 'fresh' | 'stale' | 'critical';
  source: string;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
  dataSize: number;
}

// Main Data Warehouse Dashboard
export default function DataWarehouseDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'query' | 'pipelines' | 'datasets'>('query');
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch query history
  const { data: history, isLoading: historyLoading } = useSWR<QueryHistory[]>(
    '/api/data-warehouse/history',
    async (url: string) => {
      try {
        const response = await apiJson<{ history: QueryHistory[] }>(url);
        return response.history || [];
      } catch (error) {
        console.error('Failed to fetch query history:', error);
        return [];
      }
    }
  );

  // Fetch pipeline status
  const { data: pipelines, isLoading: pipelinesLoading } = useSWR<PipelineStatus[]>(
    '/api/data-pipeline/status',
    async (url: string) => {
      try {
        const response = await apiJson<{ pipelines: PipelineStatus[] }>(url);
        return response.pipelines || [];
      } catch (error) {
        console.error('Failed to fetch pipeline status:', error);
        return [];
      }
    }
  );

  // Fetch datasets
  const { data: datasets, isLoading: datasetsLoading } = useSWR<Dataset[]>(
    '/api/data-warehouse/datasets',
    async (url: string) => {
      try {
        const response = await apiJson<{ datasets: Dataset[] }>(url);
        return response.datasets || [];
      } catch (error) {
        console.error('Failed to fetch datasets:', error);
        return [];
      }
    }
  );

  const tabs = [
    { id: 'query', label: 'Query Editor', icon: <Code className="h-4 w-4" /> },
    { id: 'pipelines', label: 'Data Pipelines', icon: <Clock className="h-4 w-4" /> },
    { id: 'datasets', label: 'Datasets', icon: <Table className="h-4 w-4" /> }
  ];

  // Execute query function
  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsExecuting(true);
    setQueryResults(null);

    try {
      const response = await apiJson<QueryResult>('/api/data-warehouse/query', {
        method: 'POST',
        body: JSON.stringify({ query })
      });

      setQueryResults(response);
      toast.success(`Query executed successfully! Returned ${response.rowCount} rows`);
    } catch (error: any) {
      toast.error(`Query failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Data Warehouse"
        subtitle="Query your data, monitor pipelines, and manage datasets"
        industry={store?.industrySlug || 'default'}
        icon={<Database className="h-8 w-8" />}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'query' && (
        <QueryEditor 
          query={query}
          setQuery={setQuery}
          isExecuting={isExecuting}
          onExecute={executeQuery}
          results={queryResults}
          history={history || []}
          historyLoading={historyLoading}
          textareaRef={textareaRef}
          onAdjustHeight={adjustTextareaHeight}
        />
      )}
      
      {activeTab === 'pipelines' && (
        <PipelineMonitor 
          pipelines={pipelines || []}
          loading={pipelinesLoading}
        />
      )}
      
      {activeTab === 'datasets' && (
        <DatasetManager 
          datasets={datasets || []}
          loading={datasetsLoading}
        />
      )}
    </div>
  );
}

// Query Editor Component
function QueryEditor({ 
  query, 
  setQuery, 
  isExecuting, 
  onExecute, 
  results, 
  history, 
  historyLoading,
  textareaRef,
  onAdjustHeight
}: any) {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Query Editor */}
      <div className="lg:col-span-2 space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Code className="h-5 w-5" />
              SQL Query Editor
            </h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                <Save className="h-4 w-4" />
                Save
              </button>
              <button 
                onClick={onExecute}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {isExecuting ? 'Running...' : 'Execute'}
              </button>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onAdjustHeight();
              }}
              placeholder="Enter your SQL query here..."
              className="w-full min-h-[200px] p-4 border border-border rounded-lg bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  onExecute();
                }
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              Press ⌘ + Enter to execute
            </div>
          </div>
        </ThemedCard>

        {/* Query Results */}
        {results && (
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Query Results</h3>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{results.rowCount} rows</span>
                <span>{results.executionTime}ms</span>
                <span>{(results.dataSize / 1024).toFixed(1)}KB</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {results.columns.map((col: string) => (
                      <th key={col} className="text-left py-2 px-3 font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.rows.slice(0, 10).map((row: any, rowIndex: number) => (
                    <tr key={rowIndex} className="border-b border-border hover:bg-muted/30">
                      {results.columns.map((col: string) => (
                        <td key={col} className="py-2 px-3">
                          {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {results.rows.length > 10 && (
                <div className="mt-3 text-center text-sm text-muted-foreground">
                  Showing 10 of {results.rows.length} rows
                </div>
              )}
            </div>
          </ThemedCard>
        )}
      </div>

      {/* Query History */}
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Queries
        </h3>
        
        {historyLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((item: QueryHistory) => {
              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
                  case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
                  case 'running': return <Clock className="h-4 w-4 text-blue-600" />;
                  default: return <Clock className="h-4 w-4 text-gray-600" />;
                }
              };

              return (
                <div 
                  key={item.id}
                  className="p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setQuery(item.query)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {item.rowsReturned} rows
                    </span>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground truncate">
                    {item.query}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </ThemedCard>
    </div>
  );
}

// Pipeline Monitor Component
function PipelineMonitor({ pipelines, loading }: { pipelines: PipelineStatus[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Pipelines
        </h3>
        
        <div className="space-y-4">
          {pipelines.map((pipeline, index) => (
            <motion.div
              key={pipeline.id}
              className="p-4 border border-border rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium">{pipeline.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pipeline.status === 'running' ? 'bg-green-100 text-green-800' :
                  pipeline.status === 'failed' ? 'bg-red-100 text-red-800' :
                  pipeline.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="text-muted-foreground">Records Processed</p>
                  <p className="font-medium">{pipeline.recordsProcessed?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Errors</p>
                  <p className={pipeline.errors > 0 ? 'font-medium text-red-600' : 'font-medium'}>
                    {pipeline.errors || 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{pipeline.duration || 0}s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Run</p>
                  <p className="font-medium">{new Date(pipeline.lastRun).toLocaleTimeString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors">
                  View Logs
                </button>
                <button className="px-3 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors">
                  Run Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </ThemedCard>

      <ThemedCard industry={store?.industrySlug || 'default'}>
        <h3 className="font-semibold mb-6">Pipeline Health</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Success Rate</h4>
            <div className="w-full bg-muted rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full" 
                style={{ width: '94%' }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">94% of pipelines running successfully</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Processing Volume</h4>
            <div className="space-y-2">
              {[
                { name: 'Sales Data', value: 125000, unit: 'records' },
                { name: 'Customer Events', value: 89000, unit: 'events' },
                { name: 'Product Catalog', value: 15600, unit: 'items' }
              ].map((item, index) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span>{item.value.toLocaleString()} {item.unit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(item.value / 125000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ThemedCard>
    </div>
  );
}

// Dataset Manager Component
function DatasetManager({ datasets, loading }: { datasets: Dataset[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return 'bg-green-100 text-green-800';
      case 'stale': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {datasets.map((dataset, index) => (
        <motion.div
          key={dataset.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium">{dataset.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFreshnessColor(dataset.freshness)}`}>
                {dataset.freshness}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rows</span>
                <span className="font-medium">{dataset.rowCount?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span className="font-medium">{(dataset.size / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{dataset.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">{new Date(dataset.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                <Table className="h-4 w-4 mx-auto" />
              </button>
              <button className="flex-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                <Download className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}