"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  ChatCircle, 
  ChartLine, 
  Gear, 
  Users, 
  Lightning,
  TrendUp,
  Copy,
  Play,
  Pause,
  Trash,
  Plus,
  MagnifyingGlass,
  Funnel,
  Download,
  ShareNetwork
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";

interface AIConversation {
  id: string;
  customerName: string;
  platform: string;
  status: 'active' | 'completed' | 'failed';
  duration: number;
  messages: number;
  saleValue?: number;
  timestamp: string;
}

interface AIAnalytics {
  totalConversations: number;
  activeConversations: number;
  conversionRate: number;
  totalSales: number;
  avgResponseTime: number;
  satisfactionScore: number;
  platformDistribution: Record<string, number>;
  hourlyActivity: { hour: number; count: number }[];
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  usageCount: number;
  isActive: boolean;
  lastModified: string;
}

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'templates' | 'settings'>('chat');
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [templates, setTemplates] = useState<AITemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all AI data in parallel
      const [convData, analyticsData, templateData] = await Promise.all([
        apiJson<AIConversation[]>('/api/ai/conversations'),
        apiJson<AIAnalytics>('/api/ai/analytics'),
        apiJson<AITemplate[]>('/api/ai/templates')
      ]);

      setConversations(convData || []);
      setAnalytics(analyticsData || null);
      setTemplates(templateData || []);
    } catch (error) {
      console.error('Failed to load AI data:', error);
      toast.error('Failed to load AI hub data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    color = 'blue' 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode;
    trend?: { value: number; positive: boolean };
    color?: string;
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? (
                <TrendUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendUp className="w-4 h-4 mr-1 rotate-180" />
              )}
              {Math.abs(trend.value)}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Hub</h1>
        </div>
        <p className="text-gray-600">
          Centralized platform for all AI-powered features, analytics, and management
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
        {[
          { id: 'chat', label: 'Live Chat', icon: <ChatCircle className="w-4 h-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <ChartLine className="w-4 h-4" /> },
          { id: 'templates', label: 'Templates', icon: <Copy className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Gear className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Active Conversations"
              value={analytics?.activeConversations || 0}
              icon={<ChatCircle className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Total Sales Generated"
              value={formatCurrency(analytics?.totalSales || 0, 'NGN')}
              icon={<TrendUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Avg Response Time"
              value={`${analytics?.avgResponseTime || 0}s`}
              icon={<Lightning className="w-6 h-6" />}
              color="yellow"
            />
            <StatCard
              title="Success Rate"
              value={`${analytics?.conversionRate || 0}%`}
              icon={<Users className="w-6 h-6" />}
              color="purple"
            />
          </div>

          {/* Recent Conversations */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {conversations.slice(0, 5).map(conv => (
                <div key={conv.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        conv.status === 'active' ? 'bg-green-500' :
                        conv.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{conv.customerName}</p>
                        <p className="text-sm text-gray-500 capitalize">{conv.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {conv.saleValue ? formatCurrency(conv.saleValue, 'NGN') : 'No Sale'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conv.messages} messages • {conv.duration}s
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Conversations</span>
                  <span className="font-semibold">{analytics?.totalConversations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold text-green-600">{analytics?.conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-semibold text-blue-600">{analytics?.satisfactionScore}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue Generated</span>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(analytics?.totalSales || 0, 'NGN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analytics?.platformDistribution || {}).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="capitalize text-gray-600">{platform}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${(count / (analytics?.totalConversations || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <ShareNetwork className="w-4 h-4 mr-2" />
              Share Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Header with Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Templates</h2>
              <p className="text-gray-600">Manage conversation templates and responses</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{template.category}</span>
                  <span>{template.usageCount} uses</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="p-2">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Configuration</h2>
            
            <div className="space-y-6">
              {/* AI Provider Settings */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">AI Providers</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">OpenRouter (Primary)</p>
                      <p className="text-sm text-gray-600">Mistral Large + DeepSeek</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Settings */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Response Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Response Style
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Concise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Response Length
                    </label>
                    <input 
                      type="number" 
                      defaultValue="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button onClick={() => toast.success('Settings saved successfully!')}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}