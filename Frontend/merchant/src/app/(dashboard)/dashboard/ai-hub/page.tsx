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
  Trash,
  Plus,
  Download,
  ShareNetwork,
  CheckCircle,
  Clock
} from "@phosphor-icons/react";
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

  // Calculate metrics
  const totalConvs = analytics?.totalConversations || 0;
  const activeConvs = analytics?.activeConversations || 0;
  const convRate = analytics?.conversionRate || 0;
  const totalSales = analytics?.totalSales || 0;
  const avgResponse = analytics?.avgResponseTime || 0;
  const satisfaction = analytics?.satisfactionScore || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Centralized platform for all AI-powered features</p>
        </div>
        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Brain size={28} className="text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Hub</h1>
        </div>
        <p className="text-sm text-gray-500">Centralized platform for all AI-powered features, analytics, and management</p>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<ChatCircle size={18} />}
          label="Active Conversations"
          value={String(activeConvs)}
          trend={`${totalConvs} total`}
          positive={activeConvs > 0}
        />
        <SummaryWidget
          icon={<TrendUp size={18} />}
          label="Total Sales"
          value={formatCurrency(totalSales, 'NGN')}
          trend="generated"
          positive
        />
        <SummaryWidget
          icon={<Lightning size={18} />}
          label="Avg Response Time"
          value={`${avgResponse}s`}
          trend="response speed"
          positive={avgResponse < 30}
        />
        <SummaryWidget
          icon={<Users size={18} />}
          label="Success Rate"
          value={`${convRate}%`}
          trend="conversion"
          positive={convRate > 50}
        />
      </div>
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 w-fit">
        {[
          { id: 'chat', label: 'Live Chat', icon: <ChatCircle size={16} /> },
          { id: 'analytics', label: 'Analytics', icon: <ChartLine size={16} /> },
          { id: 'templates', label: 'Templates', icon: <Copy size={16} /> },
          { id: 'settings', label: 'Settings', icon: <Gear size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
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
          {/* Recent Conversations */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Recent Conversations</h2>
                <p className="text-sm text-gray-500 mt-1">Live AI-powered customer interactions</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
                <Play size={18} className="mr-2" />
                Start New Chat
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {conversations.slice(0, 5).map(conv => (
                <div key={conv.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        conv.status === 'active' ? 'bg-green-500 animate-pulse' :
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
                        {conv.messages} msgs • {conv.duration}s
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
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Total Conversations</span>
                <span className="font-semibold text-gray-900">{totalConvs}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-green-600">{convRate}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-semibold text-gray-900">{satisfaction}/100</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Revenue Generated</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalSales, 'NGN')}
                </span>
              </div>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Platform Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics?.platformDistribution || {}).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between py-2">
                  <span className="capitalize text-gray-700 font-medium">{platform}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all" 
                        style={{ width: `${(count / (totalConvs || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-10 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
              <Download size={18} className="mr-2" />
              Export Report
            </Button>
            <Button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 h-10 rounded-xl font-semibold">
              <ShareNetwork size={18} className="mr-2" />
              Share Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">AI Templates</h2>
              <p className="text-sm text-gray-500 mt-1">Manage conversation templates and responses</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
              <Plus size={18} className="mr-2" />
              New Template
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div key={template.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    template.isActive 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-gray-50 text-gray-600'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="capitalize">{template.category}</span>
                  <span>{template.usageCount} uses</span>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 h-9 rounded-lg font-semibold text-sm">
                    Edit
                  </Button>
                  <Button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 h-9 rounded-lg font-semibold text-sm">
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">AI Configuration</h2>
            
            <div className="space-y-6">
              {/* AI Provider */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Providers</h3>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">OpenRouter (Primary)</p>
                    <p className="text-sm text-gray-600 mt-1">Mistral Large + DeepSeek</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-green-600">Connected</span>
                  </div>
                </div>
              </div>

              {/* Response Configuration */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Response Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Style
                    </label>
                    <select className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Concise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Response Length
                    </label>
                    <input 
                      type="number" 
                      defaultValue="500"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-100">
                <Button onClick={() => toast.success('Settings saved successfully!')} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
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

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}