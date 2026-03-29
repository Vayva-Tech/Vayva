import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { PaystackService } from './paystack.service';

interface TemplatePurchaseRequest {
  merchantId: string;
  templateId: string;
  amount: number;
  email: string;
  callbackUrl: string;
}

interface TemplatePurchaseResult {
  success: boolean;
  authorization_url?: string;
  reference?: string;
  error?: string;
}

export class TemplatePurchaseService {
  constructor(
    private readonly db = prisma,
    private readonly paystackService = new PaystackService(),
  ) {}

  async initiatePurchase(request: TemplatePurchaseRequest): Promise<TemplatePurchaseResult> {
    try {
      const { merchantId, templateId, amount, email, callbackUrl } = request;

      const reference = `TMP_${Date.now()}_${merchantId.slice(0, 8)}`;

      const purchaseRecord = await this.db.templatePurchase.create({
        data: {
          merchantId,
          templateId,
          amount,
          status: 'PENDING',
          reference,
          initiatedAt: new Date(),
        },
      });

      const transaction = await this.paystackService.initializeTransaction(
        email,
        amount,
        reference,
        callbackUrl,
        { merchantId, templateId, templatePurchaseId: purchaseRecord.id },
      );

      logger.info('[TEMPLATE_PURCHASE_INIT]', {
        purchaseId: purchaseRecord.id,
        merchantId,
        templateId,
        amount,
      });

      return {
        success: true,
        authorization_url: transaction.authorization_url,
        reference: transaction.reference,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[TEMPLATE_PURCHASE_INIT_ERROR]', {
        error: errorMessage,
        merchantId: request.merchantId,
        templateId: request.templateId,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async verifyPurchase(reference: string): Promise<{
    success: boolean;
    merchantId?: string;
    templateId?: string;
    error?: string;
  }> {
    try {
      const verification = await this.paystackService.verifyTransaction(reference);

      if (verification.status !== 'success') {
        await this.db.templatePurchase.update({
          where: { reference },
          data: { status: 'FAILED', completedAt: new Date() },
        });

        return {
          success: false,
          error: 'Payment verification failed',
        };
      }

      const purchase = await this.db.templatePurchase.findUnique({
        where: { reference },
      });

      if (!purchase) {
        return {
          success: false,
          error: 'Purchase record not found',
        };
      }

      await this.applyTemplateToStore(purchase.merchantId, purchase.templateId);

      await this.db.templatePurchase.update({
        where: { reference },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          metadata: {
            paystackReference: verification.reference,
            paidAmount: verification.amount,
            paidAt: verification.paid_at,
          },
        },
      });

      logger.info('[TEMPLATE_PURCHASE_COMPLETED]', {
        purchaseId: purchase.id,
        merchantId: purchase.merchantId,
        templateId: purchase.templateId,
      });

      return {
        success: true,
        merchantId: purchase.merchantId,
        templateId: purchase.templateId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[TEMPLATE_PURCHASE_VERIFY_ERROR]', {
        error: errorMessage,
        reference,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getSwapPrice(userPlan: 'starter' | 'pro'): Promise<number> {
    return userPlan === 'starter' ? 10000 : 5000;
  }

  async applyTemplateToStore(merchantId: string, templateId: string): Promise<void> {
    try {
      const template = await this.db.template.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      await this.db.merchantSettings.upsert({
        where: { merchantId },
        update: {
          currentTemplateId: templateId,
          templateCustomizations: (template.config as unknown) || {},
        },
        create: {
          merchantId,
          currentTemplateId: templateId,
          templateCustomizations: (template.config as unknown) || {},
        },
      });

      logger.info('[TEMPLATE_APPLIED]', {
        merchantId,
        templateId,
      });
    } catch (error) {
      logger.error('[TEMPLATE_APPLY_ERROR]', {
        error: error instanceof Error ? error.message : 'Unknown error',
        merchantId,
        templateId,
      });
      throw error;
    }
  }
}
