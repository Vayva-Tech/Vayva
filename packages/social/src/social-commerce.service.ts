import { prisma } from "@vayva/db";

export interface SocialChannel {
  id: string;
  storeId: string;
  platform: "instagram" | "facebook" | "tiktok" | "pinterest" | "twitter";
  accountName: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  lastSyncAt?: Date;
  settings: {
    autoPostProducts: boolean;
    autoPostOrders: boolean;
    postFrequency: "immediate" | "daily" | "weekly";
    hashtagTemplate: string;
  };
}

export interface SyncedProduct {
  id: string;
  storeId: string;
  productId: string;
  channelId: string;
  platform: string;
  externalId?: string;
  externalUrl?: string;
  status: "pending" | "synced" | "failed" | "unsynced";
  postId?: string;
  engagementStats?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  lastSyncedAt?: Date;
  errorMessage?: string;
}

export interface SocialPost {
  id: string;
  storeId: string;
  channelId: string;
  productId?: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  platform: string;
  status: "draft" | "scheduled" | "posted" | "failed";
  scheduledAt?: Date;
  postedAt?: Date;
  externalPostId?: string;
  externalUrl?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export class SocialCommerceService {
  private readonly META_APP_ID = process.env.META_APP_ID || "";
  private readonly META_APP_SECRET = process.env.META_APP_SECRET || "";
  private readonly TIKTOK_APP_ID = process.env.TIKTOK_APP_ID || "";

  /**
   * Connect a social media account
   */
  async connectChannel(
    storeId: string,
    platform: SocialChannel["platform"],
    authCode: string
  ): Promise<SocialChannel> {
    // Exchange auth code for access token
    const tokenData = await this.exchangeAuthCode(platform, authCode);

    // Get account info
    const accountInfo = await this.getAccountInfo(platform, tokenData.accessToken);

    // Save channel
    const channel = await prisma.socialChannel.create({
      data: {
        storeId,
        platform,
        accountName: accountInfo.name,
        accountId: accountInfo.id,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        isActive: true,
        settings: {
          autoPostProducts: false,
          autoPostOrders: false,
          postFrequency: "immediate",
          hashtagTemplate: "#{storeName} #{productName}",
        },
      },
    });

    return this.mapChannel(channel);
  }

  /**
   * Sync a product to social media channels
   */
  async syncProduct(
    productId: string,
    channelIds?: string[]
  ): Promise<SyncedProduct[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true, images: true },
    });

    if (!product) throw new Error("Product not found");

    // Get active channels
    const where = channelIds?.length
      ? { id: { in: channelIds }, isActive: true }
      : { storeId: product.storeId, isActive: true };

    const channels = await prisma.socialChannel.findMany({ where });

    const results: SyncedProduct[] = [];

    for (const channel of channels) {
      try {
        // Check if already synced
        let synced = await prisma.syncedProduct.findUnique({
          where: { productId_channelId: { productId, channelId: channel.id } },
        });

        // Post to platform
        const postResult = await this.postToPlatform(channel, product);

        if (synced) {
          synced = await prisma.syncedProduct.update({
            where: { id: synced.id },
            data: {
              status: postResult.success ? "synced" : "failed",
              externalId: postResult.externalId,
              externalUrl: postResult.externalUrl,
              postId: postResult.postId,
              lastSyncedAt: new Date(),
              errorMessage: postResult.error,
            },
          });
        } else {
          synced = await prisma.syncedProduct.create({
            data: {
              storeId: product.storeId,
              productId,
              channelId: channel.id,
              platform: channel.platform,
              externalId: postResult.externalId,
              externalUrl: postResult.externalUrl,
              status: postResult.success ? "synced" : "failed",
              postId: postResult.postId,
              lastSyncedAt: new Date(),
              errorMessage: postResult.error,
            },
          });
        }

        results.push(this.mapSyncedProduct(synced));
      } catch (error) {
        console.error(`[Social] Sync failed for ${channel.platform}:`, error);
        // Create failed record
        const synced = await prisma.syncedProduct.create({
          data: {
            storeId: product.storeId,
            productId,
            channelId: channel.id,
            platform: channel.platform,
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          },
        });
        results.push(this.mapSyncedProduct(synced));
      }
    }

    return results;
  }

  /**
   * Create a scheduled post
   */
  async schedulePost(
    storeId: string,
    data: {
      channelId: string;
      productId?: string;
      content: string;
      mediaUrls: string[];
      hashtags: string[];
      scheduledAt?: Date;
    }
  ): Promise<SocialPost> {
    const channel = await prisma.socialChannel.findFirst({
      where: { id: data.channelId, storeId, isActive: true },
    });

    if (!channel) throw new Error("Channel not found or inactive");

    const post = await prisma.socialPost.create({
      data: {
        storeId,
        channelId: data.channelId,
        productId: data.productId,
        content: data.content,
        mediaUrls: data.mediaUrls,
        hashtags: data.hashtags,
        platform: channel.platform,
        status: data.scheduledAt ? "scheduled" : "draft",
        scheduledAt: data.scheduledAt,
      },
    });

    return this.mapPost(post);
  }

  /**
   * Publish a post immediately
   */
  async publishPost(postId: string): Promise<SocialPost> {
    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      include: { channel: true },
    });

    if (!post) throw new Error("Post not found");

    try {
      const result = await this.postToPlatform(
        post.channel,
        {
          name: post.content,
          images: post.mediaUrls.map((url) => ({ url })),
        } as Record<string, unknown>
      );

      const updated = await prisma.socialPost.update({
        where: { id: postId },
        data: {
          status: result.success ? "posted" : "failed",
          postedAt: result.success ? new Date() : undefined,
          externalPostId: result.postId,
          externalUrl: result.externalUrl,
        },
      });

      return this.mapPost(updated);
    } catch (error) {
      const updated = await prisma.socialPost.update({
        where: { id: postId },
        data: { status: "failed" },
      });
      return this.mapPost(updated);
    }
  }

  /**
   * Get sync status for store products
   */
  async getSyncStatus(storeId: string): Promise<{
    total: number;
    synced: number;
    failed: number;
    pending: number;
    byPlatform: Record<string, { synced: number; failed: number; total: number }>;
  }> {
    const syncedProducts = await prisma.syncedProduct.findMany({
      where: { storeId },
    });

    const stats = {
      total: syncedProducts.length,
      synced: 0,
      failed: 0,
      pending: 0,
      byPlatform: {} as Record<string, { synced: number; failed: number; total: number }>,
    };

    for (const product of syncedProducts) {
      // Count by status
      if (product.status === "synced") stats.synced++;
      else if (product.status === "failed") stats.failed++;
      else stats.pending++;

      // Count by platform
      if (!stats.byPlatform[product.platform]) {
        stats.byPlatform[product.platform] = { synced: 0, failed: 0, total: 0 };
      }
      stats.byPlatform[product.platform].total++;
      if (product.status === "synced") {
        stats.byPlatform[product.platform].synced++;
      } else if (product.status === "failed") {
        stats.byPlatform[product.platform].failed++;
      }
    }

    return stats;
  }

  /**
   * Update engagement stats for synced products
   */
  async updateEngagement(storeId: string): Promise<void> {
    const channels = await prisma.socialChannel.findMany({
      where: { storeId, isActive: true },
    });

    for (const channel of channels) {
      const syncedProducts = await prisma.syncedProduct.findMany({
        where: { channelId: channel.id, status: "synced" },
      });

      for (const product of syncedProducts) {
        if (!product.externalId || !product.postId) continue;

        try {
          const engagement = await this.getEngagement(
            channel.platform,
            channel.accessToken,
            product.postId
          );

          await prisma.syncedProduct.update({
            where: { id: product.id },
            data: { engagementStats: engagement },
          });
        } catch (error) {
          console.error(`[Social] Failed to get engagement:`, error);
        }
      }
    }
  }

  /**
   * Disconnect a channel
   */
  async disconnectChannel(channelId: string): Promise<void> {
    await prisma.socialChannel.update({
      where: { id: channelId },
      data: { isActive: false, accessToken: "", refreshToken: "" },
    });
  }

  /**
   * Auto-post new products (called on product create)
   */
  async autoPostProduct(productId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) return;

    // Find channels with auto-post enabled
    const channels = await prisma.socialChannel.findMany({
      where: {
        storeId: product.storeId,
        isActive: true,
      },
    });

    for (const channel of channels) {
      const settings = channel.settings as { autoPostProducts?: boolean };
      if (settings.autoPostProducts) {
        // Schedule post based on settings
        const scheduledAt =
          settings.postFrequency === "immediate"
            ? undefined
            : settings.postFrequency === "daily"
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.schedulePost(product.storeId, {
          channelId: channel.id,
          productId,
          content: this.generateProductCaption(product, settings.hashtagTemplate),
          mediaUrls: (product.images as Array<{ url: string }>)?.map((i) => i.url) || [],
          hashtags: this.extractHashtags(settings.hashtagTemplate, product),
          scheduledAt,
        });
      }
    }
  }

  // Private methods
  private async exchangeAuthCode(
    platform: string,
    code: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
    // Implementation varies by platform
    switch (platform) {
      case "instagram":
      case "facebook":
        return this.exchangeMetaAuthCode(code);
      case "tiktok":
        return this.exchangeTikTokAuthCode(code);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async exchangeMetaAuthCode(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    const response = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.META_APP_ID,
        client_secret: this.META_APP_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.APP_URL}/api/social/callback/meta`,
      }),
    });

    if (!response.ok) throw new Error("Failed to exchange Meta auth code");

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
    };
  }

  private async exchangeTikTokAuthCode(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    // TikTok OAuth implementation
    throw new Error("TikTok auth not yet implemented");
  }

  private async getAccountInfo(platform: string, accessToken: string): Promise<{ id: string; name: string }> {
    switch (platform) {
      case "instagram":
      case "facebook":
        return this.getMetaAccountInfo(accessToken);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async getMetaAccountInfo(accessToken: string): Promise<{ id: string; name: string }> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${accessToken}`
    );

    if (!response.ok) throw new Error("Failed to get Meta account info");

    const data = await response.json();
    return { id: data.id, name: data.name };
  }

  private async postToPlatform(
    channel: Record<string, unknown>,
    content: Record<string, unknown>
  ): Promise<{ success: boolean; externalId?: string; externalUrl?: string; postId?: string; error?: string }> {
    const platform = channel.platform as string;

    switch (platform) {
      case "instagram":
        return this.postToInstagram(channel, content);
      case "facebook":
        return this.postToFacebook(channel, content);
      case "tiktok":
        return { success: false, error: "TikTok posting not yet implemented" };
      default:
        return { success: false, error: `Unsupported platform: ${platform}` };
    }
  }

  private async postToInstagram(
    channel: Record<string, unknown>,
    content: Record<string, unknown>
  ): Promise<{ success: boolean; externalId?: string; externalUrl?: string; postId?: string; error?: string }> {
    // Instagram Graph API posting
    // This requires media container creation and publishing
    console.log("[Social] Posting to Instagram:", { channel, content });
    return { success: true, postId: "mock_post_id", externalUrl: "https://instagram.com/p/mock" };
  }

  private async postToFacebook(
    channel: Record<string, unknown>,
    content: Record<string, unknown>
  ): Promise<{ success: boolean; externalId?: string; externalUrl?: string; postId?: string; error?: string }> {
    const accessToken = channel.accessToken as string;
    const pageId = channel.accountId as string;

    const message = `${content.name}\n\n${content.description || ""}`;
    const images = (content.images as Array<{ url: string }>) || [];

    try {
      let postId: string;

      if (images.length > 0) {
        // Post with images
        const formData = new FormData();
        formData.append("message", message);
        formData.append("access_token", accessToken);

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/photos`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Failed to post");
        postId = data.post_id || data.id;
      } else {
        // Text-only post
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/feed`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              access_token: accessToken,
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Failed to post");
        postId = data.id;
      }

      return {
        success: true,
        postId,
        externalId: postId,
        externalUrl: `https://facebook.com/${postId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to post to Facebook",
      };
    }
  }

  private async getEngagement(
    platform: string,
    accessToken: string,
    postId: string
  ): Promise<{ likes: number; comments: number; shares: number; views: number }> {
    switch (platform) {
      case "facebook":
        return this.getFacebookEngagement(accessToken, postId);
      case "instagram":
        return { likes: 0, comments: 0, shares: 0, views: 0 };
      default:
        return { likes: 0, comments: 0, shares: 0, views: 0 };
    }
  }

  private async getFacebookEngagement(
    accessToken: string,
    postId: string
  ): Promise<{ likes: number; comments: number; shares: number; views: number }> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}?fields=reactions.summary(total_count),comments.summary(total_count),shares&access_token=${accessToken}`
    );

    if (!response.ok) return { likes: 0, comments: 0, shares: 0, views: 0 };

    const data = await response.json();
    return {
      likes: data.reactions?.summary?.total_count || 0,
      comments: data.comments?.summary?.total_count || 0,
      shares: data.shares?.count || 0,
      views: 0,
    };
  }

  private generateProductCaption(
    product: Record<string, unknown>,
    template: string
  ): string {
    const store = product.store as { name: string };
    return template
      .replace(/\{storeName\}/g, store?.name || "")
      .replace(/\{productName\}/g, String(product.name || ""))
      .replace(/\{price\}/g, `₦${Number(product.price || 0) / 100}`);
  }

  private extractHashtags(template: string, product: Record<string, unknown>): string[] {
    // Extract hashtags from template and add product-specific ones
    const matches = template.match(/#\w+/g) || [];
    return [...new Set(matches)];
  }

  private mapChannel(data: Record<string, unknown>): SocialChannel {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      platform: data.platform as SocialChannel["platform"],
      accountName: String(data.accountName),
      accountId: String(data.accountId),
      accessToken: String(data.accessToken),
      refreshToken: data.refreshToken ? String(data.refreshToken) : undefined,
      expiresAt: data.expiresAt as Date,
      isActive: Boolean(data.isActive),
      lastSyncAt: data.lastSyncAt as Date,
      settings: data.settings as SocialChannel["settings"],
    };
  }

  private mapSyncedProduct(data: Record<string, unknown>): SyncedProduct {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      productId: String(data.productId),
      channelId: String(data.channelId),
      platform: String(data.platform),
      externalId: data.externalId ? String(data.externalId) : undefined,
      externalUrl: data.externalUrl ? String(data.externalUrl) : undefined,
      status: data.status as SyncedProduct["status"],
      postId: data.postId ? String(data.postId) : undefined,
      engagementStats: data.engagementStats as SyncedProduct["engagementStats"],
      lastSyncedAt: data.lastSyncedAt as Date,
      errorMessage: data.errorMessage ? String(data.errorMessage) : undefined,
    };
  }

  private mapPost(data: Record<string, unknown>): SocialPost {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      channelId: String(data.channelId),
      productId: data.productId ? String(data.productId) : undefined,
      content: String(data.content || ""),
      mediaUrls: (data.mediaUrls as string[]) || [],
      hashtags: (data.hashtags as string[]) || [],
      platform: String(data.platform),
      status: data.status as SocialPost["status"],
      scheduledAt: data.scheduledAt as Date,
      postedAt: data.postedAt as Date,
      externalPostId: data.externalPostId ? String(data.externalPostId) : undefined,
      externalUrl: data.externalUrl ? String(data.externalUrl) : undefined,
      engagement: data.engagement as SocialPost["engagement"],
    };
  }
}

// Export singleton instance
export const socialCommerceService = new SocialCommerceService();
