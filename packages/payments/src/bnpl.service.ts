/**
 * Buy Now Pay Later (BNPL) Service
 * 
 * Integrates with Paystack BNPL, Carbon, and CredPal to provide
 * installment payment options for Nigerian merchants.
 */

export interface BNPLProvider {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, string>;
}

export interface BNPLAgreement {
  id: string;
  orderId: string;
  customerId: string;
  merchantId: string;
  provider: string;
  totalAmount: number; // in kobo
  upfrontAmount: number; // in kobo
  installmentAmount: number; // in kobo
  numberOfInstallments: number;
  installmentInterval: 'weekly' | 'biweekly' | 'monthly';
  status: 'pending' | 'active' | 'completed' | 'defaulted' | 'cancelled';
  installments: Installment[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Installment {
  id: string;
  agreementId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  transactionRef?: string;
}

export interface BNPLQuote {
  eligible: boolean;
  totalAmount: number;
  upfrontAmount: number;
  installmentAmount: number;
  numberOfInstallments: number;
  provider: string;
  reason?: string; // if not eligible
}

export interface BNPLApplication {
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  provider: string;
  callbackUrl: string;
}

export interface BNPLWebhookPayload {
  event: 'installment.paid' | 'installment.failed' | 'agreement.completed' | 'agreement.defaulted';
  data: {
    agreementId: string;
    installmentId?: string;
    amount?: number;
    transactionRef?: string;
    timestamp: string;
  };
}

// BNPL Provider configurations
const BNPL_PROVIDERS: Record<string, BNPLProvider> = {
  paystack: {
    id: 'paystack',
    name: 'Paystack BNPL',
    enabled: true,
    config: {
      apiKey: process.env.PAYSTACK_BNPL_API_KEY || '',
      baseUrl: 'https://api.paystack.co',
    },
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon',
    enabled: true,
    config: {
      apiKey: process.env.CARBON_API_KEY || '',
      baseUrl: 'https://api.carbon.money',
    },
  },
  credpal: {
    id: 'credpal',
    name: 'CredPal',
    enabled: true,
    config: {
      apiKey: process.env.CREDPAL_API_KEY || '',
      baseUrl: 'https://api.credpal.com',
    },
  },
};

export class BNPLService {
  private providers: Map<string, BNPLProvider>;

  constructor() {
    this.providers = new Map(Object.entries(BNPL_PROVIDERS));
  }

  /**
   * Get all enabled BNPL providers
   */
  getEnabledProviders(): BNPLProvider[] {
    return Array.from(this.providers.values()).filter(p => p.enabled);
  }

  /**
   * Check customer eligibility for BNPL
   */
  async checkEligibility(
    customerId: string,
    amount: number,
    providerId?: string
  ): Promise<BNPLQuote[]> {
    const quotes: BNPLQuote[] = [];
    const providers = providerId 
      ? [this.providers.get(providerId)].filter(Boolean) as BNPLProvider[]
      : this.getEnabledProviders();

    for (const provider of providers) {
      try {
        const quote = await this.getProviderQuote(provider, customerId, amount);
        quotes.push(quote);
      } catch (error) {
        console.error(`[BNPL] Failed to get quote from ${provider.name}:`, error);
      }
    }

    return quotes;
  }

  /**
   * Get quote from specific provider
   */
  private async getProviderQuote(
    provider: BNPLProvider,
    customerId: string,
    amount: number
  ): Promise<BNPLQuote> {
    // Minimum amount for BNPL (typically ₦10,000)
    const MIN_BNPL_AMOUNT = 1000000; // 10,000 NGN in kobo

    if (amount < MIN_BNPL_AMOUNT) {
      return {
        eligible: false,
        totalAmount: amount,
        upfrontAmount: 0,
        installmentAmount: 0,
        numberOfInstallments: 0,
        provider: provider.id,
        reason: 'Amount below minimum threshold (₦10,000)',
      };
    }

    // Default installment structure: 25% upfront + 3 monthly payments
    const upfrontRate = 0.25;
    const numberOfInstallments = 3;
    const upfrontAmount = Math.round(amount * upfrontRate);
    const remainingAmount = amount - upfrontAmount;
    const installmentAmount = Math.round(remainingAmount / numberOfInstallments);

    // In production, this would call the provider's API
    // const response = await fetch(`${provider.config.baseUrl}/v1/bnpl/quote`, {
    //   headers: { Authorization: `Bearer ${provider.config.apiKey}` },
    //   body: JSON.stringify({ customerId, amount }),
    // });

    return {
      eligible: true,
      totalAmount: amount,
      upfrontAmount,
      installmentAmount,
      numberOfInstallments,
      provider: provider.id,
    };
  }

  /**
   * Apply for BNPL
   */
  async apply(application: BNPLApplication): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
    const provider = this.providers.get(application.provider);
    
    if (!provider || !provider.enabled) {
      return { success: false, error: 'BNPL provider not available' };
    }

    try {
      // In production, call provider API
      // const response = await fetch(`${provider.config.baseUrl}/v1/bnpl/apply`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${provider.config.apiKey}` 
      //   },
      //   body: JSON.stringify({
      //     customer_email: application.customerEmail,
      //     customer_phone: application.customerPhone,
      //     amount: application.amount,
      //     callback_url: application.callbackUrl,
      //   }),
      // });

      // Mock successful application
      return {
        success: true,
        redirectUrl: `${provider.config.baseUrl}/bnpl/apply?ref=${application.orderId}`,
      };
    } catch (error) {
      console.error('[BNPL] Application failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Application failed' 
      };
    }
  }

  /**
   * Calculate BNPL breakdown for display
   */
  calculateBreakdown(
    totalAmount: number,
    upfrontRate: number = 0.25,
    installments: number = 3
  ): {
    upfront: number;
    perInstallment: number;
    total: number;
    schedule: { date: Date; amount: number }[];
  } {
    const upfront = Math.round(totalAmount * upfrontRate);
    const remaining = totalAmount - upfront;
    const perInstallment = Math.round(remaining / installments);

    // Generate payment schedule (monthly from now)
    const schedule: { date: Date; amount: number }[] = [];
    const now = new Date();
    
    for (let i = 0; i < installments; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i + 1);
      schedule.push({ date, amount: perInstallment });
    }

    return {
      upfront,
      perInstallment,
      total: totalAmount,
      schedule,
    };
  }

  /**
   * Format amount for display (kobo to NGN)
   */
  formatAmount(kobo: number): string {
    const ngn = kobo / 100;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(ngn);
  }

  /**
   * Handle BNPL webhook
   */
  async handleWebhook(payload: BNPLWebhookPayload): Promise<void> {
    console.log('[BNPL] Webhook received:', payload.event, payload.data);

    switch (payload.event) {
      case 'installment.paid':
        // Update installment status
        // await prisma.installment.update({
        //   where: { id: payload.data.installmentId },
        //   data: { status: 'paid', paidDate: new Date() },
        // });
        break;

      case 'installment.failed':
        // Update installment status and notify merchant
        // await prisma.installment.update({
        //   where: { id: payload.data.installmentId },
        //   data: { status: 'failed' },
        // });
        break;

      case 'agreement.completed':
        // Mark agreement as completed
        // await prisma.bnplAgreement.update({
        //   where: { id: payload.data.agreementId },
        //   data: { status: 'completed' },
        // });
        break;

      case 'agreement.defaulted':
        // Mark as defaulted and trigger collection workflow
        // await prisma.bnplAgreement.update({
        //   where: { id: payload.data.agreementId },
        //   data: { status: 'defaulted' },
        // });
        break;
    }
  }
}

// Singleton instance
export const bnplService = new BNPLService();
