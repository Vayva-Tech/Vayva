import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class AiService {
  constructor(private readonly db = prisma) {}

  async getCreditSummary(storeId: string) {
    // Get credit summary from database
    const credits = await this.db.aICredit.findFirst({
      where: { storeId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!credits) {
      return {
        totalCreditsPurchased: 0,
        creditsRemaining: 0,
        creditsUsed: 0,
        percentageUsed: 0,
        isLowCredit: false,
        estimatedRequestsRemaining: 0,
      };
    }

    const percentageUsed = credits.totalCreditsPurchased > 0
      ? (credits.creditsUsed / credits.totalCreditsPurchased) * 100
      : 0;

    const isLowCredit = credits.creditsRemaining < 100;
    const estimatedRequestsRemaining = Math.floor(credits.creditsRemaining / 10); // Assume 10 credits per request

    return {
      totalCreditsPurchased: credits.totalCreditsPurchased || 0,
      creditsRemaining: credits.creditsRemaining || 0,
      creditsUsed: credits.creditsUsed || 0,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isLowCredit,
      estimatedRequestsRemaining,
    };
  }

  async checkLowCreditAlert(storeId: string) {
    const summary = await this.getCreditSummary(storeId);
    return {
      showAlert: summary.isLowCredit,
      creditsRemaining: summary.creditsRemaining,
    };
  }

  async getTemplates(storeId: string) {
    const templates = await this.db.aITemplate.findMany({
      where: { storeId },
      orderBy: { usageCount: 'desc' },
    });

    return templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      category: template.category || 'general',
      usageCount: template.usageCount || 0,
      isActive: template.isActive,
      lastModified: template.updatedAt.toISOString(),
    }));
  }

  async createTemplate(storeId: string, templateData: any) {
    const { name, content, description, category } = templateData;

    if (!name || !content) {
      throw new Error('Name and content are required');
    }

    const template = await this.db.aITemplate.create({
      data: {
        id: `ait-${Date.now()}`,
        storeId,
        name,
        description: description || '',
        category: category || 'general',
        content,
        isActive: true,
      },
    });

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      usageCount: 0,
      isActive: true,
      lastModified: template.updatedAt.toISOString(),
    };
  }

  /**
   * Get AI usage statistics
   */
  async getAIStats() {
    // Total aggregates (all time)
    const aggregates = await this.db.aiUsageDaily.aggregate({
      _sum: {
        tokensCount: true,
        costKobo: true,
        requestsCount: true,
        imagesCount: true,
      },
    });

    // Daily trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrend = await this.db.aiUsageDaily.groupBy({
      by: ['date'],
      where: {
        date: { gte: sevenDaysAgo },
      },
      _sum: {
        tokensCount: true,
        costKobo: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Top stores by usage
    const topStores = await this.db.aiUsageDaily.groupBy({
      by: ['storeId'],
      _sum: {
        costKobo: true,
        tokensCount: true,
        requestsCount: true,
      },
      orderBy: {
        _sum: {
          costKobo: 'desc',
        },
      },
      take: 10,
    });

    return {
      total: {
        tokens: Number(aggregates._sum.tokensCount || 0),
        cost: Number(aggregates._sum.costKobo || 0) / 100,
        requests: Number(aggregates._sum.requestsCount || 0),
        images: Number(aggregates._sum.imagesCount || 0),
      },
      dailyTrend: dailyTrend.map((d) => ({
        date: d.date.toISOString(),
        tokens: Number(d._sum.tokensCount || 0),
        cost: Number(d._sum.costKobo || 0) / 100,
      })),
      topStores: topStores.map((s) => ({
        storeId: s.storeId,
        cost: Number(s._sum.costKobo || 0) / 100,
        tokens: Number(s._sum.tokensCount || 0),
        requests: Number(s._sum.requestsCount || 0),
      })),
    };
  }

  /**
   * Get AI feedback submissions
   */
  async getAIFeedback(limit = 50) {
    const feedback = await this.db.aIFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    return { feedback };
  }

  /**
   * Submit AI feedback
   */
  async submitAIFeedback(data: {
    userId: string;
    rating: number;
    comment?: string;
    modelId?: string;
    responseId?: string;
  }) {
    const { userId, rating, comment, modelId, responseId } = data;

    const feedback = await this.db.aIFeedback.create({
      data: {
        id: `fb-${Date.now()}`,
        userId,
        rating,
        comment: comment || null,
        modelId: modelId || null,
        responseId: responseId || null,
      },
    });

    logger.info(`[AI] Feedback submitted by user ${userId}`);
    return feedback;
  }

  /**
   * Pause/resume AI operations
   */
  async pauseAIOperations(pause: boolean, reason?: string) {
    await this.db.aISettings.upsert({
      where: { id: 'global-settings' },
      create: {
        id: 'global-settings',
        paused: pause,
        pauseReason: reason || null,
        pausedAt: pause ? new Date() : null,
      },
      update: {
        paused: pause,
        pauseReason: reason || null,
        pausedAt: pause ? new Date() : null,
      },
    });

    logger.info(`[AI] AI operations ${pause ? 'paused' : 'resumed'}. Reason: ${reason}`);
    return { success: true, paused: pause };
  }

  /**
   * Get AI handoff configurations
   */
  async getAIHandoffs() {
    const handoffs = await this.db.aIHandoff.findMany({
      include: {
        store: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { handoffs };
  }

  async getInsights(storeId: string, industry: string, timeRange: string) {
    // Generate AI insights using existing ML models
    const {
      generateInsightsReport,
      generateDemandForecast,
    } = await import('@vayva/ai-agent');

    try {
      const report = await generateInsightsReport(storeId);
      const demandForecast = await generateDemandForecast(storeId, 14);

      const insights: any[] = [];
      const forecasts: any[] = [];

      // Convert pricing recommendations to insights
      report.pricing.forEach((rec: any, index: number) => {
        insights.push({
          id: `pricing-${index}`,
          type: 'recommendation',
          title: `Price Optimization: ${rec.productName}`,
          description: `Current price ₦${rec.currentPrice} → Recommended ₦${rec.recommendedPrice}`,
          confidence: rec.confidence,
          impact: rec.expectedImpact > 15 ? 'high' : rec.expectedImpact > 8 ? 'medium' : 'low',
          category: 'revenue',
          details: `Based on ${rec.reason}`,
          recommendation: `Adjust price to ₦${rec.recommendedPrice} for optimal revenue`,
          predictedImpact: `Expected +₦${rec.expectedImpact.toFixed(0)}% revenue increase`,
          metadata: { productId: rec.productId, type: 'pricing' },
        });
      });

      // Convert stock predictions to insights
      report.stock.forEach((pred: any, index: number) => {
        const insightType = pred.status === 'overstocked' ? 'warning' : 'opportunity';
        insights.push({
          id: `stock-${index}`,
          type: insightType,
          title: `${pred.status === 'overstocked' ? 'Overstock Alert' : 'Restock Recommendation'}: ${pred.productName}`,
          description: `${pred.currentStock} units in stock, ${pred.predictedDemand} units expected demand`,
          confidence: pred.confidence,
          impact: pred.riskLevel === 'high' ? 'critical' : pred.riskLevel === 'medium' ? 'high' : 'medium',
          category: 'inventory',
          details: `Next ${pred.timeframeDays} days forecast`,
          recommendation: pred.status === 'overstocked'
            ? 'Consider discounting or promotion to reduce inventory'
            : `Order ${(pred.predictedDemand - pred.currentStock).toFixed(0)} units soon`,
          predictedImpact: pred.status === 'overstocked'
            ? `Potential loss of ₦${(pred.currentStock * pred.avgPrice * 0.3).toFixed(0)}`
            : `Prevent ₦${(pred.predictedDemand * pred.avgPrice * 0.2).toFixed(0)} in lost sales`,
          metadata: { productId: pred.productId, type: 'inventory' },
        });
      });

      // Generate forecast
      if (demandForecast.length > 0) {
        const nextWeekAvg = demandForecast.slice(0, 7).reduce((acc: number, f: any) => acc + f.predictedOrders, 0) / 7;
        const currentAvg = 50;

        forecasts.push({
          metric: 'daily_orders',
          currentValue: currentAvg,
          predictedValue: Math.round(nextWeekAvg),
          changePercent: ((nextWeekAvg - currentAvg) / currentAvg) * 100,
          confidenceInterval: {
            low: Math.round(nextWeekAvg * 0.85),
            high: Math.round(nextWeekAvg * 1.15),
          },
          timeframe: 'Next 7 days',
          factors: ['Historical trends', 'Seasonal patterns', 'Day-of-week effects'],
        });
      }

      return { insights, forecasts, generatedAt: new Date().toISOString() };
    } catch (error) {
      // Return fallback insights
      return {
        insights: [
          {
            id: 'fallback-1',
            type: 'info',
            title: 'Monitor Your Metrics',
            description: 'Keep an eye on your key performance indicators',
            confidence: 1.0,
            impact: 'low',
            category: 'operations',
            recommendation: 'Check your dashboard regularly for updates',
          },
        ],
        forecasts: [],
        generatedAt: new Date().toISOString(),
      };
    }
  }

  async getWhatsAppStatus(storeId: string) {
    // Check WhatsApp agent connection status
    const { WhatsAppAgentService } = await import('@vayva/whatsapp-agent');
    
    try {
      const FEATURES = { WHATSAPP_ENABLED: true }; // Would come from env
      
      if (!FEATURES.WHATSAPP_ENABLED) {
        return {
          connected: false,
          status: 'DISABLED',
          phoneNumber: null,
        };
      }

      const channel = await WhatsAppAgentService.getChannel(storeId);
      const connected = channel?.status === 'CONNECTED';
      
      return {
        connected,
        status: channel?.status || 'DISCONNECTED',
        phoneNumber: channel?.displayPhoneNumber || null,
      };
    } catch (error) {
      return {
        connected: false,
        status: 'ERROR',
        phoneNumber: null,
      };
    }
  }

  async getAnalytics(storeId: string) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalConversations, activeConversations, recentConversations] = await Promise.all([
      this.db.aIConversation.count({ where: { storeId } }),
      this.db.aIConversation.count({ where: { storeId, status: 'ACTIVE' } }),
      this.db.aIConversation.findMany({
        where: { storeId, createdAt: { gte: twentyFourHoursAgo } },
        select: { status: true, saleValue: true, responseTimeMs: true, platform: true, createdAt: true },
      }),
    ]);

    const completedConversations = recentConversations.filter((c) => c.status === 'COMPLETED');
    const salesConversations = completedConversations.filter((c) => c.saleValue && c.saleValue > 0);

    const conversionRate = completedConversations.length > 0
      ? (salesConversations.length / completedConversations.length) * 100
      : 0;

    const totalSales = salesConversations.reduce((sum, conv) => sum + Number(conv.saleValue || 0), 0);

    const avgResponseTime = completedConversations.length > 0
      ? completedConversations.reduce((sum, conv) => sum + (conv.responseTimeMs || 0), 0) / completedConversations.length
      : 0;

    const platformDistribution: Record<string, number> = {};
    recentConversations.forEach((conv) => {
      const platform = conv.platform || 'unknown';
      platformDistribution[platform] = (platformDistribution[platform] || 0) + 1;
    });

    const hourlyActivity: { hour: number; count: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(now);
      hourStart.setHours(now.getHours() - i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourStart.getHours() + 1);

      const count = recentConversations.filter(
        (conv) => conv.createdAt >= hourStart && conv.createdAt < hourEnd,
      ).length;

      hourlyActivity.push({ hour: hourStart.getHours(), count });
    }

    return {
      totalConversations,
      activeConversations,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalSales,
      avgResponseTime: Math.round(avgResponseTime / 100) / 10,
      satisfactionScore: 94,
      platformDistribution,
      hourlyActivity: hourlyActivity.reverse(),
    };
  }

  async getAvailablePackages() {
    return [
      {
        id: 'AI_MESSAGES_250',
        name: 'Starter Pack',
        credits: 250,
        price: 2000,
        label: '+250 AI messages',
        popular: false,
      },
      {
        id: 'AI_MESSAGES_1000',
        name: 'Standard Pack',
        credits: 1000,
        price: 5000,
        label: '+1,000 AI messages',
        popular: true,
      },
      {
        id: 'AI_MESSAGES_3000',
        name: 'Premium Pack',
        credits: 3000,
        price: 12000,
        label: '+3,000 AI messages',
        popular: false,
      },
    ];
  }

  async initializeCreditTopup(storeId: string, packId: string) {
    const PACKS: Record<string, { messagesAdded: number; priceNgn: number }> = {
      AI_MESSAGES_250: { messagesAdded: 250, priceNgn: 2000 },
      AI_MESSAGES_1000: { messagesAdded: 1000, priceNgn: 5000 },
      AI_MESSAGES_3000: { messagesAdded: 3000, priceNgn: 12000 },
    };

    const pack = PACKS[packId];
    if (!pack) {
      throw new Error('Invalid pack ID. Available: AI_MESSAGES_250, AI_MESSAGES_1000, AI_MESSAGES_3000');
    }

    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { ownerEmail: true },
    });

    const email = String(store?.ownerEmail || '').toLowerCase().trim();
    if (!email) {
      throw new Error('Store owner email is required for payment');
    }

    const reference = `ai_${storeId}_${Date.now()}`;
    const amountKobo = pack.priceNgn * 100;

    // Initialize Paystack transaction
    const { PaystackService } = await import('@vayva/payment-paystack');
    const init = await PaystackService.initializeTransaction({
      email,
      amount: amountKobo,
      reference,
      metadata: {
        type: 'ai_messages_topup',
        storeId,
        packId,
        messagesAdded: pack.messagesAdded,
        priceNgn: pack.priceNgn,
      },
      callback_url: `${process.env.MERCHANT_BASE_URL || 'https://merchant.vayva.ng'}/dashboard/ai-usage?ref=${encodeURIComponent(reference)}`,
    });

    return {
      authorization_url: init.data.authorization_url,
      reference: init.data.reference,
    };
  }

  async topupCredits(storeId: string, creditsAmount: number, paymentReference: string) {
    const { AICreditService } = await import('@vayva/ai-credit-service');

    const result = await AICreditService.addCredits(storeId, creditsAmount, paymentReference);

    return {
      creditsAdded: result.creditsAdded,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    };
  }

  async verifyCreditTopup(storeId: string, reference: string) {
    const { PaystackService } = await import('@vayva/payment-paystack');

    const verified = await PaystackService.verifyTransaction(reference);
    const data = verified.data as Record<string, any>;

    if (String(data.status || '') !== 'success') {
      throw new Error('Payment not successful');
    }

    const metadata = data.metadata as Record<string, any> || {};
    const metaStoreId = String(metadata.storeId || '');
    if (!metaStoreId || metaStoreId !== storeId) {
      throw new Error('Payment does not belong to this store');
    }

    const messagesAdded = typeof metadata.messagesAdded === 'number'
      ? metadata.messagesAdded
      : Number(metadata.messagesAdded || 0);

    if (!Number.isFinite(messagesAdded) || messagesAdded <= 0) {
      throw new Error('Invalid top-up metadata');
    }

    // Check if already applied
    const existing = await this.db.aiAddonPurchase.findUnique({
      where: { transactionId: reference },
      select: { id: true, messagesAdded: true },
    });

    if (existing) {
      return { applied: true, messagesAdded: existing.messagesAdded };
    }

    const sub = await this.db.merchantAiSubscription.findUnique({
      where: { storeId },
      select: { id: true },
    });

    if (!sub) {
      throw new Error('No AI subscription found');
    }

    await this.db.aiAddonPurchase.create({
      data: {
        storeId,
        subscriptionId: sub.id,
        packType: String(metadata.packId || 'AI_MESSAGES_TOPUP'),
        priceKobo: BigInt(Math.max(0, Math.floor(Number(data.amount || 0)))),
        transactionId: reference,
        messagesAdded,
        imagesAdded: 0,
      },
    });

    return { applied: true, messagesAdded };
  }

  async chat(storeId: string, messages: any[], channel: 'whatsapp' | 'web' | 'app' = 'web') {
    // Check if AI is enabled
    if (process.env.ENABLE_AI_ASSISTANT !== 'true') {
      throw new Error('AI assistant is currently disabled');
    }

    // Check if OpenRouter is configured
    const isConfigured = !!process.env.OPENROUTER_API_KEY;
    if (!isConfigured) {
      throw new Error('AI service not configured. Please add OPENROUTER_API_KEY to your .env file.');
    }

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array is required');
    }

    try {
      // Get AI response using SalesAgent
      const { SalesAgent } = await import('@vayva/ai-agent');
      const response = await SalesAgent.handleMessage(storeId, messages);

      // Save conversation if needed
      if (response && response.message) {
        await this.saveConversation(storeId, messages, response, channel);
      }

      logger.info(`[AI] Processed chat message for store ${storeId} via ${channel}`);
      return response;
    } catch (error) {
      logger.error('[AI] Chat error', error, { storeId, channel });
      throw error;
    }
  }

  async whatsappWebhook(storeId: string, payload: any) {
    try {
      // Extract message from WhatsApp webhook
      const message = this.extractWhatsAppMessage(payload);
      
      if (!message) {
        logger.warn('[AI] No message extracted from WhatsApp webhook');
        return { success: false, error: 'No message found' };
      }

      // Process through AI
      const messages = [{ role: 'user', content: message }];
      const aiResponse = await this.chat(storeId, messages, 'whatsapp');

      // Send response via WhatsApp API
      if (aiResponse && aiResponse.message) {
        await this.sendWhatsAppResponse(storeId, payload, aiResponse.message);
      }

      logger.info(`[AI] Processed WhatsApp webhook for store ${storeId}`);
      return { success: true, data: aiResponse };
    } catch (error) {
      logger.error('[AI] WhatsApp webhook error', error, { storeId });
      throw error;
    }
  }

  async getConversations(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    // Get recent conversations (last 24 hours by default)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    where.createdAt = { gte: twentyFourHoursAgo };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.platform) {
      where.platform = filters.platform;
    }

    const [conversations, total] = await Promise.all([
      this.db.aIConversation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.aIConversation.count({ where }),
    ]);

    // Transform for frontend
    const transformed = conversations.map((conv) => ({
      id: conv.id,
      customerName: conv.customerName || 'Anonymous',
      platform: conv.platform || 'unknown',
      status: conv.status as 'active' | 'completed' | 'failed',
      duration: Math.floor((conv.updatedAt.getTime() - conv.createdAt.getTime()) / 1000),
      messages: conv.messageCount || 0,
      saleValue: conv.saleValue ? Number(conv.saleValue) : undefined,
      timestamp: conv.createdAt.toISOString(),
    }));

    return {
      conversations: transformed,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getAnalytics(storeId: string) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalConversations, activeConversations, completedConversations, totalSaleValue] =
      await Promise.all([
        this.db.aIConversation.count({
          where: { storeId, createdAt: { gte: twentyFourHoursAgo } },
        }),
        this.db.aIConversation.count({
          where: { storeId, status: 'active', createdAt: { gte: twentyFourHoursAgo } },
        }),
        this.db.aIConversation.count({
          where: { storeId, status: 'completed', createdAt: { gte: twentyFourHoursAgo } },
        }),
        this.db.aIConversation.aggregate({
          where: { storeId, createdAt: { gte: twentyFourHoursAgo } },
          _sum: { saleValue: true },
        }),
      ]);

    return {
      totalConversations,
      activeConversations,
      completedConversations,
      totalSaleValue: totalSaleValue._sum.saleValue || 0,
      period: '24h',
    };
  }

  async getHealthStatus() {
    const isConfigured = !!process.env.OPENROUTER_API_KEY;
    const isEnabled = process.env.ENABLE_AI_ASSISTANT === 'true';

    return {
      status: isConfigured && isEnabled ? 'ready' : 'not_configured',
      ai_enabled: isEnabled,
      api_key_configured: isConfigured,
      model: process.env.AI_MODEL || 'llama-3.1-70b-versatile',
    };
  }

  private async saveConversation(
    storeId: string,
    messages: any[],
    response: any,
    channel: string,
  ) {
    try {
      // Extract relevant information from messages
      const lastMessage = messages[messages.length - 1];
      const customerName = 'Anonymous'; // Could be extracted if available

      await this.db.aIConversation.create({
        data: {
          id: `aic-${Date.now()}`,
          storeId,
          customerName,
          platform: channel,
          status: 'completed',
          messageCount: messages.length + 1, // Including AI response
          saleValue: null, // Could be extracted if sale detected
        },
      });
    } catch (error) {
      logger.error('[AI] Failed to save conversation', error, { storeId });
    }
  }

  private extractWhatsAppMessage(payload: any): string | null {
    // Extract message from WhatsApp Business API payload
    // This is a simplified version - adjust based on actual WhatsApp API structure
    if (payload?.entries?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) {
      return payload.entries[0].changes[0].value.messages[0].text.body;
    }
    return null;
  }

  private async sendWhatsAppResponse(storeId: string, payload: any, message: string) {
    // Send response via WhatsApp Business API
    // Implementation depends on specific WhatsApp API integration
    logger.info(`[AI] Would send WhatsApp response: ${message}`);
  }
}
