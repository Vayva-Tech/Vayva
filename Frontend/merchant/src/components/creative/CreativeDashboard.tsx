/**
 * Creative Industry Dashboard
 * Portfolio management, design tools, and creative project tracking
 */
"use client";

import { Button } from "@vayva/ui";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Image,
  Camera,
  Video,
  Pen,
  Folder,
  Eye,
  Heart,
  Share,
  Download,
  Star,
  TrendUp,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface CreativeProject {
  id: string;
  title: string;
  type: 'graphic' | 'video' | 'photography' | 'illustration' | 'ui-design';
  status: 'draft' | 'in-progress' | 'review' | 'completed' | 'published';
  thumbnail: string;
  likes: number;
  views: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  collaborators: string[];
  tags: string[];
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  featured: boolean;
  published: boolean;
  engagement: {
    likes: number;
    views: number;
    comments: number;
    shares: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface ClientFeedback {
  id: string;
  projectId: string;
  clientId: string;
  clientName: string;
  rating: number; // 1-5
  comment: string;
  status: 'pending' | 'reviewed' | 'addressed';
  createdAt: string;
  response?: string;
}

interface CreativeMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  portfolioItems: number;
  totalLikes: number;
  totalViews: number;
  avgEngagement: number;
  clientSatisfaction: number;
}

const EMPTY_CREATIVE_METRICS: CreativeMetrics = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  portfolioItems: 0,
  totalLikes: 0,
  totalViews: 0,
  avgEngagement: 0,
  clientSatisfaction: 0,
};

// Helper functions used across sub-components
function getTypeIcon(type: string) {
  switch (type) {
    case 'graphic': return <Palette className="h-5 w-5 text-purple-600" />;
    case 'video': return <Video className="h-5 w-5 text-red-600" />;
    case 'photography': return <Camera className="h-5 w-5 text-blue-600" />;
    case 'illustration': return <Pen className="h-5 w-5 text-green-600" />;
    case 'ui-design': return <Star className="h-5 w-5 text-orange-600" />;
    default: return <Palette className="h-5 w-5 text-gray-600" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'published': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'review': return 'bg-purple-100 text-purple-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Main Creative Dashboard Component
export default function CreativeDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'projects' | 'portfolio' | 'feedback' | 'analytics'>('projects');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Fetch creative metrics
  const { data: metrics, isLoading: metricsLoading } = useSWR<CreativeMetrics>(
    '/api/creative/metrics',
    async (url: string) => {
      try {
        const response = await apiJson<CreativeMetrics>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch creative metrics:', error);
        toast.error('Failed to load creative dashboard data');
        return EMPTY_CREATIVE_METRICS;
      }
    }
  );

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useSWR<CreativeProject[]>(
    '/api/creative/projects',
    async (url: string) => {
      try {
        const response = await apiJson<{ projects: CreativeProject[] }>(url);
        return response.projects || [];
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        return [];
      }
    }
  );

  // Fetch portfolio items
  const { data: portfolio, isLoading: portfolioLoading } = useSWR<PortfolioItem[]>(
    '/api/creative/portfolio',
    async (url: string) => {
      try {
        const response = await apiJson<{ items: PortfolioItem[] }>(url);
        return response.items || [];
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        return [];
      }
    }
  );

  // Fetch feedback
  const { data: feedback, isLoading: feedbackLoading } = useSWR<ClientFeedback[]>(
    '/api/creative/feedback',
    async (url: string) => {
      try {
        const response = await apiJson<{ feedback: ClientFeedback[] }>(url);
        return response.feedback || [];
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
        return [];
      }
    }
  );

  const tabs = [
    { id: 'projects', label: 'Projects', icon: <Folder className="h-4 w-4" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Image className="h-4 w-4" /> },
    { id: 'feedback', label: 'Client Feedback', icon: <Users className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendUp className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Creative Studio"
        subtitle="Manage projects, showcase portfolio, and track client feedback"
        industry={store?.industrySlug || 'default'}
        icon={<Palette className="h-8 w-8" />}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      {!metricsLoading && metrics && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {metrics.activeProjects}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Folder className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Portfolio Items</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {metrics.portfolioItems}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <Image className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  {(metrics.totalViews / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}15` }}>
                <Eye className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {metrics.clientSatisfaction}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Heart className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'projects' && (
        <ProjectsView 
          projects={projects || []}
          loading={projectsLoading}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />
      )}
      
      {activeTab === 'portfolio' && (
        <PortfolioView 
          portfolio={portfolio || []}
          loading={portfolioLoading}
        />
      )}
      
      {activeTab === 'feedback' && (
        <FeedbackView 
          feedback={feedback || []}
          loading={feedbackLoading}
        />
      )}
      
      {activeTab === 'analytics' && (
        <AnalyticsView metrics={metrics ?? null} loading={metricsLoading} />
      )}
    </div>
  );
}

// Projects View Component
function ProjectsView({ projects, loading, selectedProject, onSelectProject }: any) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project: CreativeProject, index: number) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`cursor-pointer ${selectedProject === project.id ? 'ring-2 ring-green-500 rounded-2xl' : ''}`}
          onClick={() => onSelectProject(project.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectProject(project.id);
            }
          }}
        >
          <ThemedCard 
            industry={store?.industrySlug || 'default'}
            className="transition-all hover:shadow-lg"
          >
            <div className="relative mb-4">
              <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex items-center justify-center">
                {getTypeIcon(project.type)}
              </div>
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <h3 className="font-semibold mb-2">{project.title}</h3>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {project.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{project.collaborators.length} collaborators</span>
              <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {project.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {project.views?.toLocaleString() || '0'}
                </span>
              </div>
              {project.deadline && (
                <span className="text-xs text-gray-500">
                  Due: {new Date(project.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Portfolio View Component
function PortfolioView({ portfolio, loading }: { portfolio: PortfolioItem[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {portfolio.map((item: PortfolioItem, index: number) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="relative mb-3">
              <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex items-center justify-center">
                {item.mediaType === 'video' ? (
                  <Video className="h-8 w-8 text-gray-500" />
                ) : (
                  <Image className="h-8 w-8 text-gray-500" />
                )}
              </div>
              {item.featured && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                  Featured
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {item.published ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{item.category}</span>
              <span>{item.engagement.views?.toLocaleString() || '0'} views</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {item.engagement.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Share className="h-4 w-4 text-blue-500" />
                  {item.engagement.shares}
                </span>
              </div>
              <Button className="p-1 hover:bg-gray-100 rounded">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Feedback View Component
function FeedbackView({ feedback, loading }: { feedback: ClientFeedback[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'addressed': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ThemedCard industry={store?.industrySlug || 'default'}>
      <h3 className="font-semibold mb-6">Client Feedback & Reviews</h3>
      
      <div className="space-y-4">
        {feedback.map((item: ClientFeedback, index: number) => (
          <motion.div
            key={item.id}
            className="p-4 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium">{item.clientName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            
            <p className="text-gray-500 mb-3">{item.comment}</p>
            
            {item.response && (
              <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Your Response:</span> {item.response}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 mt-3">
              <Button className="px-3 py-1 text-sm border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                Respond
              </Button>
              <Button className="px-3 py-1 text-sm border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                Mark Addressed
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </ThemedCard>
  );
}

// Analytics View Component
function AnalyticsView({ metrics, loading }: { metrics: CreativeMetrics | null; loading: boolean }) {
  const { store } = useStore();

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Analytics Chart */}
      <div className="lg:col-span-2">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-6">Performance Trends</h3>
          <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl border border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <TrendUp className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <p className="font-medium">Engagement Analytics</p>
              <p className="text-sm text-gray-500 mt-1">
                Views: {(metrics.totalViews / 1000).toFixed(1)}K | Likes: {metrics.totalLikes?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </ThemedCard>
      </div>

      {/* Metrics Sidebar */}
      <div className="space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Project Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Projects</span>
              <span className="font-bold">{metrics.totalProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Active Projects</span>
              <span className="font-bold text-blue-600">{metrics.activeProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Completed</span>
              <span className="font-bold text-green-600">{metrics.completedProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Portfolio Items</span>
              <span className="font-bold">{metrics.portfolioItems}</span>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Engagement Rate</span>
                <span>{metrics.avgEngagement}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${metrics.avgEngagement}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Client Satisfaction</span>
                <span>{metrics.clientSatisfaction}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${metrics.clientSatisfaction}%` }}
                />
              </div>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
              Create New Project
            </Button>
            <Button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Add Portfolio Item
            </Button>
            <Button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Review Feedback
            </Button>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}