/**
 * AI Credit Management Service
 * =============================
 * Handles credit allocation, consumption tracking, and top-up logic
 *
 * Credit System Rules:
 * - PRO_PLUS users: 25,000 credits on onboard
 * - PRO users: 10,000 credits on onboard
 * - STARTER users: 5,000 credits on onboard
 * - Low credit alert at 200 credits remaining
 * - Top-up packages with multi-currency support:
 *   - Small: 3,000 credits for ₦3,000 / $7
 *   - Medium: 8,000 credits for ₦7,000 / $16
 *   - Large: 20,000 credits for ₦15,000 / $35
 *
 * AI Model Strategy:
 * - PRIMARY MODEL: GPT-4o Mini via OpenRouter (95% of requests)
 *   - Cost: ₦0.24 per 1,000 tokens
 *   - Best value: cheap, fast, multilingual, capable
 *
 * - AUTOPILOT MODEL: Meta Llama 3.3 70B Instruct via OpenRouter
 *   - Cost: ₦0.34 per 1,000 tokens ($0.21/M ≈ ₦336/M)
 *   - 67% cheaper than previous llama3-70b-8192
 *
 * - FALLBACK MODELS (auto-routed):
 *   - Claude 3 Sonnet: Complex reasoning, legal docs (₦2.40/1k tokens)
 *   - Mistral Large: Code generation, technical tasks (₦1.60/1k tokens)
 *
 * Credit Consumption Formula:
 * - Credits = (Actual Cost / 0.9) to maintain ~70% margin
 * - 1 credit ≈ ₦1 OpenRouter cost (0.24 credits per 1K tokens)
 * - GPT-4o Mini: ~0.24 credits per 1,000 tokens
 */

import { prisma, type AiUsageEvent } from '@vayva/db';
import { logger, ErrorCategory } from '@/lib/logger';

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
  // PRIMARY MODEL: Gemini 2.0 Flash Lite - used for most requests
  // FALLBACK MODELS: Claude 3 Sonnet (complex tasks), Mistral Large (code)
  private static MODEL_COST_RATES: Record<string, number> = {
    // Primary Model (DEFAULT)
    'google/gemini-2.0-flash-lite-001': 0.12, // ~$0.075/M input + $0.30/M output ≈ ₦0.12/1K (input) baseline

    // Autopilot Model
    'meta-llama/llama-3.3-70b-instruct': 0.34, // $0.21/M avg ≈ ₦336/M ≈ ₦0.34/1K

    // Fallback Models (auto-routed for complex tasks)
    'anthropic/claude-3-sonnet': 2.40, // $3/1M input + $15/1M output ≈ ₦2.40/1K avg
    'mistralai/mistral-large': 1.60,   // $0.80/1M input + $2.40/1M output ≈ ₦1.60/1K avg
  };

  // Default model for all requests (can be overridden for specific use cases)
  private static DEFAULT_MODEL = 'google/gemini-2.0-flash-lite-001';
  
  // Default rate for unknown models (uses GPT-4o Mini rate)
  private static DEFAULT_COST_RATE = 0.12;

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
      case 'PRO_PLUS':
        return 25000; // 25,000 credits
      case 'PRO':
        return 10000; // 10,000 credits
      case 'STARTER':
        return 5000;  // 5,000 credits
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
          NGN: 3000,    // ₦3,000 Nigeria
          USD: 7,       // $7 International
          EUR: 6.50,    // €6.50 Europe
          GBP: 5.50,    // £5.50 UK
          KES: 910,     // KSh 910 Kenya
          GHS: 85,      // GH₵ 85 Ghana
          ZAR: 130,     // R130 South Africa
        },
        bonusCredits: 0,
        popular: false,
      },
      {
        id: 'medium',
        credits: 8000,
        prices: {
          NGN: 7000,    // ₦7,000
          USD: 16,      // $16
          EUR: 15,      // €15
          GBP: 13,      // £13
          KES: 2080,    // KSh 2,080
          GHS: 195,     // GH₵ 195
          ZAR: 295,     // R295
        },
        bonusCredits: 0,
        popular: true,
      },
      {
        id: 'large',
        credits: 20000,
        prices: {
          NGN: 15000,   // ₦15,000
          USD: 35,      // $35
          EUR: 32,      // €32
          GBP: 28,      // £28
          KES: 4550,    // KSh 4,550
          GHS: 425,     // GH₵ 425
          ZAR: 645,     // R645
        },
        bonusCredits: 0,
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

  /** Aligns with AiUsageService.checkLimits: STARTER trial uses 20 messages; else plan monthlyRequestLimit. */
  private static planMessageLimit(sub: {
    planKey: string;
    plan: { monthlyRequestLimit: number };
  }): number {
    return sub.planKey === 'STARTER' ? 20 : sub.plan.monthlyRequestLimit;
  }

  private static addonMessagesTotal(
    addonPurchases: { messagesAdded: number }[],
  ): number {
    return addonPurchases.reduce((s, a) => s + a.messagesAdded, 0);
  }

  private static totalMessageLimit(sub: {
    planKey: string;
    plan: { monthlyRequestLimit: number };
    addonPurchases: { messagesAdded: number }[];
  }): number {
    return (
      AICreditService.planMessageLimit(sub) +
      AICreditService.addonMessagesTotal(sub.addonPurchases)
    );
  }

  private static creditsRemainingForSub(sub: {
    monthMessagesUsed: number;
    planKey: string;
    plan: { monthlyRequestLimit: number };
    addonPurchases: { messagesAdded: number }[];
  }): number {
    const total = AICreditService.totalMessageLimit(sub);
    return Math.max(0, total - sub.monthMessagesUsed);
  }

  private static async loadSubscriptionWithPlan(storeId: string) {
    return prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      include: { plan: true, addonPurchases: true },
    });
  }

  /**
   * Reset MTD message usage (optional onboarding hook). Plan allocation comes from {@link AiPlan} + add-ons.
   */
  static async initializeSubscriptionCredits(
    storeId: string,
    planKey: string,
  ): Promise<void> {
    await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: { monthMessagesUsed: 0 },
    });

    logger.info('[AICreditService] Reset MTD AI message usage for store', {
      storeId,
      planKey,
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
    },
  ): Promise<{ success: boolean; remainingCredits: number; blocked: boolean }> {
    const subscription = await AICreditService.loadSubscriptionWithPlan(storeId);

    if (!subscription) {
      logger.warn(
        '[AICreditService] No subscription found',
        ErrorCategory.API,
        { storeId },
      );
      return { success: false, remainingCredits: 0, blocked: true };
    }

    const remaining = AICreditService.creditsRemainingForSub(subscription);
    const debit = Math.max(1, Math.ceil(creditsUsed));

    if (!options?.skipInsufficientCheck && remaining < debit) {
      logger.warn(
        '[AICreditService] Insufficient credits / message quota',
        ErrorCategory.API,
        {
          storeId,
          required: debit,
          available: remaining,
        },
      );

      return {
        success: false,
        remainingCredits: remaining,
        blocked: true,
      };
    }

    const updated = await prisma.merchantAiSubscription.update({
      where: { storeId },
      data: {
        monthMessagesUsed: { increment: debit },
      },
    });

    const newRemaining = AICreditService.creditsRemainingForSub({
      ...subscription,
      monthMessagesUsed: updated.monthMessagesUsed,
    });

    logger.info('[AICreditService] Credits deducted (message quota)', {
      storeId,
      creditsUsed: debit,
      remaining: newRemaining,
    });

    return {
      success: true,
      remainingCredits: newRemaining,
      blocked: false,
    };
  }

  /**
   * Add credits via top-up purchase
   */
  static async addCredits(
    storeId: string,
    creditsAmount: number,
    transactionId: string,
  ): Promise<CreditTopUpResult> {
    const subscription = await AICreditService.loadSubscriptionWithPlan(storeId);

    if (!subscription) {
      throw new Error('No subscription found for store');
    }

    const beforeRemaining = AICreditService.creditsRemainingForSub(subscription);

    await prisma.aiAddonPurchase.create({
      data: {
        storeId,
        subscriptionId: subscription.id,
        packType: 'CREDITS_TOPUP',
        priceKobo: BigInt(300000),
        transactionId,
        messagesAdded: creditsAmount,
        imagesAdded: 0,
      },
    });

    const newRemaining = beforeRemaining + creditsAmount;

    logger.info('[AICreditService] Credits added via top-up (addon pack)', {
      storeId,
      creditsAdded: creditsAmount,
      transactionId,
      newBalance: newRemaining,
    });

    return {
      success: true,
      creditsAdded: creditsAmount,
      newBalance: newRemaining,
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
    const subscription = await AICreditService.loadSubscriptionWithPlan(storeId);

    if (!subscription) {
      return { showAlert: false, creditsRemaining: 0, percentageUsed: 0 };
    }

    const total = AICreditService.totalMessageLimit(subscription);
    const creditsRemaining =
      AICreditService.creditsRemainingForSub(subscription);
    const percentageUsed =
      total > 0
        ? Math.round(
            ((total - creditsRemaining) / total) * 100,
          )
        : 0;

    const threshold = Math.min(200, Math.max(1, Math.floor(total * 0.1)));
    const showAlert = total > 0 && creditsRemaining <= threshold;

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
    const subscription = await AICreditService.loadSubscriptionWithPlan(storeId);

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

    const totalCreditsPurchased =
      AICreditService.totalMessageLimit(subscription);
    const creditsRemaining =
      AICreditService.creditsRemainingForSub(subscription);
    const creditsUsed = subscription.monthMessagesUsed;
    const percentageUsed =
      totalCreditsPurchased > 0
        ? Math.round((creditsUsed / totalCreditsPurchased) * 100)
        : 0;

    const avgCreditsPerRequest = 5;
    const estimatedRequestsRemaining = Math.floor(
      creditsRemaining / avgCreditsPerRequest,
    );

    const lowThreshold = Math.min(
      200,
      Math.max(1, Math.floor(totalCreditsPurchased * 0.1)),
    );

    return {
      totalCreditsPurchased,
      creditsRemaining,
      creditsUsed,
      percentageUsed,
      isLowCredit:
        totalCreditsPurchased > 0 && creditsRemaining <= lowThreshold,
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
        plan: true,
        addonPurchases: true,
      },
    });

    return subscriptions.map((sub) => {
      const total = AICreditService.totalMessageLimit(sub);
      const creditsRemaining = AICreditService.creditsRemainingForSub(sub);
      const creditsUsed = sub.monthMessagesUsed;
      const percentageUsed =
        total > 0 ? Math.round((creditsUsed / total) * 100) : 0;
      const lastTopupAt =
        sub.addonPurchases.length > 0
          ? new Date(
              Math.max(
                ...sub.addonPurchases.map((a) => a.createdAt.getTime()),
              ),
            )
          : null;

      return {
        storeId: sub.storeId,
        storeName: sub.store.name,
        planKey: sub.planKey,
        totalCreditsPurchased: total,
        creditsRemaining,
        creditsUsed,
        percentageUsed,
        isLowCredit:
          total > 0 &&
          creditsRemaining <=
            Math.min(200, Math.max(1, Math.floor(total * 0.1))),
        lastTopupAt,
        status: sub.status,
      };
    });
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
  ): Promise<AiUsageEvent[]> {
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
