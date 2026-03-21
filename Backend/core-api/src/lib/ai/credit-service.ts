/**
 * AI Credit Management Service
 * =============================
 * Handles credit allocation, consumption tracking, and top-up logic
 * 
 * Credit System Rules:
 * - PRO users: 10,000 credits on onboard (1M tokens)
 * - STARTER users: 5,000 credits on onboard (500k tokens)
 * - Low credit alert at 200 credits remaining
 * - Top-up packages with multi-currency support:
 *   - Small: 3,000 credits for ₦2,000 / $5
 *   - Medium: 8,000 credits + 500 bonus for ₦5,000 / $12
 *   - Large: 20,000 credits + 2,000 bonus for ₦12,000 / $28
 * 
 * AI Model Strategy:
 * - PRIMARY MODEL: GPT-4o Mini via OpenRouter (95% of requests)
 *   - Cost: ₦0.24 per 1,000 tokens
 *   - Best value: cheap, fast, multilingual, capable
 * 
 * - FALLBACK MODELS (auto-routed):
 *   - Claude 3 Sonnet: Complex reasoning, legal docs (₦2.40/1k tokens)
 *   - Mistral Large: Code generation, technical tasks (₦1.60/1k tokens)
 * 
 * Credit Consumption Formula:
 * - Credits = (Actual Cost / 0.9) to maintain ~70% margin
 * - 1 credit ≈ ₦3 value (₦3,000 / 1,000 credits top-up)
 * - GPT-4o Mini: ~0.08 credits per 1,000 tokens (extremely efficient!)
 */

import { prisma } from '@vayva/db';
import { logger } from '@vayva/infra';
import type { Prisma } from '@prisma/client';

export interface CreditConsumption {
  creditsUsed: number;
  breakdown: {
    inputCredits: number;
    outputCredits: number;
    imageCredits: number;
    toolCallCredits: number;
  };
}

export interface CreditTopUpPackage {
  id: string;
  credits: number;
  prices: {
    NGN: number; // Nigerian Naira
    USD: number; // US Dollar
    EUR: number; // Euro
    GBP: number; // British Pound
    KES: number; // Kenyan Shilling
    GHS: number; // Ghanaian Cedi
    ZAR: number; // South African Rand
  };
  bonusCredits: number;
  popular: boolean;
}

export interface CreditTopUpResult {
  success: boolean;
  creditsAdded: number;
  newBalance: number;
  transactionId: string;
}

export class AICreditService {
  // Credit rates per 1,000 tokens by model (based on OpenRouter actual pricing)
  // Source: https://openrouter.ai/models
  // Costs are in NGN (₦) per 1K tokens (approximate, assuming $1 = ₦1,600)
  // 
  // PRIMARY MODEL: GPT-4o Mini - Used for 95% of requests
  // FALLBACK MODELS: Claude 3 Sonnet (complex tasks), Mistral Large (code)
  private static MODEL_COST_RATES: Record<string, number> = {
    // Primary Model (DEFAULT)
    'openai/gpt-4o-mini': 0.24,     // $0.15/1M input + $0.60/1M output ≈ ₦0.24/1K avg
    
    // Fallback Models (auto-routed for complex tasks)
    'anthropic/claude-3-sonnet': 2.40, // $3/1M input + $15/1M output ≈ ₦2.40/1K avg
    'mistralai/mistral-large': 1.60,   // $0.80/1M input + $2.40/1M output ≈ ₦1.60/1K avg
  };

  // Default model for all requests (can be overridden for specific use cases)
  private static DEFAULT_MODEL = 'openai/gpt-4o-mini';
  
  // Default rate for unknown models (uses GPT-4o Mini rate)
  private static DEFAULT_COST_RATE = 0.24;

  // Credits per image generation
  private static IMAGE_CREDIT_COST = 10;

  // Credits per tool call
  private static TOOL_CALL_CREDIT_COST = 0.5;

  /**
   * Calculate ACTUAL COST to Vayva (in NGN) for an API request
   * This is what OpenRouter charges us
   */
  static calculateActualCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
    imageCount: number = 0,
    toolCallsCount: number = 0
  ): number {
    const costPer1KTokens = this.MODEL_COST_RATES[model] || this.DEFAULT_COST_RATE;
    
    // Token costs
    const tokenCost = ((inputTokens + outputTokens) / 1000) * costPer1KTokens;
    
    // Image costs (estimate ₦50 per image via DALL-E)
    const imageCost = imageCount * 50;
    
    // Tool call costs (negligible, but add ₦5 per complex tool use)
    const toolCost = toolCallsCount * 5;
    
    return Math.max(tokenCost + imageCost + toolCost, 0.01); // Minimum ₦0.01
  }

  /**
   * Calculate CREDITS TO CHARGE merchant for an API request
   * This includes our profit margin
   * 
   * Pricing Strategy:
   * - Base rate: 1 credit = ₦3 worth of AI usage
   * - We want ~70% profit margin
   * - So if our cost is ₦0.27, we charge 1 credit (₦3 value)
   * - If our cost is ₦1.60, we charge proportionally more credits
   */
  static calculateCreditConsumption(
    model: string,
    inputTokens: number,
    outputTokens: number,
    imageCount: number = 0,
    toolCallsCount: number = 0
  ): CreditConsumption {
    const actualCost = this.calculateActualCost(model, inputTokens, outputTokens, imageCount, toolCallsCount);
    
    // Credit value: ₦3 per credit (based on ₦3,000 / 1,000 credits top-up)
    const creditValueNaira = 3;
    
    // Target 70% profit margin
    // Formula: Credits = (Actual Cost / (1 - Target Margin)) / Credit Value
    // Simplified: Credits = Actual Cost / 0.3 / 3 = Actual Cost / 0.9
    const targetMargin = 0.70;
    const creditsNeeded = actualCost / (1 - targetMargin) / creditValueNaira;
    
    // Round up to nearest whole credit
    const totalCredits = Math.ceil(creditsNeeded);
    
    // Breakdown for transparency
    const inputCredits = Math.ceil((inputTokens / 1000) * (this.MODEL_COST_RATES[model] || this.DEFAULT_COST_RATE) / 0.9);
    const outputCredits = Math.ceil((outputTokens / 1000) * (this.MODEL_COST_RATES[model] || this.DEFAULT_COST_RATE) / 0.9);
    const imageCredits = Math.ceil(imageCount * 50 / 3); // ₦50 per image / ₦3 per credit
    const toolCallCredits = Math.ceil(toolCallsCount * 5 / 3); // ₦5 per tool / ₦3 per credit
    
    return {
      creditsUsed: totalCredits,
      breakdown: {
        inputCredits: Math.max(inputCredits, 1), // Minimum 1 credit
        outputCredits: Math.max(outputCredits, 1),
        imageCredits,
        toolCallCredits,
      },
    };
  }

  /**
   * Get initial credits based on subscription plan
   * NEW MODEL: Generous allocation to drive adoption
   */
  static getInitialCreditsForPlan(planKey: string): number {
    switch (planKey.toUpperCase()) {
      case 'PRO':
        return 10000; // 1,000,000 tokens (~$240 value at GPT-4o Mini rates)
      case 'STARTER':
        return 5000;  // 500,000 tokens (~$120 value)
      default:
        return 5000; // Fallback to STARTER
    }
  }

  /**
   * Credit top-up packages with multi-country pricing
   * Adapts to merchant's currency automatically
   */
  static getTopUpPackages(): CreditTopUpPackage[] {
    return [
      {
        id: 'small',
        credits: 3000,
        prices: {
          NGN: 2000,    // ₦2,000 Nigeria
          USD: 5,       // $5 International
          EUR: 4.50,    // €4.50 Europe
          GBP: 4,       // £4 UK
          KES: 650,     // KSh 650 Kenya
          GHS: 60,      // GH₵ 60 Ghana
          ZAR: 90,      // R90 South Africa
        },
        bonusCredits: 0,
        popular: false,
      },
      {
        id: 'medium',
        credits: 8000,
        prices: {
          NGN: 5000,    // ₦5,000 (Save ₦1,000 vs small)
          USD: 12,      // $12 (Save $3 vs small)
          EUR: 11,      // €11
          GBP: 9.50,    // £9.50
          KES: 1600,    // KSh 1,600
          GHS: 150,     // GH₵ 150
          ZAR: 220,     // R220
        },
        bonusCredits: 500, // 6.25% bonus
        popular: true,
      },
      {
        id: 'large',
        credits: 20000,
        prices: {
          NGN: 12000,   // ₦12,000 (Save ₦8,000 vs small)
          USD: 28,      // $28 (Save $17 vs small)
          EUR: 25,      // €25
          GBP: 22,      // £22
          KES: 3800,    // KSh 3,800
          GHS: 350,     // GH₵ 350
          ZAR: 500,     // R500
        },
        bonusCredits: 2000, // 10% bonus
        popular: false,
      },
    ];
  }

  /**
   * Get price for top-up package in merchant's currency
   */
  static getTopUpPrice(packageId: string, currency: string): number {
    const packages = this.getTopUpPackages();
    const pkg = packages.find(p => p.id === packageId);
    
    if (!pkg) {
      throw new Error(`Invalid package ID: ${packageId}`);
    }

    const price = pkg.prices[currency as keyof typeof pkg.prices];
    
    if (!price) {
      // Fallback to USD if currency not supported
      console.warn(`Currency ${currency} not supported, defaulting to USD`);
      return pkg.prices.USD;
    }

    return price;
  }

  /**
   * Initialize credits for new subscription
   */
  static async initializeSubscriptionCredits(
    storeId: string,
    planKey: string
  ): Promise<void> {
    const initialCredits = this.getInitialCreditsForPlan(planKey);

    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: {
        totalCreditsPurchased: initialCredits,
        creditsRemaining: initialCredits,
        lastTopupAt: new Date(),
      },
    });

    logger.info('[AICreditService] Initialized subscription credits', {
      storeId,
      planKey,
      initialCredits,
    });
  }

  /**
   * Deduct credits for an AI usage event
   */
  static async deductCredits(
    storeId: string,
    creditsUsed: number,
    options?: {
      requestId?: string;
      skipInsufficientCheck?: boolean;
    }
  ): Promise<{ success: boolean; remainingCredits: number; blocked: boolean }> {
    const subscription = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
    });

    if (!subscription) {
      logger.warn('[AICreditService] No subscription found', { storeId });
      return { success: false, remainingCredits: 0, blocked: true };
    }

    // Check if enough credits
    if (!options?.skipInsufficientCheck && subscription.creditsRemaining < creditsUsed) {
      logger.warn('[AICreditService] Insufficient credits', {
        storeId,
        required: creditsUsed,
        available: subscription.creditsRemaining,
      });

      return {
        success: false,
        remainingCredits: subscription.creditsRemaining,
        blocked: true,
      };
    }

    // Deduct credits
    const updated = await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: {
        creditsRemaining: {
          decrement: creditsUsed,
        },
      },
    });

    logger.info('[AICreditService] Credits deducted', {
      storeId,
      creditsUsed,
      remaining: updated.creditsRemaining,
    });

    return {
      success: true,
      remainingCredits: updated.creditsRemaining,
      blocked: false,
    };
  }

  /**
   * Add credits via top-up purchase
   */
  static async addCredits(
    storeId: string,
    creditsAmount: number,
    transactionId: string
  ): Promise<CreditTopUpResult> {
    const subscription = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
    });

    if (!subscription) {
      throw new Error('No subscription found for store');
    }

    const updated = await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: {
        totalCreditsPurchased: {
          increment: creditsAmount,
        },
        creditsRemaining: {
          increment: creditsAmount,
        },
        lastTopupAt: new Date(),
        lastCreditAlertAt: new Date(), // Reset low credit alert
      },
    });

    // Record addon purchase
    await prisma.aiAddonPurchase.create({
      data: {
        storeId,
        subscriptionId: subscription.id,
        packType: 'CREDITS_1000',
        priceKobo: BigInt(300000), // ₦3,000 in kobo
        transactionId,
        messagesAdded: creditsAmount, // Track as "messages" for compatibility
        imagesAdded: 0,
      },
    });

    logger.info('[AICreditService] Credits added via top-up', {
      storeId,
      creditsAdded: creditsAmount,
      transactionId,
      newBalance: updated.creditsRemaining,
    });

    return {
      success: true,
      creditsAdded: creditsAmount,
      newBalance: updated.creditsRemaining,
      transactionId,
    };
  }

  /**
   * Check if merchant should see low credit alert
   */
  static async checkLowCreditAlert(storeId: string): Promise<{
    showAlert: boolean;
    creditsRemaining: number;
    percentageUsed: number;
  }> {
    const subscription = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
    });

    if (!subscription) {
      return { showAlert: false, creditsRemaining: 0, percentageUsed: 0 };
    }

    const threshold = 200; // Alert at 200 credits
    const creditsRemaining = subscription.creditsRemaining;
    const percentageUsed = Math.round(
      ((subscription.totalCreditsPurchased - creditsRemaining) / subscription.totalCreditsPurchased) * 100
    );

    // Check if already shown recently (within 24 hours)
    const now = new Date();
    const lastAlert = subscription.lastCreditAlertAt;
    const hoursSinceLastAlert = lastAlert
      ? (now.getTime() - lastAlert.getTime()) / (1000 * 60 * 60)
      : Infinity;

    const showAlert = creditsRemaining <= threshold && hoursSinceLastAlert > 24;

    if (showAlert) {
      // Update last alert time
      await prisma.merchantAiSubscription.update({
        where: { storeId },
        data: {
          lastCreditAlertAt: now,
        },
      });
    }

    return {
      showAlert,
      creditsRemaining,
      percentageUsed,
    };
  }

  /**
   * Get credit usage summary for a store
   */
  static async getCreditSummary(storeId: string): Promise<{
    totalCreditsPurchased: number;
    creditsRemaining: number;
    creditsUsed: number;
    percentageUsed: number;
    isLowCredit: boolean;
    estimatedRequestsRemaining: number;
  }> {
    const subscription = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
    });

    if (!subscription) {
      return {
        totalCreditsPurchased: 0,
        creditsRemaining: 0,
        creditsUsed: 0,
        percentageUsed: 0,
        isLowCredit: false,
        estimatedRequestsRemaining: 0,
      };
    }

    const creditsUsed = subscription.totalCreditsPurchased - subscription.creditsRemaining;
    const percentageUsed = Math.round(
      (creditsUsed / subscription.totalCreditsPurchased) * 100
    );

    // Estimate remaining requests (assuming avg 5 credits per request)
    const avgCreditsPerRequest = 5;
    const estimatedRequestsRemaining = Math.floor(
      subscription.creditsRemaining / avgCreditsPerRequest
    );

    return {
      totalCreditsPurchased: subscription.totalCreditsPurchased,
      creditsRemaining: subscription.creditsRemaining,
      creditsUsed,
      percentageUsed,
      isLowCredit: subscription.creditsRemaining <= 200,
      estimatedRequestsRemaining,
    };
  }

  /**
   * Get all merchant AI subscriptions with credit info (for Ops Console)
   */
  static async getAllSubscriptionsWithCredits(): Promise<
    Array<{
      storeId: string;
      storeName: string;
      planKey: string;
      totalCreditsPurchased: number;
      creditsRemaining: number;
      creditsUsed: number;
      percentageUsed: number;
      isLowCredit: boolean;
      lastTopupAt: Date | null;
      status: string;
    }>
  > {
    const subscriptions = await prisma.merchantAiSubscription.findMany({
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    return subscriptions.map((sub) => ({
      storeId: sub.storeId,
      storeName: sub.store.name,
      planKey: sub.planKey,
      totalCreditsPurchased: sub.totalCreditsPurchased,
      creditsRemaining: sub.creditsRemaining,
      creditsUsed: sub.totalCreditsPurchased - sub.creditsRemaining,
      percentageUsed: Math.round(
        ((sub.totalCreditsPurchased - sub.creditsRemaining) / sub.totalCreditsPurchased) * 100
      ),
      isLowCredit: sub.creditsRemaining <= 200,
      lastTopupAt: sub.lastTopupAt,
      status: sub.status,
    }));
  }

  /**
   * Get credit usage events for a store (for analytics)
   */
  static async getUsageEvents(
    storeId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<Prisma.AiUsageEventGetPayload<{}>[]> {
    const { startDate, endDate, limit = 100 } = options || {};

    return prisma.aiUsageEvent.findMany({
      where: {
        storeId,
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
