// @ts-nocheck
/**
 * Social Hub & Community Features
 * Integrated social media management and community engagement tools
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ChatCircle,
  Heart,
  Share,
  TrendUp,
  Calendar,
  Bell,
  GearSix,
  Plus,
  MagnifyingGlass,
  Funnel,
  Globe,
  TwitterLogo,
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
  YoutubeLogo,
  TiktokLogo,
  WhatsappLogo,
  TelegramLogo,
  DiscordLogo,
  Smiley,
  ChartBar,
  ChartPie,
  Pulse,
  DotsThree
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface SocialPost {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok';
  content: string;
  mediaUrl?: string;
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metrics: {
    likes: number;
    shares: number;
    comments: number;
    impressions: number;
    reach: number;
  };
  createdAt: string;
  publishedAt?: string;
}

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: 'member' | 'moderator' | 'admin';
  joinDate: string;
  posts: number;
  engagementScore: number;
  lastActive: string;
  badges: string[];
}

interface EngagementActivity {
  id: string;
  type: 'like' | 'comment' | 'share' | 'follow' | 'mention';
  user: string;
  content: string;
  timestamp: string;
  platform: string;
}

interface SocialMetrics {
  totalFollowers: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPerformingPosts: number;
  communityGrowth: number;
  sentimentScore: number;
}

// Helper functions used across sub-components
function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'twitter': return <TwitterLogo className="h-5 w-5 text-blue-400" />;
    case 'instagram': return <InstagramLogo className="h-5 w-5 text-pink-500" />;
    case 'facebook': return <FacebookLogo className="h-5 w-5 text-blue-600" />;
    case 'linkedin': return <LinkedinLogo className="h-5 w-5 text-blue-700" />;
    case 'youtube': return <YoutubeLogo className="h-5 w-5 text-red-600" />;
    case 'tiktok': return <TiktokLogo className="h-5 w-5 text-black" />;
    default: return <Globe className="h-5 w-5 text-gray-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Main Social Hub Component
export default function SocialHub() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'posts' | 'community' | 'analytics' | 'schedule'>('posts');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch social metrics
  const { data: metrics, isLoading: metricsLoading } = useSWR<SocialMetrics>(
    '/api/social-hub/metrics',
    async (url: string) => {
      try {
        const response = await apiJson<SocialMetrics>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch social metrics:', error);
        toast.error('Failed to load social hub data');
        return null;
      }
    }
  );

  // Fetch posts
  const { data: posts, isLoading: postsLoading } = useSWR<SocialPost[]>(
    '/api/social-hub/posts',
    async (url: string) => {
      try {
        const response = await apiJson<{ posts: SocialPost[] }>(url);
        return response.posts || [];
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [];
      }
    }
  );

  // Fetch community members
  const { data: members, isLoading: membersLoading } = useSWR<CommunityMember[]>(
    '/api/social-hub/community',
    async (url: string) => {
      try {
        const response = await apiJson<{ members: CommunityMember[] }>(url);
        return response.members || [];
      } catch (error) {
        console.error('Failed to fetch community:', error);
        return [];
      }
    }
  );

  // Filter posts based on search
  const filteredPosts = posts?.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.platform.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const tabs = [
    { id: 'posts', label: 'Content', icon: <ChatCircle className="h-4 w-4" /> },
    { id: 'community', label: 'Community', icon: <Users className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <ChartBar className="h-4 w-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Social Hub"
        subtitle="Manage social media, engage community, and track performance"
        industry={store?.industrySlug || 'default'}
        icon={<Users className="h-8 w-8" />}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
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
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      {!metricsLoading && metrics && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Followers</p>
                <p className="text-lg font-bold" style={{ color: colors.primary }}>
                  {(metrics.totalFollowers / 1000).toFixed(1)}K
                </p>
              </div>
              <Users className="h-5 w-5 text-gray-500" />
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Engagement</p>
                <p className="text-lg font-bold" style={{ color: colors.secondary }}>
                  {(metrics.totalEngagement / 1000).toFixed(1)}K
                </p>
              </div>
              <Heart className="h-5 w-5 text-gray-500" />
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Engagement Rate</p>
                <p className="text-lg font-bold" style={{ color: colors.accent }}>
                  {metrics.avgEngagementRate}%
                </p>
              </div>
              <TrendUp className="h-5 w-5 text-gray-500" />
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Top Posts</p>
                <p className="text-lg font-bold" style={{ color: colors.primary }}>
                  {metrics.topPerformingPosts}
                </p>
              </div>
              <ChartBar className="h-5 w-5 text-gray-500" />
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Growth</p>
                <p className="text-lg font-bold" style={{ color: colors.secondary }}>
                  +{metrics.communityGrowth}%
                </p>
              </div>
              <Pulse className="h-5 w-5 text-gray-500" />
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Sentiment</p>
                <p className="text-lg font-bold" style={{ color: colors.accent }}>
                  {metrics.sentimentScore}/10
                </p>
              </div>
              <Smiley className="h-5 w-5 text-gray-500" />
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search posts, platforms, or content..."
          className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <PostsView 
          posts={filteredPosts}
          loading={postsLoading}
          selectedPost={selectedPost}
          onSelectPost={setSelectedPost}
        />
      )}
      
      {activeTab === 'community' && (
        <CommunityView 
          members={members || []}
          loading={membersLoading}
        />
      )}
      
      {activeTab === 'analytics' && (
        <AnalyticsView metrics={metrics} loading={metricsLoading} />
      )}
      
      {activeTab === 'schedule' && (
        <ScheduleView />
      )}
    </div>
  );
}

// Posts View Component
function PostsView({ posts, loading, selectedPost, onSelectPost }: any) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post: SocialPost, index: number) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard 
            industry={store?.industrySlug || 'default'}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPost === post.id ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => onSelectPost(post.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getPlatformIcon(post.platform)}
                <span className="font-medium capitalize">{post.platform}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                {post.status}
              </span>
            </div>
            
            <p className="text-gray-500 mb-4 line-clamp-3">{post.content}</p>
            
            {post.mediaUrl && (
              <div className="mb-4">
                <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-500" />
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              {post.scheduledFor && (
                <span>Scheduled: {new Date(post.scheduledFor).toLocaleDateString()}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {post.metrics.likes?.toLocaleString() || '0'}
                </span>
                <span className="flex items-center gap-1">
                  <Share className="h-4 w-4 text-blue-500" />
                  {post.metrics.shares?.toLocaleString() || '0'}
                </span>
                <span className="flex items-center gap-1">
                  <ChatCircle className="h-4 w-4 text-green-500" />
                  {post.metrics.comments?.toLocaleString() || '0'}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <DotsThree className="h-4 w-4" />
              </button>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Community View Component
function CommunityView({ members, loading }: { members: CommunityMember[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {members.map((member: CommunityMember, index: number) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-accent/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: getThemeColors(store?.industrySlug || 'default').primary }}>
                  {member.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold">{member.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                {member.role}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Posts:</span>
                <span className="font-medium">{member.posts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Engagement:</span>
                <span className="font-medium">{member.engagementScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Joined:</span>
                <span>{new Date(member.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            {member.badges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Badges:</p>
                <div className="flex flex-wrap gap-1">
                  {member.badges.slice(0, 3).map((badge: string) => (
                    <span key={badge} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ metrics, loading }: { metrics: SocialMetrics | null; loading: boolean }) {
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
          <h3 className="font-semibold mb-6">Social Media Performance</h3>
          <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl border border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <ChartBar className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <p className="font-medium">Engagement Trends</p>
              <p className="text-sm text-gray-500 mt-1">
                Avg Rate: {metrics.avgEngagementRate}% | Top Posts: {metrics.topPerformingPosts}
              </p>
            </div>
          </div>
        </ThemedCard>
      </div>

      {/* Metrics Sidebar */}
      <div className="space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Platform Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <TwitterLogo className="h-4 w-4 text-blue-400" />
                <span className="text-gray-500">Twitter</span>
              </div>
              <span className="font-bold">24.5K followers</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <InstagramLogo className="h-4 w-4 text-pink-500" />
                <span className="text-gray-500">Instagram</span>
              </div>
              <span className="font-bold">18.2K followers</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <FacebookLogo className="h-4 w-4 text-blue-600" />
                <span className="text-gray-500">Facebook</span>
              </div>
              <span className="font-bold">32.1K followers</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <LinkedinLogo className="h-4 w-4 text-blue-700" />
                <span className="text-gray-500">LinkedIn</span>
              </div>
              <span className="font-bold">15.8K followers</span>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Likes Rate</span>
                <span>4.2%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: '42%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Share Rate</span>
                <span>1.8%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: '18%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Comment Rate</span>
                <span>2.1%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: '21%' }}
                />
              </div>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
              Create Post
            </button>
            <button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Schedule Content
            </button>
            <button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Analyze Performance
            </button>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}

// Schedule View Component
function ScheduleView() {
  const { store } = useStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Content Calendar</h3>
            <button className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              Schedule Post
            </button>
          </div>
          
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Dec {15 + i}, 2024</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Scheduled</span>
                </div>
                <p className="text-gray-500 text-sm mb-2">
                  "Exciting news coming soon! Stay tuned for our biggest announcement yet..."
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <TwitterLogo className="h-3 w-3 text-blue-400" />
                    Twitter
                  </span>
                  <span>10:00 AM</span>
                  <span>324 engagements expected</span>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>
      </div>
      
      <div className="space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Upcoming Posts</h3>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium mb-1">Holiday Promotion #{i}</p>
                <p className="text-xs text-gray-500">Tomorrow at 9:00 AM</p>
              </div>
            ))}
          </div>
        </ThemedCard>
        
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Best Times to Post</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monday</span>
              <span className="font-medium">9:00 AM - 11:00 AM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Wednesday</span>
              <span className="font-medium">2:00 PM - 4:00 PM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Friday</span>
              <span className="font-medium">10:00 AM - 12:00 PM</span>
            </div>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}