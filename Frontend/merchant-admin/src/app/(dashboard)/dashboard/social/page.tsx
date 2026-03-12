"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  RefreshCw,
  Plus,
  Calendar,
  BarChart3,
  Link2,
  ImageIcon,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  ShoppingBag,
  Users,
} from "lucide-react";

// Types
interface SocialChannel {
  id: string;
  platform: "instagram" | "facebook" | "twitter" | "tiktok" | "pinterest" | "linkedin";
  accountName: string;
  accountId: string;
  status: "connected" | "disconnected" | "expired";
  followerCount: number;
  lastSyncAt?: string;
  permissions: string[];
}

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls: string[];
  platforms: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledAt: string;
  publishedAt?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
  };
  productsTagged: string[];
}

interface ProductSync {
  productId: string;
  productName: string;
  syncedTo: string[];
  lastSyncedAt: string;
  syncStatus: "synced" | "pending" | "failed";
  socialUrl?: string;
}

interface SocialStats {
  totalFollowers: number;
  totalEngagement: number;
  conversionRate: number;
  revenueGenerated: number;
  postsThisMonth: number;
  clicksThisMonth: number;
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: Share2,
  pinterest: ImageIcon,
  linkedin: Linkedin,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  tiktok: "bg-black",
  pinterest: "bg-red-600",
  linkedin: "bg-blue-700",
};

export default function SocialCommerceDashboard() {
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [syncedProducts, setSyncedProducts] = useState<ProductSync[]>([]);
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [channelsRes, postsRes, productsRes, statsRes] = await Promise.all([
        apiJson<{ channels: SocialChannel[] }>("/api/social/channels"),
        apiJson<{ posts: ScheduledPost[] }>("/api/social/posts"),
        apiJson<{ products: ProductSync[] }>("/api/social/synced-products"),
        apiJson<SocialStats>("/api/social/stats"),
      ]);

      setChannels(channelsRes.channels || []);
      setPosts(postsRes.posts || []);
      setSyncedProducts(productsRes.products || []);
      setStats(statsRes);
    } catch (error) {
      logger.error("[Social] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectChannel = async (platform: string) => {
    try {
      const res = await apiJson<{ authUrl: string }>("/api/social/connect", {
        method: "POST",
        body: JSON.stringify({ platform }),
      });
      window.location.href = res.authUrl;
    } catch (error) {
      logger.error("[Social] Connect failed:", { error });
    }
  };

  const handleCreatePost = async (data: {
    content: string;
    platforms: string[];
    scheduledAt: string;
    products: string[];
  }) => {
    try {
      await apiJson("/api/social/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      logger.error("[Social] Create post failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Social Commerce</h1>
          <p className="text-muted-foreground mt-1">
            Sync products, schedule posts, and track engagement across social platforms
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Social Post</DialogTitle>
            </DialogHeader>
            <CreatePostForm
              channels={channels}
              onSubmit={handleCreatePost}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Users className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Followers</p>
                  <p className="text-2xl font-bold">{stats.totalFollowers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.revenueGenerated)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connected Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Connected Channels
          </CardTitle>
          <CardDescription>Manage your social media connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["instagram", "facebook", "twitter", "tiktok", "pinterest", "linkedin"].map((platform) => {
              const channel = channels.find((c) => c.platform === platform);
              const isConnected = channel?.status === "connected";

              return (
                <button
                  key={platform}
                  onClick={() => !isConnected && handleConnectChannel(platform)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    isConnected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-dashed border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${PLATFORM_COLORS[platform]} flex items-center justify-center text-white mx-auto mb-2`}>
                    {(() => {
                      const Icon = PLATFORM_ICONS[platform];
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <p className="text-sm font-medium capitalize">{platform}</p>
                  {isConnected ? (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs text-emerald-600">
                        {channel.followerCount.toLocaleString()} followers
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Click to connect</p>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="products">Synced Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-1">
                      {post.platforms.map((p) => (
                        <div
                          key={p}
                          className={`w-8 h-8 rounded ${PLATFORM_COLORS[p]} flex items-center justify-center text-white`}
                        >
                          {(() => {
                            const Icon = PLATFORM_ICONS[p];
                            return <Icon className="w-4 h-4" />;
                          })()}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={post.status === "published" ? "default" : "outline"}
                          className={
                            post.status === "published"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : post.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : ""
                          }
                        >
                          {post.status === "published" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {post.status === "scheduled" && <Clock className="w-3 h-3 mr-1" />}
                          {post.status === "failed" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.status === "published"
                            ? `Published ${new Date(post.publishedAt!).toLocaleDateString()}`
                            : `Scheduled for ${new Date(post.scheduledAt).toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                    {post.engagement && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.engagement.clicks}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.engagement.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.engagement.comments}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {posts.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No posts scheduled yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first post
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Synced Products</CardTitle>
              <CardDescription>Products automatically synced to your social shops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Synced To</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Last Sync</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {syncedProducts.map((product) => (
                      <tr key={product.productId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{product.productName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {product.syncedTo.map((platform) => {
                              const Icon = PLATFORM_ICONS[platform];
                              return (
                                <div
                                  key={platform}
                                  className={`w-6 h-6 rounded ${PLATFORM_COLORS[platform]} flex items-center justify-center text-white`}
                                >
                                  <Icon className="w-3 h-3" />
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(product.lastSyncedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={product.syncStatus === "synced" ? "default" : "outline"}
                            className={
                              product.syncStatus === "synced"
                                ? "bg-emerald-100 text-emerald-800"
                                : product.syncStatus === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {product.syncStatus.charAt(0).toUpperCase() + product.syncStatus.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {syncedProducts.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No products synced yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Top Performing Platforms</h4>
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded ${PLATFORM_COLORS[channel.platform]} flex items-center justify-center text-white`}>
                          {(() => {
                            const Icon = PLATFORM_ICONS[channel.platform];
                            return <Icon className="w-4 h-4" />;
                          })()}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{channel.platform}</p>
                          <p className="text-sm text-muted-foreground">
                            {channel.followerCount.toLocaleString()} followers
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(0)}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">This Month</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <p className="text-2xl font-bold">{stats?.postsThisMonth || 0}</p>
                      <p className="text-sm text-muted-foreground">Posts Published</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-2xl font-bold">{stats?.clicksThisMonth || 0}</p>
                      <p className="text-sm text-muted-foreground">Link Clicks</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Create Post Form Component
function CreatePostForm({
  channels,
  onSubmit,
  onCancel,
}: {
  channels: SocialChannel[];
  onSubmit: (data: {
    content: string;
    platforms: string[];
    scheduledAt: string;
    products: string[];
  }) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      content,
      platforms: selectedPlatforms,
      scheduledAt,
      products: selectedProducts,
    });
  };

  const connectedChannels = channels.filter((c) => c.status === "connected");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content..."
          className="mt-1.5 min-h-[100px]"
        />
      </div>

      <div>
        <Label>Platforms</Label>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {connectedChannels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => {
                setSelectedPlatforms((prev) =>
                  prev.includes(channel.platform)
                    ? prev.filter((p) => p !== channel.platform)
                    : [...prev, channel.platform]
                );
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                selectedPlatforms.includes(channel.platform)
                  ? "border-emerald-500 bg-emerald-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className={`w-5 h-5 rounded ${PLATFORM_COLORS[channel.platform]} flex items-center justify-center text-white`}>
                {(() => {
                  const Icon = PLATFORM_ICONS[channel.platform];
                  return <Icon className="w-3 h-3" />;
                })()}
              </div>
              <span className="capitalize">{channel.platform}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Schedule</Label>
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!content || selectedPlatforms.length === 0}
        >
          <Send className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
      </div>
    </form>
  );
}
