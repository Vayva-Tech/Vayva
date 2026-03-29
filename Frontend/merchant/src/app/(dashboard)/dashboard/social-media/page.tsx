'use client';

/**
 * Social Media Management Dashboard
 * Central hub for managing all social platform integrations
 */

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import {
  TelegramLogo,
  DiscordLogo,
  CheckCircle,
  Warning,
  Plug,
  Gear,
  ChartLine,
  Users,
  ChatCircle as MessageCircle,
  TrendUp,
  Bell,
  Eye
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { CompleteSocialIntegrationManager } from "@/components/onboarding/CompleteSocialIntegrationManager";

interface SocialConnection {
  id: string;
  platform: string;
  accountName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  createdAt: string;
  lastActive: string;
}

interface SocialStats {
  platform: string;
  messages: number;
  conversions: number;
  engagement: number;
  growth: number;
}

interface SocialDashboardData {
  connections: SocialConnection[];
  stats: SocialStats[];
  summary: {
    totalConnected: number;
    totalPlatforms: number;
    totalMessages: number;
    totalConversions: number;
  };
}

export default function SocialMediaDashboard() {
  const [dashboardData, setDashboardData] = useState<SocialDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'analytics'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const result = await apiJson<{
        success?: boolean;
        data?: {
          connections: Array<{
            id: string;
            platform: string;
            accountName: string | null;
            status: string;
            createdAt: string;
            lastActive: string | null;
          }>;
          stats: Array<{
            platform: string;
            messages: number;
            conversions: number;
            engagement: number;
          }>;
          summary: { totalConnected: number; totalPlatforms: number };
        };
      }>("/social-connections");

      const raw = result?.data;
      if (result?.success === false || !raw) {
        throw new Error("Invalid social connections response");
      }

      const stats: SocialStats[] = raw.stats.map((s) => ({
        platform: s.platform,
        messages: s.messages,
        conversions: s.conversions,
        engagement: s.engagement,
        growth: 0,
      }));

      const connections: SocialConnection[] = raw.connections.map((c) => ({
        id: c.id,
        platform: c.platform,
        accountName: c.accountName ?? "",
        status:
          c.status === "CONNECTED"
            ? "CONNECTED"
            : c.status === "ERROR"
              ? "ERROR"
              : "DISCONNECTED",
        createdAt: c.createdAt,
        lastActive: c.lastActive ?? c.createdAt,
      }));

      const totalMessages = stats.reduce((a, s) => a + s.messages, 0);
      const totalConversions = stats.reduce((a, s) => a + s.conversions, 0);

      setDashboardData({
        connections,
        stats,
        summary: {
          ...raw.summary,
          totalMessages,
          totalConversions,
        },
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
      logger.error("[SOCIAL_MEDIA_DASHBOARD_ERROR]", { error });
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionIcon = (platform: string) => {
    switch (platform) {
      case 'telegram': return <TelegramLogo className="w-6 h-6" />;
      case 'discord': return <DiscordLogo className="w-6 h-6" />;
      default: return <Plug className="w-6 h-6" />;
    }
  };

  const getConnectionColor = (platform: string) => {
    switch (platform) {
      case 'telegram': return 'bg-blue-500';
      case 'discord': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'text-green-600 bg-green-50';
      case 'ERROR': return 'text-red-600 bg-red-50';
      default: return 'text-orange-600 bg-orange-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED': return <CheckCircle className="w-5 h-5" />;
      case 'ERROR': return <Warning className="w-5 h-5" />;
      default: return <Warning className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading social dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Warning className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load dashboard</h3>
        <p className="text-gray-700 mb-4">There was an error loading your social media data</p>
        <Button onClick={loadDashboardData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Social Media Hub</h1>
          <p className="text-gray-700 mt-1">
            Manage all your social platform integrations and monitor performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-blue-700">
              {dashboardData.summary.totalConnected}/{dashboardData.summary.totalPlatforms} Active
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Gear className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <nav className="flex space-x-8">
          {(['overview', 'integrations', 'analytics'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab}
            </Button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">
                    {dashboardData.summary.totalMessages.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700">Total Messages</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">
                    {dashboardData.summary.totalConversions.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700">Sales Generated</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">
                    {Math.round(dashboardData.summary.totalMessages / 30)}
                  </p>
                  <p className="text-sm text-gray-700">Daily Avg</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">
                    {Math.round((dashboardData.summary.totalConversions / dashboardData.summary.totalMessages) * 100) || 0}%
                  </p>
                  <p className="text-sm text-gray-700">Conversion Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Performance</h2>
            <div className="space-y-4">
              {dashboardData.connections.map((connection) => {
                const stats = dashboardData.stats.find(s => s.platform === connection.platform);
                return (
                  <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`${getConnectionColor(connection.platform)} p-3 rounded-xl text-white`}>
                        {getConnectionIcon(connection.platform)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{connection.accountName}</h3>
                        <p className="text-sm text-gray-700 capitalize">{connection.platform}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {stats && (
                        <>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{stats.messages}</p>
                            <p className="text-xs text-gray-700">Messages</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{stats.conversions}</p>
                            <p className="text-xs text-gray-700">Sales</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-600">{stats.engagement}%</p>
                            <p className="text-xs text-gray-700">Engagement</p>
                          </div>
                        </>
                      )}
                      
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(connection.status)}`}>
                        {getStatusIcon(connection.status)}
                        <span className="ml-1">{connection.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <CompleteSocialIntegrationManager />
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartLine className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-gray-700 max-w-md mx-auto">
              Detailed performance metrics, conversion tracking, and engagement analytics will be available here.
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-green-50 border border-green-500/20 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Button variant="outline" className="justify-start">
            <ChartLine className="w-5 h-5 mr-2 text-green-600" />
            View Detailed Analytics
          </Button>
          <Button variant="outline" className="justify-start">
            <Gear className="w-5 h-5 mr-2 text-green-600" />
            Automation Settings
          </Button>
          <Button variant="outline" className="justify-start">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Team Access
          </Button>
          <Button variant="outline" className="justify-start">
            <Bell className="w-5 h-5 mr-2 text-green-600" />
            Notification Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
