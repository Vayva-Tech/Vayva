import React from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'tiktok' | 'pinterest' | 'facebook';
  contentUrl: string;
  thumbnailUrl?: string;
  caption: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  products: Array<{
    productId: string;
    name: string;
    price: number;
  }>;
  status: 'published' | 'scheduled' | 'draft';
  scheduledAt?: Date;
}

export interface SocialCommerceProps {
  posts?: SocialPost[];
  onSchedulePost?: () => void;
}

export const SocialCommerce: React.FC<SocialCommerceProps> = ({
  posts = [],
  onSchedulePost,
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '📸';
      case 'tiktok':
        return '🎵';
      case 'pinterest':
        return '📌';
      case 'facebook':
        return '📘';
      default:
        return '📱';
    }
  };

  const getTotalEngagement = (post: SocialPost) => {
    return post.engagement.likes + post.engagement.comments + post.engagement.shares + post.engagement.saves;
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Social Commerce</h2>
        {onSchedulePost && (
          <button
            onClick={onSchedulePost}
            className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            📅 Schedule Post
          </button>
        )}
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { platform: 'Instagram', icon: '📸', posts: 12, engagement: 8.5 },
          { platform: 'TikTok', icon: '🎵', posts: 8, engagement: 12.3 },
          { platform: 'Pinterest', icon: '📌', posts: 24, engagement: 6.2 },
          { platform: 'Facebook', icon: '📘', posts: 6, engagement: 4.1 },
        ].map((stat) => (
          <div key={stat.platform} className="bg-white/3 rounded-lg p-4 border border-white/8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-sm font-medium text-white">{stat.platform}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/60">{stat.posts} posts</p>
              <p className="text-xs text-emerald-400 font-medium">{stat.engagement}% engagement</p>
            </div>
          </div>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white/3 rounded-xl overflow-hidden border border-white/8 hover:border-pink-400/30 transition-all"
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-gradient-to-br from-pink-400/20 to-purple-400/20 flex items-center justify-center relative">
              <span className="text-4xl opacity-50">👗</span>
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
                {getPlatformIcon(post.platform)}
              </div>
              {post.products.length > 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-rose-400 rounded text-xs text-white">
                  🛍️ {post.products.length} products
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-white/80 line-clamp-2 mb-3">{post.caption}</p>

              {/* Engagement */}
              <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                <span>❤️ {post.engagement.likes.toLocaleString()}</span>
                <span>💬 {post.engagement.comments}</span>
                <span>↗️ {post.engagement.shares}</span>
                <span>🔖 {post.engagement.saves}</span>
              </div>

              {/* Products */}
              {post.products.length > 0 && (
                <div className="space-y-2 mb-3">
                  {post.products.slice(0, 2).map((product) => (
                    <div key={product.productId} className="flex justify-between items-center">
                      <span className="text-xs text-white/70 truncate">{product.name}</span>
                      <span className="text-xs font-medium text-white">${product.price}</span>
                    </div>
                  ))}
                  {post.products.length > 2 && (
                    <p className="text-xs text-white/50">+{post.products.length - 2} more</p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    post.status === 'published'
                      ? 'bg-emerald-400/20 text-emerald-400'
                      : post.status === 'scheduled'
                      ? 'bg-blue-400/20 text-blue-400'
                      : 'bg-amber-400/20 text-amber-400'
                  }`}
                >
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
                <button className="text-xs text-white/60 hover:text-white transition-colors">
                  View →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};

export default SocialCommerce;
